# Excalidraw with Rooms

## Project Overview

**Purpose:** Create a centralized place to store and organize visual project planning materials with team collaboration features.

**Status:** Idea Phase
**Priority:** Medium
**Progress:** 0% → Initial Setup
**Created:** 2025-01-24

## Core Concept & Goals

This project extends the functionality of Excalidraw by adding robust organization, collaboration, and project management features specifically designed for visual project planning and team coordination. Building on existing Excalidraw capabilities, the focus is on implementing the organization and collaboration features that are currently missing from the standard implementation.

The main objective is to provide a more structured and interactive environment for teams to create, share, and manage visual project documentation and wireframes with enhanced collaborative capabilities.

## Key Features & Requirements

### Core Collaboration Features
- **Real-time collaborative drawing** - Multiple users can draw simultaneously
- **Room-based organization system** - Separate spaces for different projects/teams
- **Project folder structure** - Hierarchical organization of drawings and assets
- **Version history for drawings** - Track changes and revert to previous versions
- **Commenting and feedback system** - Inline discussions on drawings

### Content Management
- **Multi-format export capabilities** - Export drawings in various formats (PNG, SVG, PDF)
- **Template library for UI elements** - Pre-built components and templates
- **Project management tool integration** - Connect with external PM tools

### Enhanced User Experience
- **Centralized storage** - All project materials in one place
- **Team workspace management** - User roles and permissions
- **Search and discovery** - Find drawings and projects easily

## Technical Architecture

### Frontend Stack
- **React** - Core UI framework
- **Vite** - Build tool and development server
- **Excalidraw** - Core drawing functionality
- **TypeScript** - Type safety and development experience

### Backend Infrastructure (RedwoodSDK + Cloudflare)
- **RedwoodSDK** - Full-stack framework
- **Cloudflare Workers** - Serverless compute platform
- **WebSockets** - Real-time collaboration
- **Durable Objects** - Session management and real-time state

### Data Layer
- **Prisma** - Database ORM
- **D1** - Cloudflare's SQLite database
- **R2** - Object storage for files and drawings

### Authentication & Security
- **Passkey authentication (WebAuthn)** - Modern, secure authentication
- **Session management** - User state and permissions via Durable Objects
- **Multi-tier access control** - Guest, registered, team, and organization levels
- **Progressive authentication** - Start as guest, upgrade when saving is needed

## Authentication & Access Control

### User Access Tiers

**Guest User**
- Can create temporary drawings (session-based storage)
- Limited to basic drawing features
- Prompted to register when attempting to save
- Can view shared drawings without authentication

**Registered User (WebAuthn)**
- Personal workspace with unlimited storage
- Can create, save, and organize personal drawings
- Can publish drawings to shareable/collaborative spaces
- Receives invitations to team spaces

**Team Member**
- Access to specific team rooms and projects
- Can collaborate in real-time on team drawings
- Role-based permissions (view, comment, edit, admin)

**Organization Admin**
- Manages organization-wide settings and permissions
- Can create team spaces and assign members
- Access to usage analytics and billing

### Simplified Drawing Access Models

**System Overview:**
```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (Vite + React + Excalidraw)              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKERS                        │
│                      (API Gateway)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Drawing  │  │Permission│  │ Storage  │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────┬──────────────┬──────────────┬──────────────┬──────────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌─────────┐
│   D1    │  │   R2    │  │   Durable    │  │WebSocket│
│Database │  │ Storage │  │   Objects    │  │ Handler │
└─────────┘  └─────────┘  └──────────────┘  └─────────┘
```

**Drawing Types (Simplified):**
```
Drawing Types
│
├── Personal (Private)
│   └── No sharing, local/cloud storage only
│
└── Shareable
    ├── Read-Only ────────────► No WebSocket, Static delivery
    ├── Anyone Can Edit ──────► WebSocket when 2+ users
    ├── Author-Only Edit ─────► WebSocket when author present
    └── Specific Users Edit ──► WebSocket for permitted users
```

**Personal Drawings**
- Single-user drawings with local/cloud storage
- No WebSocket overhead or real-time infrastructure
- Fast loading and performance-optimized
- Private by default

**Shareable Drawings (with Author-Controlled Permissions)**

Authors can set any of these permission levels:

- **Read-Only**: View mode using Excalidraw's built-in feature
  - No editing allowed
  - No WebSocket required (static content delivery)
  - Available to guests, registered users, and team members

- **Anyone Can Edit**:
  - Any user with the link can edit (including guests if enabled)
  - Full WebSocket activates when 2+ users are present
  - Real-time collaborative drawing with live cursors

- **Author-Only Edit**:
  - Only the author can make changes
  - Others have view access
  - WebSocket only active when author is present and editing

- **Specific Users Can Edit**:
  - Author defines list of users who can edit
  - Others get read-only access
  - Full collaboration features for permitted users

### Performance-Optimized Loading Strategy

**User Flow State Machine:**
```
     ┌─────────┐
     │  Guest  │
     └────┬────┘
          │ Create drawing
          ▼
    ┌──────────┐     Register    ┌────────────┐
    │ Personal │◄─────────────────│ Registered │
    │ Drawing  │                  │    User    │
    └─────┬────┘                  └──────┬─────┘
          │                              │
          │ Convert to shareable         │
          ▼                              ▼
    ┌──────────────────────────────────────┐
    │           Shareable Drawing          │
    │  ┌─────────────────────────────────┐ │
    │  │    Permission Settings:         │ │
    │  │    □ Read-Only                  │ │
    │  │    □ Anyone Can Edit            │ │
    │  │    □ Author-Only Edit           │ │
    │  │    □ Specific Users Edit        │ │
    │  └─────────────────────────────────┘ │
    └──────────────────────────────────────┘
```

**Smart Resource Loading Based on Permissions:**
```
Drawing Load Decision Tree
│
├── Is Personal?
│   └── Yes ─► Local Storage Only (No WebSocket)
│
└── Is Shareable?
    │
    ├── Check Permission Type
    │   │
    │   ├── Read-Only ─────────► Static CDN Delivery
    │   │                         Cache-Control: public
    │   │
    │   ├── Author-Only Edit ──► Check if Author Present
    │   │                         │
    │   │                         ├── Yes ─► Enable WebSocket
    │   │                         └── No ──► Static Delivery
    │   │
    │   └── Edit-Enabled ──────► Count Active Users
    │                             │
    │                             ├── 0 Users ──► Static + Prepare DO
    │                             ├── 1 User ───► Data Only (Lazy WS)
    │                             └── 2+ Users ─► Full WebSocket
    │
    └── Resource Allocation
        │
        ├── Static: 0ms overhead
        ├── Lazy WS: Connect on 2nd user
        └── Active WS: <100ms latency
```

## Backend Architecture

### Service Layer Architecture
```
┌─────────────────────────────────────────────────────┐
│                   API Routes                        │
├─────────────────────────────────────────────────────┤
│ POST   /api/auth/register                          │
│ POST   /api/auth/login                             │
│ POST   /api/auth/guest                             │
│                                                     │
│ GET    /api/drawings/:id                           │
│ POST   /api/drawings                               │
│ PUT    /api/drawings/:id                           │
│ DELETE /api/drawings/:id                           │
│ POST   /api/drawings/:id/share                     │
│ POST   /api/drawings/:id/copy                      │
│                                                     │
│ GET    /api/share/:linkCode                        │
│ WS     /api/realtime/:sessionId                    │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  Service Layer                      │
├──────────────┬──────────────┬──────────────────────┤
│AuthService   │DrawingService│PermissionService     │
├──────────────┼──────────────┼──────────────────────┤
│register()    │create()      │checkAccess()         │
│authenticate()│get()         │canView()             │
│createGuest() │update()      │canEdit()             │
│upgradeGuest()│delete()      │isOwner()             │
│validateToken()│convertShare()│validateSettings()    │
└──────────────┴──────────────┴──────────────────────┘
```

### Core Services

**AuthService** - WebAuthn + Session Management
```javascript
class AuthService {
  - registerUser(webauthnCredential)
  - authenticateUser(credential)
  - createGuestSession()
  - upgradeGuestToUser(sessionId, credential)
  - validateSession(sessionToken)
}
```

**DrawingService** - Core CRUD + Permissions
```javascript
class DrawingService {
  - createDrawing(userId, type='personal')
  - getDrawing(drawingId, userId) // checks permissions
  - updateDrawing(drawingId, userId, data) // validates edit rights
  - convertToShareable(drawingId, shareSettings)
  - copyDrawing(sourceId, targetType, userId)
  - deleteDrawing(drawingId, userId)
}
```

**PermissionService** - Access Control
```javascript
class PermissionService {
  - checkAccess(drawingId, userId, requiredLevel)
  - canView(drawingId, userId)
  - canEdit(drawingId, userId)
  - isOwner(drawingId, userId)
  - validateShareSettings(settings)
}
```

### Real-time Collaboration Architecture
```
┌────────────────────────────────────────────────┐
│            Durable Object (Room)               │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │         Active Users Map                 │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐      │ │
│  │  │ User1  │ │ User2  │ │ Guest3 │ ...  │ │
│  │  └────────┘ └────────┘ └────────┘      │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │          Drawing State (CRDT)            │ │
│  │   - Current drawing data                 │ │
│  │   - Pending operations queue             │ │
│  │   - Version counter                      │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │         Broadcast Manager                │ │
│  │   - Cursor positions                     │ │
│  │   - Drawing deltas                       │ │
│  │   - User presence                        │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    WebSocket   WebSocket   WebSocket
    Client 1    Client 2    Client 3
```

### Request Flow: Loading a Shared Drawing
```
Client Request
     │
     ▼
┌─────────────────────────────────────┐
│ GET /api/drawings/:id?token=xyz    │
└─────────────┬───────────────────────┘
              │
              ▼
         [Auth Check]
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
[Guest Session]    [User Session]
    │                    │
    └─────────┬──────────┘
              │
              ▼
      [Permission Check]
              │
    ┌─────────┼──────────┬──────────┬───────────┐
    ▼         ▼          ▼          ▼           ▼
Read-Only  Author-Edit  Anyone   Specific    Denied
    │         │          Edit      Users        │
    │         │           │         │           │
    ▼         ▼           ▼         ▼           ▼
 Static    Check if    Check     Check      Return
 Content   Author      Users     Permission  Error
    │      Present       │          │
    │         │          │          │
    │    ┌────┴───┐ ┌────┴───┐ ┌───┴────┐
    │    │Yes│ No │ │1  │ 2+ │ │Yes│ No │
    │    └─┬─┴──┬─┘ └─┬─┴──┬─┘ └─┬─┴──┬─┘
    │      │    │     │    │     │    │
    ▼      ▼    ▼     ▼    ▼     ▼    ▼
Return  Enable Static Data Enable Data Static
Data     WS    Only   Only  WS   +WS  Only
```

### Data Flow for Collaboration
```
User Action (Drawing Change)
            │
            ▼
    [Client Validation]
            │
            ▼
    WebSocket Message
            │
            ▼
┌──────────────────────┐
│   Durable Object     │
│  ┌────────────────┐  │
│  │ Validate Perms │  │
│  └────────┬───────┘  │
│           ▼          │
│  ┌────────────────┐  │
│  │  Apply CRDT    │  │
│  └────────┬───────┘  │
│           ▼          │
│  ┌────────────────┐  │
│  │Broadcast Delta │  │
│  └────────┬───────┘  │
└───────────┬──────────┘
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
 Client1 Client2 Client3
            │
            ▼
    [Every 5 seconds]
            │
            ▼
    Persist to R2
```

### Security Model
```
┌─────────────────────────────────────┐
│         Request Pipeline            │
├─────────────────────────────────────┤
│                                     │
│  1. Rate Limiting (Cloudflare)      │
│     └─► 100 req/min per IP         │
│                                     │
│  2. Auth Validation (Workers)       │
│     ├─► Valid session token        │
│     └─► Guest session creation     │
│                                     │
│  3. Permission Check (Service)      │
│     ├─► Drawing ownership          │
│     ├─► Share settings validation  │
│     └─► User in specific list      │
│                                     │
│  4. Resource Access (Storage)       │
│     ├─► D1 for metadata           │
│     └─► R2 for drawing data       │
│                                     │
│  5. Real-time Validation (DO)       │
│     └─► Re-verify on WS connect   │
│                                     │
└─────────────────────────────────────┘
```

### Storage Strategy
```
Drawing Data Storage
│
├── D1 Database (Metadata)
│   ├── Drawing info, permissions
│   ├── User sessions, share links
│   └── Small data (<1KB per record)
│
├── R2 Storage (Large Files)
│   ├── Full drawing data (JSON)
│   ├── Thumbnails and previews
│   ├── Version history snapshots
│   └── Template assets
│
└── Durable Objects (Live State)
    ├── Active drawing state
    ├── Real-time user presence
    ├── Pending operations queue
    └── Conflict resolution data
```

## User Workflows

### Personal-to-Shareable Workflow (Recommended)
1. **Personal Creation** - User starts with a personal drawing (fast, local)
2. **Iterate Privately** - Refine ideas without collaboration overhead
3. **Copy to Share** - When ready, copy drawing to shareable space
4. **Set Permissions** - Choose sharing level (view-only, collaborative, team)
5. **Collaborate** - Real-time features activate when multiple users join

### Room Creation & Management
1. User creates a new room for a project
2. Invites team members with appropriate permissions
3. Sets up project structure and templates
4. Configures integration with external tools

### Collaborative Drawing Sessions
1. Users join a room (WebSocket connects automatically)
2. Real-time collaborative drawing with live cursors
3. Comments and feedback during drawing sessions
4. Auto-save and version tracking
5. Export and sharing capabilities

### Guest-to-Registered Journey
1. **Guest visits** - Can immediately start drawing
2. **Temporary session** - Drawing stored in browser session
3. **Save prompt** - When attempting to save, prompted to register
4. **WebAuthn registration** - Quick, passwordless account creation
5. **Migration** - Session data moved to personal workspace

### Project Organization
1. Create folder hierarchies for different project phases
2. Tag and categorize drawings
3. Search and filter project materials
4. Archive completed projects

### Integration Workflows
1. Export drawings to project management tools
2. Embed drawings in documentation
3. Generate reports and presentations
4. Sync with external file storage

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] RedwoodSDK project setup
- [x] Basic project structure
- [ ] Core Excalidraw integration
- [ ] Basic room functionality

### Phase 2: Core Features
- [ ] Multi-tier authentication system (Guest → Registered → Team)
- [ ] Personal workspace with local/cloud storage
- [ ] Copy-to-share workflow implementation
- [ ] Basic room functionality
- [ ] Smart loading and mode detection
- [ ] WebAuthn registration flow

### Phase 3: Enhanced Features
- [ ] Real-time collaboration with lazy-loading
- [ ] Advanced permission system (view/comment/edit/admin)
- [ ] Organization-based workspaces
- [ ] Version history and drawing forks
- [ ] Commenting system
- [ ] Template library

### Phase 4: Integration & Polish
- [ ] External tool integrations
- [ ] Advanced search and organization
- [ ] Performance optimization
- [ ] Mobile responsiveness

## Unique Value Proposition

### What Makes This Different
- **Structured Organization** - Unlike standard Excalidraw, provides robust project organization
- **Team Collaboration** - Built-in room system for team-based work
- **Project Management Integration** - Bridges visual design and project execution
- **Version Control** - Track evolution of ideas and designs
- **Centralized Workspace** - Single source of truth for visual project materials

### Target Users
- **Product Teams** - For wireframing and user journey mapping
- **Engineering Teams** - For architecture diagrams and system design
- **Design Teams** - For collaborative ideation and feedback
- **Project Managers** - For visual project planning and stakeholder communication

## Technical Implementation Notes

### Database Schema Design

**Users Table**
```sql
- id (uuid)
- email (unique)
- webauthn_credential_id
- default_workspace_type (personal/organization)
- created_at, updated_at
```

**Drawings Table**
```sql
- id (uuid)
- title
- owner_id (foreign key)
- parent_drawing_id (for copies/forks)
- access_mode (personal/shared/collaborative)
- organization_id (nullable)
- drawing_data (json)
- thumbnail_url
- is_template (boolean)
- created_at, updated_at
```

**Permissions Table**
```sql
- id (uuid)
- drawing_id (foreign key)
- user_id (foreign key)
- permission_level (view/comment/edit/admin)
- granted_by (user_id)
- expires_at (nullable)
- created_at
```

**Drawing_Sessions Table (for collaboration)**
```sql
- id (uuid)
- drawing_id (foreign key)
- session_id (durable object id)
- active_users_count
- last_activity
- is_live (boolean)
```

**Organizations Table**
```sql
- id (uuid)
- name
- settings (json)
- created_at, updated_at
```

**Organization_Members Table**
```sql
- organization_id (foreign key)
- user_id (foreign key)
- role (member/admin/owner)
- joined_at
```

### Real-time Architecture
- WebSocket connections for live collaboration
- Conflict resolution for concurrent edits
- Efficient delta synchronization
- Presence indicators and live cursors

### Performance Optimization Strategy

**Resource Management**
- Personal drawings: No WebSocket overhead
- Shared drawings: Static content delivery
- Collaborative drawings: On-demand WebSocket connections
- Live sessions: Full real-time infrastructure

**Smart Loading**
```javascript
// Pseudo-code for mode detection
function loadDrawing(drawingId, userId) {
  const drawing = await getDrawing(drawingId);
  const userCount = await getActiveUsers(drawingId);

  if (drawing.access_mode === 'personal') {
    return loadPersonalMode(drawing);
  }

  if (userCount === 0) {
    return loadStaticMode(drawing);
  }

  if (userCount === 1) {
    return loadCollaborativeMode(drawing, 'lazy');
  }

  return loadLiveMode(drawing);
}
```

**Performance Targets**
- Personal drawings: < 50ms load time
- Read-only shareable: < 75ms load time (static content)
- Comment-only: < 100ms load time + lightweight WebSocket
- Edit-enabled shareable: < 150ms to first interaction
- Active collaboration: < 100ms collaboration latency
- Efficient storage of large drawing files (up to 10MB)
- Scalable to hundreds of concurrent users per room

---

*This document serves as the central reference for the Excalidraw Rooms project. It will be updated as the project evolves and new requirements are identified.*