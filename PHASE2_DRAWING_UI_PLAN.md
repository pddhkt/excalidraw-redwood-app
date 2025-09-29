# Phase 2: Personal Drawing Management UI

## 📋 Executive Summary

Phase 2 focuses on building the core UI for personal drawing management with a modern, responsive interface using Tailwind CSS and shadcn/ui-inspired components. This phase establishes the foundation for users to authenticate via passkeys and manage their personal drawing library.

**Scope:** Authentication UI, Drawing Database, Personal Library Management (View Only)
**Duration:** 4 weeks estimated
**Dependencies:** Phase 1 Authentication System (Completed)

---

## 2.1 Database Schema Design

### Drawing Model
```prisma
model Drawing {
  id           String    @id @default(uuid())
  userId       String
  title        String
  description  String?   // Optional description
  content      String    // JSON string of Excalidraw data
  thumbnail    String?   // Base64 or URL for preview
  isPublic     Boolean   @default(false)
  isArchived   Boolean   @default(false)
  tags         String[]  // Array of tags for organization
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastOpenedAt DateTime?

  // Relations
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Indexes for performance
  @@index([userId, updatedAt])
  @@index([userId, lastOpenedAt])
  @@index([userId, isArchived])
  @@index([isPublic])
}

// Update User model to include drawings relation
model User {
  // ... existing fields ...
  drawings    Drawing[]
}
```

### Migration Strategy
1. Create new migration file for Drawing model
2. Run `npm run migrate:dev` for local development
3. Test with seed data
4. Deploy to production with `npm run migrate:prd`

---

## 2.2 Styling System Setup

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

### CSS Variables & Theme
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### Utility Functions
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 2.3 Authentication UI Enhancement

### Unified Login/Register Page (`/login`)

```typescript
// src/app/pages/Login.tsx
interface LoginPageProps {
  // Page will handle both sign-in and sign-up
  // Single form with username input
  // Two action buttons: Sign In / Create Account
  // Guest mode option
}

// Features:
- Username input field with validation
- "Sign in with Passkey" button (primary)
- "Create Account with Passkey" button (secondary)
- "Continue as Guest" link (text button)
- Loading states during authentication
- Error/success message display
- Responsive layout (mobile-first)
- Auto-redirect after successful login
```

### Component Structure
```typescript
<Card className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Welcome to Excalidraw</CardTitle>
    <CardDescription>Sign in or create an account</CardDescription>
  </CardHeader>
  <CardContent>
    <Input placeholder="Username" />
    <div className="space-y-2">
      <Button variant="default" className="w-full">
        Sign in with Passkey
      </Button>
      <Button variant="outline" className="w-full">
        Create Account with Passkey
      </Button>
      <Button variant="ghost" className="w-full">
        Continue as Guest
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## 2.4 Core UI Pages

### Dashboard Page (`/dashboard`)
```typescript
interface DashboardPageProps {
  recentDrawings: Drawing[] // Last 6 drawings
  stats: {
    totalDrawings: number
    lastActivity: Date
  }
}

// Layout:
- Welcome header with username
- Quick stats cards (Total Drawings, Last Activity)
- "New Drawing" CTA button
- Recent drawings grid (2x3 on desktop, 1 column on mobile)
- "View All Drawings" link to library
```

### Library Page (`/library`)
```typescript
interface LibraryPageProps {
  drawings: Drawing[]
  sortBy: 'created' | 'updated' | 'alphabetical'
  view: 'grid' | 'list'
}

// Features:
- Search bar (filter by title)
- Sort dropdown (Created, Modified, Alphabetical)
- View toggle (Grid/List)
- Drawing cards with:
  - Thumbnail preview
  - Title
  - Description (truncated)
  - Last modified (relative time)
  - Public/Private badge
  - Tags display
- Pagination (12 items per page)
- Empty state for new users
- Loading skeleton during fetch
```

### Navigation Component
```typescript
interface NavigationProps {
  user: User | null
  isGuest: boolean
}

// Structure:
<header className="border-b">
  <div className="container flex h-16 items-center">
    <Link href="/" className="font-bold text-xl">
      Excalidraw App
    </Link>
    <nav className="ml-auto flex items-center space-x-4">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/library">My Drawings</Link>
      <Button variant="outline" size="sm">
        New Drawing
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>{user?.username || "Guest"}</Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  </div>
</header>
```

---

## 2.5 Component Library

### Base Components (shadcn/ui-inspired)

```typescript
// src/components/ui/

- Button.tsx       // Primary, Secondary, Ghost, Destructive variants
- Card.tsx         // Container with header, content, footer
- Input.tsx        // Text input with label and error states
- Label.tsx        // Form labels
- Avatar.tsx       // User avatars
- Badge.tsx        // Status badges (Public/Private)
- Skeleton.tsx     // Loading states
- Alert.tsx        // Error/success messages
- DropdownMenu.tsx // Navigation dropdowns
- Dialog.tsx       // Modal dialogs
- Separator.tsx    // Visual dividers
- ScrollArea.tsx   // Scrollable containers
```

### Drawing-Specific Components

```typescript
// src/components/drawing/

// DrawingCard.tsx
interface DrawingCardProps {
  drawing: Drawing
  variant?: 'default' | 'compact'
  onClick?: () => void
}

// DrawingGrid.tsx
interface DrawingGridProps {
  drawings: Drawing[]
  columns?: 2 | 3 | 4
  onDrawingClick?: (drawing: Drawing) => void
}

// DrawingEmptyState.tsx
interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}
```

### Layout Components

```typescript
// src/components/layout/

// Container.tsx
export const Container = ({ children, className }) => (
  <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}>
    {children}
  </div>
)

// PageHeader.tsx
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

// Layout.tsx (Main app wrapper)
export const Layout = ({ children }) => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <main className="flex-1">
      {children}
    </main>
  </div>
)
```

---

## 2.6 API Functions & Session Management

### Drawing Operations
```typescript
// src/db/drawing/functions.ts

export async function createDrawing(data: {
  title: string
  content: string
  userId: string
}): Promise<Drawing>

export async function getUserDrawings(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: 'created' | 'updated' | 'alphabetical'
    includeArchived?: boolean
  }
): Promise<{ drawings: Drawing[], total: number }>

export async function getDrawing(
  drawingId: string,
  userId: string
): Promise<Drawing | null>

export async function updateDrawing(
  drawingId: string,
  userId: string,
  updates: Partial<Drawing>
): Promise<Drawing>

export async function deleteDrawing(
  drawingId: string,
  userId: string
): Promise<boolean>

export async function getRecentDrawings(
  userId: string,
  limit: number = 6
): Promise<Drawing[]>
```

### Session Context
```typescript
// src/app/context/SessionContext.tsx

interface SessionContextValue {
  user: User | null
  isGuest: boolean
  isLoading: boolean
  tier: UserTier
  permissions: Permission[]
  signOut: () => Promise<void>
  upgradeFromGuest: () => Promise<void>
}

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Implementation
}

export const useSession = () => useContext(SessionContext)
```

---

## 2.7 File Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── Login.tsx              // Enhanced auth page
│   │   ├── Dashboard.tsx          // New dashboard
│   │   ├── Library.tsx            // Drawing library
│   │   └── user/
│   │       └── functions.ts       // Existing auth functions
│   ├── components/
│   │   ├── ui/                    // Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   └── ...
│   │   ├── drawing/               // Drawing components
│   │   │   ├── DrawingCard.tsx
│   │   │   ├── DrawingGrid.tsx
│   │   │   └── DrawingEmptyState.tsx
│   │   └── layout/                // Layout components
│   │       ├── Layout.tsx
│   │       ├── Navigation.tsx
│   │       ├── Container.tsx
│   │       └── PageHeader.tsx
│   └── context/
│       └── SessionContext.tsx     // Session management
├── db/
│   └── drawing/
│       └── functions.ts           // Drawing CRUD operations
├── lib/
│   └── utils.ts                   // cn() utility and helpers
├── styles/
│   └── globals.css                // Tailwind and theme
└── types/
    └── drawing.ts                 // TypeScript types
```

---

## 2.8 Technical Stack & Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    // Existing
    "@prisma/client": "^6.8.2",
    "@simplewebauthn/browser": "^13.1.0",
    "@simplewebauthn/server": "^13.1.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",

    // New for Phase 2
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.0.0",         // Date formatting
    "lucide-react": "^0.300.0"    // Icons
  },
  "devDependencies": {
    // Existing
    "typescript": "^5.8.3",
    "vite": "^7.1.6",

    // New for Phase 2
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### Configuration Files

**postcss.config.js:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**tsconfig.json paths:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/app/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

---

## 2.9 Implementation Timeline

### Week 1: Foundation Setup
- [ ] Day 1-2: Database schema creation and migration
- [ ] Day 3-4: Tailwind CSS setup and theme configuration
- [ ] Day 5: Base UI components (Button, Card, Input)

### Week 2: Authentication & Components
- [ ] Day 1-2: Enhanced Login page with Tailwind styling
- [ ] Day 3-4: Session context and provider
- [ ] Day 5: Navigation component and layout

### Week 3: Core Pages
- [ ] Day 1-2: Dashboard page implementation
- [ ] Day 3-4: Library page with grid/list views
- [ ] Day 5: Drawing card components and empty states

### Week 4: Polish & Testing
- [ ] Day 1-2: Responsive design adjustments
- [ ] Day 3: Loading states and error handling
- [ ] Day 4: Integration testing
- [ ] Day 5: Documentation and deployment

---

## 2.10 Success Criteria

### Functional Requirements ✅
- [ ] Users can sign in/sign up with passkeys on a unified page
- [ ] Guest users can browse with option to upgrade
- [ ] Authenticated users see dashboard with recent drawings
- [ ] Library page displays all user drawings with search/sort
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect unauthenticated users

### UI/UX Requirements ✅
- [ ] Consistent design system using Tailwind + shadcn patterns
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Loading states for all async operations
- [ ] Error messages are clear and actionable
- [ ] Empty states guide new users
- [ ] Dark mode support (optional)

### Technical Requirements ✅
- [ ] Drawing model properly integrated with Prisma
- [ ] Type-safe throughout with TypeScript
- [ ] Server-side rendering with Cloudflare Workers
- [ ] Centralized styling with utility classes
- [ ] Component reusability and maintainability

### Performance Metrics
- [ ] Page load time < 2 seconds
- [ ] Drawing list loads < 1 second
- [ ] Smooth navigation between pages
- [ ] Optimized database queries with proper indexes

---

## 2.11 Risk Mitigation

### Identified Risks
1. **Passkey browser compatibility** - Provide fallback messaging for unsupported browsers
2. **Drawing data size** - Implement pagination and lazy loading
3. **Session management complexity** - Use proven patterns from Phase 1
4. **Styling consistency** - Establish component guidelines early

### Mitigation Strategies
- Progressive enhancement for older browsers
- Database query optimization from day 1
- Extensive testing on different devices
- Code reviews for component consistency

---

## 2.12 Future Considerations (Phase 3+)

### Phase 3: Drawing Creation & Editing
- Excalidraw component integration
- Auto-save functionality
- Version history
- Export options (PNG, SVG, JSON)

### Phase 4: Sharing & Collaboration
- Public link generation
- View-only sharing
- Collaborative editing preparation
- Comments and annotations

### Phase 5: Advanced Features
- Folders/Collections for organization
- Bulk operations
- Search within drawing content
- Drawing templates

---

## 📝 Notes for Developers

1. **Component Development**: Follow the shadcn/ui pattern - components should be copy-pasteable and customizable
2. **Styling**: Use Tailwind utility classes, avoid inline styles except for dynamic values
3. **Type Safety**: Every component should have proper TypeScript interfaces
4. **Accessibility**: Include proper ARIA labels, keyboard navigation, and focus management
5. **Testing**: Write tests for critical user flows (login, drawing CRUD)
6. **Documentation**: Comment complex logic, document API functions

---

## 🎯 Phase 2 Deliverables Checklist

- [ ] Database schema implemented and migrated
- [ ] Tailwind CSS and theme system configured
- [ ] Component library established (10+ base components)
- [ ] Login page with passkey authentication
- [ ] Dashboard with recent drawings
- [ ] Library page with full drawing list
- [ ] Session management and protected routes
- [ ] Drawing CRUD API functions
- [ ] Responsive design for all pages
- [ ] Basic test coverage
- [ ] Deployment to Cloudflare Workers

---

**Document Version:** 1.0
**Last Updated:** Today
**Status:** Ready for Implementation
**Author:** Development Team