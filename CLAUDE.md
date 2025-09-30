# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Excalidraw-based drawing application built with RedwoodSDK (rwsdk), running on Cloudflare Workers with:
- React Server Components (RSC) and React Server Functions
- Cloudflare D1 database via Prisma
- Durable Objects for session management
- WebAuthn/Passkey authentication
- Server-side rendering (SSR) and streaming

## Essential Commands

### Development
```bash
npm run dev              # Start dev server (Vite + Wrangler)
npm run dev:init         # Initialize development environment
```

### Database
```bash
npm run migrate:dev      # Apply migrations to local D1 database (required after schema changes)
npm run migrate:prd      # Apply migrations to remote production D1
npm run migrate:new      # Create a new Prisma migration
npm run seed             # Run database seed script
npm run generate         # Generate Prisma client + Wrangler types
```

**IMPORTANT**: Always run `npm run migrate:dev` after pulling schema changes or when starting fresh. The local D1 database needs explicit migration application.

### Testing
```bash
npm run test             # Run all tests in watch mode
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:run         # Run all tests once (no watch)
npm run test:coverage    # Generate coverage report
```

### Build & Deploy
```bash
npm run build            # Build for production
npm run preview          # Preview production build locally
npm run release          # Full deployment: clean, generate, build, deploy to Cloudflare
npm run types            # Type-check with TypeScript
npm run check            # Generate types + run type-check
```

## Architecture

### Application Entry Points

**Worker** ([src/worker.tsx](src/worker.tsx))
- Server-side application entry point
- Defines the app using `defineApp()` with middleware chain
- Sets up database (`setupDb`), session store (`setupSessionStore`)
- Loads user session and attaches to context
- Defines routing structure with `render()` and `route()`
- Protected routes redirect unauthenticated users to `/login`

**Client** ([src/client.tsx](src/client.tsx))
- Browser-side entry point
- Simply calls `initClient()` from rwsdk
- Minimal by design - most logic is server-side

### Core Systems

**Database** ([src/db.ts](src/db.ts))
- Prisma client with D1 adapter
- `setupDb(env)` must be called before any database operations
- Exports singleton `db` instance
- Schema: User (id, username, tier, timestamps) and Credential (WebAuthn credentials)
- Generated Prisma client lives in `generated/prisma/`

**Session Management** ([src/session/](src/session/))
- Uses Durable Objects (`SESSION_DURABLE_OBJECT` binding)
- Session store created via `defineDurableSession()` from rwsdk
- Sessions loaded in worker.tsx middleware and attached to `ctx.session`
- Session contains `userId` for authenticated users

**Authentication** ([src/app/pages/auth/](src/app/pages/auth/))
- WebAuthn/Passkey-based authentication (no passwords)
- Routes defined in `routes.ts`: `/login`, `/logout`
- Server functions in `functions.ts` handle registration/login flows
- Uses `@simplewebauthn/server` and `@simplewebauthn/browser`
- Environment variables: `WEBAUTHN_APP_NAME`, `WEBAUTHN_RP_ID`, `AUTH_SECRET_KEY`

**Routing** ([src/worker.tsx](src/worker.tsx))
- Routes defined with `route()` and `render()` from rwsdk
- Document wrapper component for HTML shell
- Auth routes imported from `authRoutes`
- Middleware runs before routes (session loading, user fetching)

### React Server Components (RSC) Architecture

**Server Components** (default)
- All components in `src/app/` are server components by default
- Rendered on server, streamed as HTML
- Can be async and fetch data directly
- NO client-side interactivity (no state, effects, event handlers)
- Context passed via props: `{ ctx }` contains session and user

**Client Components** (explicit)
- Must have `"use client"` directive at top of file
- Required for interactivity: clicks, state, browser APIs, event handlers
- Examples: form inputs with onChange, buttons with onClick
- Hydrated by React in browser

**Server Functions** (explicit)
- Must have `"use server"` directive at top of file
- Execute on server when called from client components
- Access context via `requestInfo.ctx` from `rwsdk/worker`
- Used for mutations, form handling, data operations

**Context Flow**
- `AppContext` defined in worker.tsx: `{ session: Session | null, user: User | null }`
- Populated by middleware in worker.tsx
- Available to server components via props
- Available to server functions via `requestInfo.ctx`

### File Organization

```
src/
├── worker.tsx              # Server entry point, routing, middleware
├── client.tsx              # Browser entry point
├── db.ts                   # Prisma client setup
├── app/
│   ├── Document.tsx        # HTML document wrapper
│   ├── headers.ts          # Security headers middleware
│   ├── pages/              # Route pages (server components)
│   │   ├── Home.tsx
│   │   └── auth/           # Authentication pages + functions
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   └── drawing/       # Drawing-specific components
│   └── shared/            # Shared utilities
├── session/
│   ├── store.ts           # Session store setup
│   └── durableObject.ts   # Session Durable Object
├── auth/                  # Auth utilities
├── lib/                   # Utility functions
├── styles/                # Global CSS
└── types/                 # TypeScript types
```

### Security Headers

Security headers are set in [src/app/headers.ts](src/app/headers.ts) via `setCommonHeaders()` middleware:
- HSTS (HTTPS enforcement)
- Content-Type sniffing protection
- Strict CSP with nonce-based script execution
- Referrer policy
- Permissions policy

### Testing Structure

- **Unit tests**: `tests/unit/` - Component and utility tests
- **Integration tests**: `tests/integration/` - API and flow tests
- **E2E tests**: `tests/e2e/` - Playwright browser tests
- Test setup: `tests/setup.ts` (Vitest + happy-dom)

## Important Patterns

### Data Fetching in Server Components
```tsx
// Server component can be async
export async function TodoList({ ctx }) {
  const todos = await db.todo.findMany({
    where: { userId: ctx.user.id }
  });
  return <ol>{todos.map(todo => <li>{todo.title}</li>)}</ol>;
}
```

### Server Functions for Mutations
```tsx
"use server";
import { requestInfo } from "rwsdk/worker";

export async function addTodo(formData: FormData) {
  const { ctx } = requestInfo;
  const title = formData.get("title");
  await db.todo.create({ data: { title, userId: ctx.user.id } });
}
```

### Client Components for Interactivity
```tsx
"use client";

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

## Common Gotchas

1. **Database not initialized**: Run `npm run migrate:dev` if you see "table does not exist" errors
2. **Prisma client out of sync**: Run `npm run generate` after schema changes
3. **Hydration mismatches**: Browser extensions (form autofill) can cause warnings by adding attributes like `fdprocessedid`
4. **Missing "use client"**: If you get errors about hooks/state in server components, add `"use client"` directive
5. **Missing "use server"**: Server functions called from client components need `"use server"` directive
6. **Context access**: Use `requestInfo.ctx` in server functions, props in server components
7. **Database setup**: `setupDb(env)` must be called before any Prisma operations (done in worker.tsx middleware)

## Development Workflow

1. **Starting fresh**: `npm install` → `npm run migrate:dev` → `npm run dev`
2. **Schema changes**: Edit `prisma/schema.prisma` → `npm run migrate:new` → `npm run migrate:dev`
3. **Adding features**: Create server components by default, add `"use client"` only when needed
4. **Testing**: Write unit tests alongside code, run E2E tests before deploying
5. **Deploying**: `npm run release` (handles clean, generate, build, deploy)

## Environment Variables

Defined in [wrangler.jsonc](wrangler.jsonc):
- `WEBAUTHN_APP_NAME`: Application name for WebAuthn
- `WEBAUTHN_RP_ID`: Relying Party ID (domain)
- `AUTH_SECRET_KEY`: Secret key for session encryption

## Cloudflare Bindings

- `DB`: D1 database binding (from wrangler.jsonc)
- `SESSION_DURABLE_OBJECT`: Durable Object for sessions
- `ASSETS`: Static assets binding

## References

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Prisma with D1](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1)