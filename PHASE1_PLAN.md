# Phase 1: Authentication & Foundation - Corrected Architecture

## Current State Analysis
RedwoodJS with RedwoodSDK already provides:
- ✅ **WebAuthn/Passkey authentication** using @simplewebauthn
- ✅ **Session management** with Durable Objects
- ✅ **Basic protected routes** (e.g., /protected route)
- ✅ **Session persistence** with automatic token handling
- ❌ **No multi-tier access control** (Guest → Registered → Team Member)
- ❌ **No testing infrastructure**
- ❌ **No user dashboard/landing pages**

## Architecture Pattern: MVC with Server Components

### MVC Implementation in RedwoodJS/RSC Context
```
MODEL (Backend)           CONTROLLER (Hooks/Store)       VIEW (Components)
├── Prisma Models        ├── Server Functions           ├── React Components
├── Database Layer       ├── Session Management         ├── UI Components
├── Business Logic       ├── Auth Middleware            ├── Pages
└── API Functions        └── State Management           └── Layouts
```

## Corrected User Tiers (from PROJECT_OVERVIEW.md)

### Guest User
- Temporary drawings (localStorage storage)
- Limited to 1 drawing maximum
- Basic drawing features only
- Can view publicly shared drawings
- **Prompted to register when attempting to save**

### Registered User (WebAuthn)
- Personal workspace with unlimited storage
- Can create, save, and organize personal drawings
- Can publish drawings to shareable/collaborative spaces
- Receives invitations to team spaces

### Team Member
- Access to specific team rooms and projects
- Can collaborate in real-time on team drawings
- **Role-based permissions within teams** (view/comment/edit/admin)

## Key Implementation Decisions

### 1. Session Management & Refresh Tokens
**Session Duration Configuration:**
- **Default (no remember me):** 1 day (86,400,000 ms)
- **Remember me enabled:** 30 days (2,592,000,000 ms)
- **Phase 1 Strategy:** Sliding session with activity-based renewal
  - Session extends on each activity within last 25% of lifetime
  - Store `lastActivity` timestamp in session
  - **No separate refresh token implementation in Phase 1**

### 2. Guest Limitations & Upgrade Flow
- **Guest can create 1 drawing** stored in localStorage
- **Must register to create additional drawings**
- **Cannot invite others** (Team Members also cannot invite)
- **Can read publicly shared drawings** via public links
- **Guest-to-Registered upgrade** preserves localStorage drawing

### 3. Drawing Access Models (from PROJECT_OVERVIEW.md)
```
Drawing Types
│
├── Personal (Private)
│   └── No sharing, cloud storage only
│
└── Shareable
    ├── Read-Only ────────────► Static delivery
    ├── Anyone Can Edit ──────► WebSocket when 2+ users
    ├── Author-Only Edit ─────► WebSocket when author present
    └── Specific Users Edit ──► WebSocket for permitted users
```

## Phase 1 Backend API Specifications

### Authentication APIs (Server Functions)

```typescript
// src/app/pages/auth/functions.ts

// Enhanced registration with remember me
export async function registerUser(
  username: string,
  rememberMe: boolean = false
): Promise<{ success: boolean; userId?: string; error?: string }>

// Enhanced login with remember me
export async function loginUser(
  username: string,
  rememberMe: boolean = false
): Promise<{ success: boolean; error?: string }>

// Create guest session
export async function createGuestSession(): Promise<{
  guestId: string;
  expiresAt: number;
}>

// Upgrade guest to registered user
export async function upgradeGuestToUser(
  username: string,
  guestId: string
): Promise<{ success: boolean; error?: string }>

// Refresh session (sliding window)
export async function refreshSession(): Promise<{
  success: boolean;
  expiresAt?: number
}>

// Get current user with access tier
export async function getCurrentUser(): Promise<{
  user: User | null;
  tier: 'guest' | 'registered' | 'team_member';
  permissions: Permission[];
}>

// Logout
export async function logoutUser(): Promise<void>
```

### Drawing Management APIs

```typescript
// src/app/pages/drawings/functions.ts

// List user's drawings
export async function listDrawings(
  filter?: 'owned' | 'shared' | 'recent'
): Promise<Drawing[]>

// Create drawing (check guest limit)
export async function createDrawing(
  title: string,
  accessMode: 'personal' | 'shared' = 'personal'
): Promise<{ drawing?: Drawing; error?: string }>

// Get drawing with access check
export async function getDrawing(
  drawingId: string,
  shareToken?: string // For public access
): Promise<{ drawing?: DrawingWithAccess; error?: string }>

// Update drawing permissions
export async function updateDrawingSharing(
  drawingId: string,
  settings: {
    isPublic: boolean;
    allowGuestView: boolean;
    shareToken?: string;
    accessMode: 'read_only' | 'anyone_edit' | 'author_edit' | 'specific_users';
  }
): Promise<{ success: boolean; shareUrl?: string }>

// Copy drawing (personal to shareable)
export async function copyDrawingToShareable(
  sourceId: string,
  title: string
): Promise<{ drawing?: Drawing; error?: string }>

// Delete drawing (owner only)
export async function deleteDrawing(
  drawingId: string
): Promise<{ success: boolean }>
```

### Team & Room Management APIs

```typescript
// src/app/pages/teams/functions.ts

// List teams user belongs to
export async function listUserTeams(): Promise<Team[]>

// List team rooms
export async function listTeamRooms(
  teamId: string
): Promise<Room[]>

// Create team room (team members only)
export async function createTeamRoom(
  teamId: string,
  name: string,
  isPublic: boolean = false
): Promise<{ room?: Room; error?: string }>

// Join team room
export async function joinTeamRoom(
  roomId: string
): Promise<{ success: boolean; error?: string }>

// Leave team room
export async function leaveTeamRoom(
  roomId: string
): Promise<{ success: boolean }>

// Get room details with permissions
export async function getRoomDetails(
  roomId: string
): Promise<{ room?: RoomWithPermissions; error?: string }>
```

## Middleware & Permission Guards

```typescript
// src/auth/middleware.ts

// Access tier middleware
export function requireTier(minTier: 'guest' | 'registered' | 'team_member') {
  return async ({ ctx, response }) => {
    if (!hasMinimumTier(ctx.user?.tier, minTier)) {
      return new Response('Forbidden', { status: 403 });
    }
  };
}

// Permission guards based on PROJECT_OVERVIEW
export const guards = {
  canCreateDrawing: (user: User | null) => {
    if (!user) return { allowed: false, limit: 1 }; // Guest limit
    return { allowed: true, limit: null };
  },

  canViewDrawing: (user: User | null, drawing: Drawing) =>
    drawing.isPublic ||
    (user && (user.id === drawing.ownerId ||
              drawing.viewerIds.includes(user.id))),

  canEditDrawing: (user: User | null, drawing: Drawing) => {
    if (!user || drawing.accessMode === 'read_only') return false;
    if (drawing.accessMode === 'anyone_edit') return true;
    if (drawing.accessMode === 'author_edit') return user.id === drawing.ownerId;
    return user.id === drawing.ownerId || drawing.editorIds.includes(user.id);
  },

  canJoinTeamRoom: (user: User, team: Team) =>
    user.tier === 'team_member' && team.memberIds.includes(user.id)
};
```

## Database Schema Updates (Aligned with PROJECT_OVERVIEW)

```prisma
model User {
  id            String      @id @default(uuid())
  username      String      @unique
  tier          UserTier    @default(REGISTERED)
  createdAt     DateTime    @default(now())
  lastLoginAt   DateTime?
  lastActivity  DateTime    @default(now())

  credentials   Credential[]
  drawings      Drawing[]
  teamMemberships TeamMembership[]
  permissions   Permission[]
}

enum UserTier {
  GUEST
  REGISTERED
  TEAM_MEMBER
}

model Drawing {
  id            String        @id @default(uuid())
  title         String
  ownerId       String
  owner         User          @relation(fields: [ownerId], references: [id])
  accessMode    AccessMode    @default(PERSONAL)
  isPublic      Boolean       @default(false)
  shareToken    String?       @unique
  drawingData   Json?         // Excalidraw JSON
  thumbnail     String?       // Base64 thumbnail
  teamId        String?
  team          Team?         @relation(fields: [teamId], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  permissions   Permission[]
}

enum AccessMode {
  PERSONAL
  READ_ONLY
  ANYONE_EDIT
  AUTHOR_EDIT
  SPECIFIC_USERS
}

model Team {
  id            String      @id @default(uuid())
  name          String
  settings      Json?
  createdAt     DateTime    @default(now())

  members       TeamMembership[]
  drawings      Drawing[]
  rooms         Room[]
}

model TeamMembership {
  id            String      @id @default(uuid())
  teamId        String
  team          Team        @relation(fields: [teamId], references: [id])
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  role          TeamRole    @default(MEMBER)
  joinedAt      DateTime    @default(now())

  @@unique([teamId, userId])
}

enum TeamRole {
  ADMIN
  MEMBER
  VIEWER
}

model Room {
  id            String      @id @default(uuid())
  name          String
  teamId        String
  team          Team        @relation(fields: [teamId], references: [id])
  isPublic      Boolean     @default(false)
  createdAt     DateTime    @default(now())
}

model Permission {
  id            String        @id @default(uuid())
  drawingId     String
  drawing       Drawing       @relation(fields: [drawingId], references: [id])
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  level         PermissionLevel
  grantedAt     DateTime      @default(now())

  @@unique([drawingId, userId])
}

enum PermissionLevel {
  VIEW
  COMMENT
  EDIT
  ADMIN
}

// Enhanced Session model for sliding window
model SessionData {
  id            String      @id @default(uuid())
  userId        String?     // null for guest sessions
  guestId       String?     // for guest tracking
  rememberMe    Boolean     @default(false)
  createdAt     DateTime    @default(now())
  lastActivity  DateTime    @default(now())
  expiresAt     DateTime
}
```

## Testing Infrastructure & Requirements

### Testing Coverage Requirements
- **100% pass rate** - All tests must pass (no failures allowed)
- **Valuable tests only** - Each test must verify actual functionality
- **Critical paths coverage:**
  - Guest → Registered upgrade flow
  - Drawing access mode validation
  - Team membership and permissions
  - Session management and expiry

### Unit Tests (Vitest)
```
tests/unit/
├── auth/
│   ├── middleware.test.ts
│   ├── permissions.test.ts
│   └── session.test.ts
├── drawings/
│   ├── access-control.test.ts
│   ├── sharing.test.ts
│   └── crud.test.ts
└── teams/
    ├── membership.test.ts
    └── rooms.test.ts
```

### Integration Tests (Hurl)
```
tests/integration/
├── auth-flows.hurl
├── drawing-workflows.hurl
├── team-operations.hurl
└── guest-upgrade.hurl
```

### E2E Tests (Playwright)
```
tests/e2e/
├── guest-journey.spec.ts
├── registered-user.spec.ts
├── team-collaboration.spec.ts
└── drawing-sharing.spec.ts
```

### Staging Environment (Mandatory)
- Full Cloudflare Workers environment
- Test data seeding
- CI/CD pipeline with staging deployment
- Automated test execution on staging

## File Structure to Create

```
src/
├── auth/
│   ├── middleware.ts       # Access tier middleware & guards
│   ├── permissions.ts      # Drawing & team permissions
│   ├── utils.ts           # Auth utilities
│   └── session.ts         # Sliding session management
├── app/
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx      # User landing page
│   │   │   └── routes.ts
│   │   ├── drawings/
│   │   │   ├── DrawingList.tsx    # Personal & shared drawings
│   │   │   ├── functions.ts       # Drawing APIs
│   │   │   └── routes.ts
│   │   ├── teams/
│   │   │   ├── TeamList.tsx       # User's teams
│   │   │   ├── TeamRooms.tsx      # Team rooms
│   │   │   ├── functions.ts       # Team APIs
│   │   │   └── routes.ts
│   │   ├── auth/
│   │   │   ├── Register.tsx       # Enhanced registration
│   │   │   ├── GuestUpgrade.tsx   # Guest → Registered
│   │   │   ├── functions.ts       # Auth APIs
│   │   │   └── routes.ts
│   │   └── shared/
│   │       ├── PublicDrawing.tsx  # Public drawing view
│   │       └── routes.ts
│   └── components/
│       ├── Layout.tsx             # Main layout with navigation
│       ├── Navigation.tsx         # Tier-based navigation
│       ├── GuestPrompt.tsx        # Guest upgrade prompts
│       └── DrawingCard.tsx        # Drawing thumbnail component
tests/
├── unit/
├── integration/
└── e2e/
```

## Implementation Timeline

### Week 1: Backend Foundation
1. **Day 1-2**: Database schema updates and migrations
2. **Day 3-4**: Authentication APIs with guest/registered tiers
3. **Day 5**: Drawing and team management APIs

### Week 2: UI Components (MVC Pattern)
1. **Day 1-2**: Layout, Navigation, and Dashboard components
2. **Day 3-4**: Drawing list and team pages
3. **Day 5**: Guest upgrade flow and public sharing

### Week 3: Testing & Staging
1. **Day 1-2**: Unit and integration tests
2. **Day 3-4**: E2E tests with Playwright
3. **Day 5**: Staging deployment and CI/CD setup

## Success Criteria
1. **Guest users** can create 1 drawing and view public content
2. **Registered users** can create unlimited drawings and join teams
3. **Team members** can access team rooms with proper permissions
4. **Drawing access modes** work correctly (personal/shared variants)
5. **Session management** handles expiry with sliding window
6. **Guest upgrade flow** preserves localStorage drawing
7. **All tests pass** with 100% success rate
8. **Staging environment** deployed and functional

## Next Steps After Phase 1
- **Phase 2**: Real-time collaboration infrastructure (WebSocket integration)
- **Phase 3**: Excalidraw integration with drawing modes
- **Phase 4**: Performance optimization & team management features