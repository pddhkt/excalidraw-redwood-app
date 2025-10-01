# Drawing API Backend Logic Documentation

This document outlines the backend logic for the drawing management APIs in the Excalidraw Redwood App.

## Overview

The application manages three core drawing operations:
1. **Create Personal Drawing** - Creating metadata for new drawings
2. **Save Drawing** - Saving/updating drawing content to R2 storage
3. **List Drawings** - Retrieving all drawings for a user

### Storage Architecture

Based on the project overview, personal drawings follow a **hybrid storage approach**:

- **D1 Database (Metadata)**: Stores drawing metadata (ID, title, description, timestamps, user info, etc.) - Small data (<1KB per record)
- **R2 Storage (Content)**: Stores the actual Excalidraw drawing data (JSON), thumbnails, and version history - Large files (up to 10MB)

This separation optimizes:
- **Performance**: Fast metadata queries without loading large drawing files
- **Cost**: R2 is optimized for large file storage
- **Scalability**: Can handle hundreds of concurrent users efficiently

---

## 1. Create Personal Drawing API

### Purpose
Creates a new drawing metadata record in the database. This initializes a drawing without storing the actual content yet. The content is stored separately via the Save Drawing API (API #2).

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Worker
    participant SessionStore
    participant Database
    participant Functions as drawing/functions.ts

    Client->>Worker: POST /api/drawings
    Note over Client,Worker: Request with metadata<br/>(title, description, tags)

    Worker->>SessionStore: sessions.load(request)
    SessionStore-->>Worker: Return session data

    alt Session expired or invalid
        Worker->>SessionStore: sessions.remove()
        Worker-->>Client: 302 Redirect to /login
    else Session valid
        Worker->>Database: db.user.findUnique()
        Database-->>Worker: Return user object

        alt User not found
            Worker-->>Client: 401 Unauthorized
        else User found
            Worker->>Functions: createDrawing(data)
            Note over Functions: Generate UUID<br/>Validate input<br/>Set userId, title<br/>Set default values

            Functions->>Database: db.drawing.create()
            Database-->>Functions: Drawing metadata saved
            Functions-->>Worker: Return drawing object

            Worker-->>Client: 201 Created<br/>JSON: { drawing }
        end
    end
```

### Expected Request
```typescript
POST /api/drawings
Content-Type: application/json

{
  "title": "My Drawing",
  "description": "Optional description",
  "isPublic": false,
  "tags": ["sketch", "diagram"]
}
```

### Expected Response
```typescript
201 Created

{
  "drawing": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "title": "My Drawing",
    "description": "Optional description",
    "contentUrl": null,  // No content stored yet
    "thumbnailUrl": null,  // No thumbnail yet
    "isPublic": false,
    "isArchived": false,
    "tags": ["sketch", "diagram"],
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:00:00.000Z",
    "lastOpenedAt": null
  }
}
```

### Notes
- This API only creates the metadata record
- Use the Save Drawing API (PUT /api/drawings/:id/save) to store actual content

### Drawing Data Model
Based on `src/types/drawing.ts`:
```typescript
interface Drawing {
  id: string              // UUID
  userId: string          // Foreign key to User
  title: string           // Drawing title
  description?: string | null
  contentUrl?: string | null  // R2 path to drawing JSON (not the full content)
  thumbnailUrl?: string | null // R2 path to thumbnail image
  isPublic: boolean       // Visibility flag
  isArchived?: boolean    // Archive status
  tags?: string[]         // Optional tags for organization
  createdAt: Date
  updatedAt: Date
  lastOpenedAt?: Date | null
}

// Note: The 'content' field is NOT stored in D1 database
// Content is stored in R2 and accessed via contentUrl
```

---

## 2. Save Drawing API

### Purpose
Saves or updates the actual drawing content to R2 storage. This API handles the large Excalidraw JSON data and thumbnails, storing them in R2 while updating metadata in D1.

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Worker
    participant SessionStore
    participant Database
    participant Functions as drawing/functions.ts
    participant R2Utils as lib/r2-storage.ts
    participant R2Bucket

    Client->>Worker: PUT /api/drawings/:id/save
    Note over Client,Worker: Request with drawing content<br/>(Excalidraw JSON, thumbnail)

    Worker->>SessionStore: sessions.load(request)
    SessionStore-->>Worker: Return session data

    alt Session expired or invalid
        Worker->>SessionStore: sessions.remove()
        Worker-->>Client: 302 Redirect to /login
    else Session valid
        Worker->>Database: db.user.findUnique()
        Database-->>Worker: Return user object

        alt User not found
            Worker-->>Client: 401 Unauthorized
        else User found
            Worker->>Functions: getDrawing(drawingId, userId)
            Functions->>Database: db.drawing.findUnique()
            Database-->>Functions: Return drawing record
            Functions-->>Worker: Return drawing metadata

            alt Drawing not found
                Worker-->>Client: 404 Not Found
            else Drawing exists
                alt User is not owner
                    Worker-->>Client: 403 Forbidden
                else User is owner
                    Worker->>Functions: saveDrawingContent(drawingId, userId, data)

                    Functions->>R2Utils: uploadDrawingContent(bucket, userId, drawingId, content)
                    Note over R2Utils: Prepare key:<br/>drawing-content/{userId}/{drawingId}.json
                    R2Utils->>R2Bucket: bucket.put(key, JSON.stringify(content))
                    R2Bucket-->>R2Utils: Content stored
                    R2Utils-->>Functions: Return contentUrl

                    alt Thumbnail provided
                        Functions->>R2Utils: uploadThumbnail(bucket, userId, drawingId, thumbnail)
                        Note over R2Utils: Convert base64 to binary<br/>Key: drawing-thumbnails/{userId}/{drawingId}.png
                        R2Utils->>R2Bucket: bucket.put(key, imageBuffer)
                        R2Bucket-->>R2Utils: Thumbnail stored
                        R2Utils-->>Functions: Return thumbnailUrl
                    end

                    Functions->>Database: db.drawing.update()
                    Note over Functions: Update contentUrl, thumbnailUrl,<br/>updatedAt timestamp
                    Database-->>Functions: Metadata updated
                    Functions-->>Worker: Return updated drawing

                    Worker-->>Client: 200 OK<br/>JSON: { drawing, contentUrl, thumbnailUrl }
                end
            end
        end
    end
```

### Expected Request
```typescript
PUT /api/drawings/:id/save
Content-Type: application/json

{
  "content": {
    // Full Excalidraw JSON data
    "type": "excalidraw",
    "version": 2,
    "source": "...",
    "elements": [...],
    "appState": {...},
    "files": {...}
  },
  "thumbnail": "data:image/png;base64,...", // Optional base64 thumbnail
  "title": "Updated Title", // Optional - update title while saving
  "description": "Updated description" // Optional
}
```

### Expected Response
```typescript
200 OK

{
  "drawing": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "contentUrl": "drawing-content/user-uuid/uuid-here.json",
    "thumbnailUrl": "drawing-thumbnails/user-uuid/uuid-here.png",
    "isPublic": false,
    "isArchived": false,
    "tags": ["sketch", "diagram"],
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-01T10:15:30.000Z",
    "lastOpenedAt": null
  },
  "contentUrl": "https://r2-bucket.example.com/drawing-content/user-uuid/uuid-here.json",
  "thumbnailUrl": "https://r2-bucket.example.com/drawing-thumbnails/user-uuid/uuid-here.png"
}
```

### R2 Storage Structure

```
R2 Bucket: excalidraw-drawings
│
├── drawing-content/
│   └── {userId}/
│       ├── {drawingId-1}.json     // Excalidraw JSON data
│       ├── {drawingId-2}.json
│       └── ...
│
├── drawing-thumbnails/
│   └── {userId}/
│       ├── {drawingId-1}.png      // PNG thumbnail
│       ├── {drawingId-2}.png
│       └── ...
│
└── drawing-versions/               // Future: Version history
    └── {userId}/
        └── {drawingId}/
            ├── v1-{timestamp}.json
            ├── v2-{timestamp}.json
            └── ...
```

### Storage Best Practices

1. **Content Storage (R2)**:
   - Store as JSON with proper Content-Type
   - Use consistent naming: `{userId}/{drawingId}.json`
   - Enable R2 metadata for versioning info
   - Compress large files before upload

2. **Thumbnail Storage (R2)**:
   - Convert base64 to binary before storing
   - Use PNG format for quality
   - Recommended size: 400x300px
   - Set cache headers for CDN

3. **Auto-save Strategy**:
   - Debounce saves (e.g., every 5 seconds)
   - Track dirty state on client
   - Show "Saving..." indicator
   - Handle offline/online transitions

4. **Performance Optimization**:
   - Use R2 presigned URLs for direct uploads (future)
   - Implement client-side compression
   - Cache thumbnails aggressively
   - Lazy-load drawing content

---

## 3. List Drawings API

### Purpose
Retrieves all drawings belonging to the authenticated user.

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Worker
    participant SessionStore
    participant Database
    participant Functions as drawing/functions.ts

    Client->>Worker: GET /api/drawings
    Note over Client,Worker: Optional query params:<br/>?archived=false&tag=sketch&sortBy=updated

    Worker->>SessionStore: sessions.load(request)
    SessionStore-->>Worker: Return session data

    alt Session expired or invalid
        Worker->>SessionStore: sessions.remove()
        Worker-->>Client: 302 Redirect to /login
    else Session valid
        Worker->>Database: db.user.findUnique()
        Database-->>Worker: Return user object

        alt User not found
            Worker-->>Client: 401 Unauthorized
        else User found
            Worker->>Functions: getUserDrawings(userId, options)
            Note over Functions: Build query with filters:<br/>WHERE userId = user.id<br/>AND isArchived = false<br/>AND tags contains tag<br/>ORDER BY updatedAt DESC

            Functions->>Database: db.drawing.findMany()
            Database-->>Functions: Return drawing records
            Functions->>Database: db.drawing.count()
            Database-->>Functions: Return total count
            Functions-->>Worker: Return { drawings, total }

            Worker-->>Client: 200 OK<br/>JSON: { drawings: [...], total: N }
        end
    end
```

### Expected Request
```typescript
GET /api/drawings
// or with filters
GET /api/drawings?archived=false&tag=sketch
```

### Expected Response
```typescript
200 OK

{
  "drawings": [
    {
      "id": "uuid-1",
      "userId": "user-uuid",
      "title": "Drawing 1",
      "description": null,
      "contentUrl": "drawing-content/user-uuid/uuid-1.json",
      "thumbnailUrl": "drawing-thumbnails/user-uuid/uuid-1.png",
      "isPublic": false,
      "isArchived": false,
      "tags": ["sketch"],
      "createdAt": "2025-10-01T09:00:00.000Z",
      "updatedAt": "2025-10-01T09:30:00.000Z",
      "lastOpenedAt": "2025-10-01T09:30:00.000Z"
    },
    {
      "id": "uuid-2",
      "userId": "user-uuid",
      "title": "Drawing 2",
      "description": "My second drawing",
      "contentUrl": "drawing-content/user-uuid/uuid-2.json",
      "thumbnailUrl": null,  // No thumbnail generated yet
      "isPublic": true,
      "isArchived": false,
      "tags": ["diagram", "sketch"],
      "createdAt": "2025-09-30T15:00:00.000Z",
      "updatedAt": "2025-10-01T08:00:00.000Z",
      "lastOpenedAt": null
    }
  ],
  "total": 2
}
```

### Notes
- This API returns only metadata, not the actual drawing content
- To load a drawing's content, fetch from R2 using the `contentUrl`
- Thumbnails can be loaded directly from `thumbnailUrl` for preview

---

## Common Authentication Flow

Both APIs share the same authentication mechanism:

```mermaid
sequenceDiagram
    participant Client
    participant Worker
    participant SessionStore
    participant SessionDO as Session Durable Object
    participant Database

    Client->>Worker: API Request with cookies
    Worker->>SessionStore: Load session from request
    SessionStore->>SessionDO: Retrieve session by token
    SessionDO-->>SessionStore: Return session data
    SessionStore-->>Worker: Return session object

    alt Session exists
        Worker->>Worker: Check if session.expiresAt < now()

        alt Session expired
            Worker->>SessionStore: Remove session
            SessionStore->>SessionDO: Delete session
            Worker-->>Client: 302 Redirect to /login
        else Session valid
            Worker->>Database: Find user by session.userId
            Database-->>Worker: Return user object
            Worker->>Worker: Attach user to context
            Note over Worker: ctx.user = user<br/>ctx.session = session
        end
    else No session
        Worker-->>Client: 302 Redirect to /login
    end
```

---

## Database Schema (Future Implementation)

**Note:** The Drawing table is not yet implemented in the Prisma schema. The expected schema follows the **hybrid storage approach**:

```prisma
model Drawing {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Metadata only (stored in D1)
  title        String
  description  String?
  contentUrl   String?   // R2 path: drawing-content/{userId}/{drawingId}.json
  thumbnailUrl String?   // R2 path: drawing-thumbnails/{userId}/{drawingId}.png

  // Settings
  isPublic     Boolean   @default(false)
  isArchived   Boolean   @default(false)
  tags         String[]  // SQLite stores as comma-separated or JSON

  // Timestamps
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastOpenedAt DateTime?

  @@index([userId, updatedAt])
  @@index([userId, isArchived])
  @@index([isPublic])
}

// Add to User model:
model User {
  // ... existing fields
  drawings Drawing[]
}
```

### Why Hybrid Storage?

**D1 Database** stores:
- Drawing metadata (title, description, settings)
- User references and permissions
- Timestamps for sorting and filtering
- URLs to R2 content

**R2 Storage** stores:
- Actual Excalidraw JSON (can be 1-10MB)
- Thumbnail images
- Future: Version history

**Benefits**:
1. **Fast Queries**: List drawings without loading large JSON
2. **Cost Effective**: R2 is cheaper for large files
3. **Scalability**: Can handle thousands of drawings efficiently
4. **Performance**: Metadata queries are <50ms

---

## Error Handling

### Common Error Responses

| Status Code | Scenario | Response |
|-------------|----------|----------|
| 302 | Session expired or invalid | Redirect to `/login` |
| 401 | Unauthorized (no valid user) | `{ "error": "Unauthorized" }` |
| 400 | Invalid request data | `{ "error": "Invalid request", "details": "..." }` |
| 404 | Drawing not found (for individual ops) | `{ "error": "Drawing not found" }` |
| 500 | Internal server error | `{ "error": "Internal server error" }` |

---

## Implementation Status

- ✅ TypeScript interfaces defined (`src/types/drawing.ts`)
- ✅ UI component ready (`src/app/components/drawing/DrawingCard.tsx`)
- ❌ Database schema not yet added to Prisma
- ❌ API routes not yet implemented
- ❌ Backend functions not yet created
- ❌ R2 bucket not yet configured

## Next Steps

### 1. Setup R2 Storage
```bash
# Create R2 bucket via Cloudflare Dashboard or Wrangler
wrangler r2 bucket create excalidraw-drawings

# Add R2 binding to wrangler.toml
[[r2_buckets]]
binding = "DRAWINGS_BUCKET"
bucket_name = "excalidraw-drawings"
```

### 2. Update Database Schema
Add `Drawing` model to `prisma/schema.prisma` with hybrid storage fields:
```bash
npx prisma migrate dev --name add_drawing_model_with_r2
```

### 3. Create Backend Functions
Create `src/app/pages/drawing/functions.ts`:
- `createDrawing()` - Create metadata in D1
- `saveDrawingContent()` - Save content to R2 + update metadata
- `getDrawing()` - Fetch metadata from D1
- `getDrawingContent()` - Fetch content from R2
- `listDrawings()` - List metadata from D1
- `updateDrawingMetadata()` - Update title, description, tags
- `deleteDrawing()` - Delete from both D1 and R2

### 4. Create API Routes
Create `src/app/pages/drawing/routes.ts`:
- POST `/api/drawings` - Create new drawing
- PUT `/api/drawings/:id/save` - Save drawing content to R2
- GET `/api/drawings` - List all drawings
- GET `/api/drawings/:id` - Get drawing metadata
- GET `/api/drawings/:id/content` - Get drawing content from R2
- PATCH `/api/drawings/:id` - Update metadata
- DELETE `/api/drawings/:id` - Delete drawing

### 5. Update Worker Configuration
Update `src/worker.tsx` to:
- Import and register drawing routes
- Add R2 bucket to context
- Handle R2 storage errors

### 6. Create R2 Helper Utilities
Create `src/lib/r2-storage.ts`:
```typescript
export async function uploadDrawingContent(
  bucket: R2Bucket,
  userId: string,
  drawingId: string,
  content: object
): Promise<string>

export async function uploadThumbnail(
  bucket: R2Bucket,
  userId: string,
  drawingId: string,
  base64Image: string
): Promise<string>

export async function getDrawingContent(
  bucket: R2Bucket,
  contentUrl: string
): Promise<object>

export async function deleteDrawingFiles(
  bucket: R2Bucket,
  userId: string,
  drawingId: string
): Promise<void>
```

### 7. Update TypeScript Types
Update `src/types/drawing.ts` to match the hybrid storage model:
- Change `content: string` to `contentUrl?: string | null`
- Add `thumbnailUrl?: string | null`

### 8. Update UI Components
- Modify `DrawingCard.tsx` to use `thumbnailUrl` from R2
- Create loading states for R2 content fetching
- Handle missing thumbnails gracefully

### 9. Testing
- Test R2 upload/download operations
- Test metadata operations in D1
- Test error handling for R2 failures
- Test large file uploads (up to 10MB)

### 10. Integration with Excalidraw
- Load drawing content from R2 when opening editor
- Auto-save to R2 with debouncing
- Show save status indicator
- Handle offline scenarios

---

## Additional APIs (Future Enhancement)

### Get Drawing Content
```
GET /api/drawings/:id/content
```
Fetches the actual Excalidraw JSON from R2. Used when opening a drawing in the editor.

**Response:**
```json
{
  "content": {
    "type": "excalidraw",
    "version": 2,
    "elements": [...],
    "appState": {...},
    "files": {...}
  }
}
```

### Update Drawing Metadata
```
PATCH /api/drawings/:id
```
Updates metadata only (title, description, tags) without touching R2 content.

---

**Document Version:** 2.0
**Last Updated:** 2025-10-01
**Author:** Claude Code
