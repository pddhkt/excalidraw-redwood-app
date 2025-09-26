# High-Level Plan for Excalidraw Rooms

## Project Goal
Build a collaborative drawing application using Excalidraw with rooms and permission systems.

## Core Questions to Answer First

### 1. User System - What types of users do we need?
- **Option A (Simple)**: Guest → Registered User → Room Owner
- **Option B (Medium)**: Guest → Registered User → Team Member → Team Admin
- **Option C (Complex)**: Full hierarchy with Organization Admin

**Question**: Which option matches your vision?

### 2. Drawing Storage - Where and how do drawings live?
- Personal drawings: User's private space
- Shared drawings: Can be accessed via link
- Room drawings: Belong to a room/team

**Question**: Do all drawings start personal then get shared, or can users create directly in rooms?

### 3. Collaboration Scope - What does "real-time" mean for us?
- **Minimum**: Share static drawings (no real-time)
- **Medium**: See others' cursors and changes live
- **Maximum**: Full conflict resolution, version control, branching

**Question**: Is real-time collaboration essential for MVP, or can we start with sharing?

### 4. Room Concept - What exactly is a "room"?
- **Option A**: A shared workspace where multiple drawings live
- **Option B**: A single collaborative drawing session
- **Option C**: A team/project container with multiple features

**Question**: What's your mental model of a room?

## Proposed High-Level Phases (To Be Confirmed)

### Phase 1: Foundation (Must Have)
**Goal**: Get Excalidraw working with basic save/load

Key Decisions Needed:
- [ ] Will we use Excalidraw React component or build our own wrapper?
- [ ] Do we store drawings as JSON in R2 or break them into smaller pieces?
- [ ] Do we need user accounts in Phase 1, or start with local-only?

**Success Criteria**: Can draw and save a drawing somewhere (even just locally)

### Phase 2: Users & Persistence (Must Have)
**Goal**: Users can save their work permanently

Key Decisions Needed:
- [ ] Start with email/password or go straight to WebAuthn?
- [ ] Allow guests to draw without account?
- [ ] One drawing per user or unlimited?

**Success Criteria**: User can log in, create drawings, see them later

### Phase 3: Sharing (Should Have)
**Goal**: Users can share drawings with others

Key Decisions Needed:
- [ ] Share via link or require user accounts?
- [ ] What permissions: View-only, Comment, Edit?
- [ ] Public links or always require authentication?

**Success Criteria**: Can send a link to someone else who can view the drawing

### Phase 4: Collaboration (Nice to Have)
**Goal**: Multiple users can work together

Key Decisions Needed:
- [ ] Real-time or turn-based?
- [ ] How to handle conflicts?
- [ ] Need presence indicators (cursors, names)?

**Success Criteria**: Two people can edit same drawing

### Phase 5: Rooms/Teams (Nice to Have)
**Goal**: Organized spaces for groups

Key Decisions Needed:
- [ ] What makes a room different from shared drawing?
- [ ] Do rooms have members or just links?
- [ ] Room templates/presets needed?

**Success Criteria**: Groups can organize their work

### Phase 6: Polish (Nice to Have)
**Goal**: Production-ready

Key Decisions Needed:
- [ ] Mobile support priority?
- [ ] Offline mode needed?
- [ ] Export formats required?

**Success Criteria**: Smooth, reliable, deployable

## Critical Technical Decisions

### 1. Architecture Pattern
- **Option A**: Client-heavy (Excalidraw does most work, server just stores)
- **Option B**: Server-coordinated (Server manages state, validates changes)
- **Option C**: Hybrid (Client for editing, server for collaboration)

### 2. Real-time Technology (If Needed)
- **Option A**: WebSockets via Durable Objects
- **Option B**: Server-Sent Events
- **Option C**: Polling (simpler but less real-time)

### 3. Conflict Resolution (If Needed)
- **Option A**: Last-write-wins (simple but can lose data)
- **Option B**: Operational Transform (complex but precise)
- **Option C**: CRDTs (very complex but best for collaboration)

### 4. Testing Strategy
- **Option A**: Test after each phase is complete
- **Option B**: Write tests during development
- **Option C**: Test-driven development from start

## Risk Assessment

### High Risk (Could Block Project)
1. **Excalidraw Integration**: Will the library work with our stack?
2. **WebSocket Scaling**: Can Durable Objects handle collaboration load?
3. **Storage Size**: Drawing files can be large (10+ MB)

### Medium Risk (Could Delay Project)
1. **Conflict Resolution**: Complex if we need real-time collaboration
2. **Performance**: Large drawings might be slow
3. **Mobile Support**: Touch interactions are complex

### Low Risk (Can Work Around)
1. **UI Design**: Can use Excalidraw's built-in UI
2. **Authentication**: RedwoodSDK already has WebAuthn
3. **Basic Storage**: R2 and D1 are straightforward

## What We Need to Validate First

### Technical Validation (Before Writing Code)
1. [ ] Can Excalidraw component work in our Vite/React setup?
2. [ ] Can we store/retrieve 10MB files from R2 efficiently?
3. [ ] Can Durable Objects handle WebSocket connections?
4. [ ] Does RedwoodSDK support the routing we need?

### Product Validation (Understanding Requirements)
1. [ ] What's the primary use case: Personal notes or team collaboration?
2. [ ] Expected number of users per drawing/room?
3. [ ] How important is real-time vs async collaboration?
4. [ ] What's the MVP vs future vision?

## Recommended First Steps

### Step 1: Technical Proof of Concept (1-2 days)
- [ ] Install Excalidraw in project
- [ ] Create basic drawing page
- [ ] Save drawing to R2
- [ ] Load drawing from R2

**Why**: Validates our core technical assumptions

### Step 2: Define MVP Scope (1 day)
- [ ] Decide on user roles
- [ ] Decide on sharing model
- [ ] Decide on real-time needs
- [ ] Create user stories

**Why**: Clarifies what we're actually building

### Step 3: Create Detailed Phase 1 Plan (1 day)
- [ ] Break down into 2-3 day tasks
- [ ] Identify dependencies
- [ ] Set up test approach
- [ ] Define success metrics

**Why**: Makes execution clear and measurable

## Questions for You

1. **Vision**: Is this more like Google Docs (real-time collaboration) or GitHub (async sharing)?

2. **Users**: Will this be used by:
   - Individuals (personal drawing tool)
   - Small teams (5-10 people)
   - Large organizations (100+ people)
   - Public/open community

3. **Priority**: What's more important?
   - Get something working quickly (MVP in 2 weeks)
   - Build it right first time (robust in 6 weeks)
   - Learn and iterate (prototype approach)

4. **Constraints**: Do we have:
   - Deadline pressure?
   - Specific feature requirements?
   - Technical limitations?
   - Budget constraints?

## Next Actions

After you review this high-level plan:

1. **Confirm/Adjust** the phase breakdown
2. **Answer** the key questions above
3. **Prioritize** must-have vs nice-to-have
4. **Decide** on first proof of concept

Then we can:
- Create detailed plan for confirmed phases
- Set up development environment
- Begin proof of concept

---

*This is a discussion document. Nothing is final until confirmed.*