# Phase 1: Authentication & Role-Based Access Foundation

## Current State Analysis
RedwoodJS with RedwoodSDK already provides:
- ✅ **WebAuthn/Passkey authentication** using @simplewebauthn
- ✅ **Session management** with Durable Objects
- ✅ **Basic protected routes** (e.g., /protected route)
- ✅ **Session persistence** with automatic token handling
- ❌ **No role-based access control** (RBAC)
- ❌ **No testing infrastructure**
- ❌ **No user dashboard/landing pages**

## Phase 1 Implementation Plan

### 1. Database Schema Enhancement
- Add `role` field to User model (ADMIN, MODERATOR, MEMBER, GUEST)
- Add Room and Drawing models with user relationships
- Add RoomMembership model for user-room access control
- Create migration scripts

### 2. Authentication System Enhancement
- **Middleware & Guards**:
  - Create role-based middleware functions
  - Implement permission guards (canViewRoom, canEditDrawing, etc.)
  - Add session expiry handling with refresh logic

- **Auth Pages**:
  - Enhance login page with better UX
  - Create registration page with role selection (for testing)
  - Add "Remember me" functionality
  - Create password reset flow (email-based)

### 3. User Dashboard & Navigation
- **Landing Page** (/dashboard):
  - Show user profile info & role
  - Display recent drawings
  - Show available rooms
  - Quick actions based on role

- **Rooms Page** (/rooms):
  - List all rooms user has access to
  - Filter by ownership/membership
  - Room creation button (role-dependent)

- **Drawings Page** (/drawings):
  - Grid/list view of user's drawings
  - Shared drawings section
  - Mock drawing thumbnails for testing

### 4. Testing Infrastructure Setup

**Unit Tests** (Vitest):
- Auth function tests
- Role permission logic tests
- Database model tests
- Session management tests

**Integration Tests** (Hurl):
- Authentication flow tests
- API endpoint tests
- Role-based access tests
- Session expiry tests

**E2E Tests** (Playwright):
- Complete auth flows
- Role-based UI visibility
- Protected route access
- Multi-user scenarios

### 5. Test Data & Fixtures
Create seed data with:
- 4 test users (one per role)
- 10 test rooms with varying permissions
- 20 test drawings with different ownership
- Room membership configurations

### 6. Development Workflow
- Set up GitHub Actions for CI/CD
- Configure pre-commit hooks for linting/testing
- Add environment variable management
- Create development vs production configs

## File Structure to Create
```
src/
├── auth/
│   ├── middleware.ts       # Auth middleware & guards
│   ├── permissions.ts      # Role-based permissions
│   └── utils.ts           # Auth utilities
├── app/
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── routes.ts
│   │   ├── rooms/
│   │   │   ├── RoomList.tsx
│   │   │   ├── RoomDetail.tsx
│   │   │   └── routes.ts
│   │   └── drawings/
│   │       ├── DrawingList.tsx
│   │       └── routes.ts
│   └── components/
│       ├── Layout.tsx
│       └── Navigation.tsx
tests/
├── unit/
├── integration/
└── e2e/
```

## Success Criteria
1. Users can register/login with different roles
2. Role-based access control works correctly
3. Protected routes redirect unauthorized users
4. Session management handles expiry gracefully
5. All three testing layers pass (unit/integration/e2e)
6. Test coverage > 80% for auth code

## Next Steps After Phase 1
- Phase 2: Real-time collaboration infrastructure
- Phase 3: Excalidraw integration
- Phase 4: Performance optimization & scaling

## Implementation Order

### Week 1: Foundation
1. **Day 1-2**: Database schema updates and migrations
2. **Day 3-4**: Auth middleware and permission system
3. **Day 5**: Testing infrastructure setup

### Week 2: User Interface
1. **Day 1-2**: Dashboard implementation
2. **Day 3-4**: Rooms and Drawings pages
3. **Day 5**: Navigation and layout components

### Week 3: Testing & Polish
1. **Day 1-2**: Unit and integration tests
2. **Day 3-4**: E2E tests with Playwright
3. **Day 5**: Bug fixes and documentation

## Key Decisions Needed

1. **Session Expiry Strategy**:
   - Default session duration?
   - Refresh token mechanism?
   - Remember me duration?

2. **Role Hierarchy**:
   - Can MODERATOR create rooms?
   - Can MEMBER invite others?
   - Guest limitations?

3. **Testing Coverage**:
   - Minimum coverage threshold?
   - Critical paths to test?
   - Performance benchmarks?

4. **Development Environment**:
   - Local D1 database setup?
   - Environment variables management?
   - Staging environment needed?