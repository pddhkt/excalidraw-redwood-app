# Phase 2: Personal Drawing Management UI

## 📋 Executive Summary

Phase 2 focuses on building the core UI for personal drawing management with a modern, responsive interface using Tailwind CSS and shadcn/ui-inspired components. This phase establishes the foundation for users to authenticate via passkeys and manage their personal drawing library.

**Methodology:** Test-Driven Development (TDD) with Vitest + Playwright
**Scope:** Authentication UI, Drawing Database, Personal Library Management (View Only)
**Duration:** 4 weeks estimated
**Dependencies:** Phase 1 Authentication System (Completed)
**Development Environment:** Mobile-first with GitHub Actions CI/CD

---

## 2.0 TDD Methodology & Testing Strategy

### Test-Driven Development Approach

**Core Principle:** Write tests first, then implement code to pass the tests.

#### TDD Cycle for Each Feature:
1. **RED** - Write failing test(s) that define desired behavior
2. **GREEN** - Write minimal code to make tests pass
3. **REFACTOR** - Improve code while keeping tests green

### Testing Stack

#### Unit Testing (Vitest)
```typescript
// Example: Button component test
// tests/unit/components/ui/Button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('should render with correct variant classes', () => {
    render(<Button variant="primary">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })
})
```

#### Integration Testing (Vitest + Testing Library)
```typescript
// Example: Session context test
// tests/integration/SessionContext.test.tsx
describe('SessionContext', () => {
  it('should provide user data after login', async () => {
    // Test implementation
  })
})
```

#### E2E Testing (Playwright)
```typescript
// Example: Login flow test
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can login with passkey', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[data-testid="username-input"]', 'testuser')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })
})
```

### Mobile Development Workflow

Since development is on mobile, all tests run via GitHub Actions:

1. **Local Development:** Write code on mobile
2. **Push to Branch:** Commit and push changes
3. **Automated Testing:** GitHub Actions runs all tests
4. **Feedback Loop:** View results in GitHub interface

### GitHub Actions CI/CD Pipeline

**.github/workflows/test-and-deploy.yml:**
```yaml
name: Test and Deploy

on:
  push:
    branches: [staging, main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run types

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            test-results/
            coverage/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Cloudflare
        run: npm run release
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Test Organization

```
tests/
├── unit/                          # Vitest unit tests
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.test.tsx
│   │   │   ├── Card.test.tsx
│   │   │   └── Input.test.tsx
│   │   └── drawing/
│   │       ├── DrawingCard.test.tsx
│   │       └── DrawingGrid.test.tsx
│   ├── db/
│   │   └── drawing/
│   │       └── functions.test.ts
│   └── utils/
│       └── cn.test.ts
├── integration/                   # Vitest integration tests
│   ├── SessionContext.test.tsx
│   ├── auth-flow.test.ts
│   └── drawing-crud.test.ts
└── e2e/                          # Playwright E2E tests
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    ├── library.spec.ts
    └── guest-flow.spec.ts
```

### Package.json Test Scripts

```json
{
  "scripts": {
    // Existing scripts...
    "test": "vitest",
    "test:unit": "vitest run --dir tests/unit",
    "test:integration": "vitest run --dir tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

### TDD Implementation Strategy

#### For Each Component:
1. Write test file first defining expected behavior
2. Create component with minimal implementation
3. Run tests locally (basic syntax check)
4. Push to GitHub for full test run
5. Iterate based on test results

#### Example TDD Flow for DrawingCard:

**Step 1: Write Test First**
```typescript
// tests/unit/components/drawing/DrawingCard.test.tsx
describe('DrawingCard', () => {
  const mockDrawing = {
    id: '1',
    title: 'My Drawing',
    updatedAt: new Date('2024-01-01'),
    thumbnail: 'base64...',
    isPublic: false
  }

  it('should display drawing title', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    expect(screen.getByText('My Drawing')).toBeInTheDocument()
  })

  it('should show private badge for private drawings', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('should format date correctly', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument()
  })
})
```

**Step 2: Create Minimal Component**
```typescript
// src/components/drawing/DrawingCard.tsx
export function DrawingCard({ drawing }) {
  // Minimal implementation to pass tests
}
```

**Step 3: Push and Iterate**
- Push to GitHub
- View test results in Actions
- Fix failures
- Repeat until all tests pass

### Test Coverage Goals

- **Unit Tests:** 80% coverage minimum
- **Integration Tests:** All critical paths
- **E2E Tests:** Happy paths for each user flow
- **Accessibility Tests:** WCAG 2.1 Level AA compliance

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
    "vitest": "^2.1.1",           // Already in package.json
    "@testing-library/react": "^16.0.1",  // Already in package.json
    "@testing-library/jest-dom": "^6.4.8", // Already in package.json

    // New for Phase 2
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",

    // Testing additions
    "@playwright/test": "^1.40.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitest/coverage-v8": "^2.1.1",
    "jsdom": "^24.0.0"           // For Vitest DOM testing
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

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '*.config.*']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
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

## 2.9 TDD Implementation Timeline

### Week 1: Foundation Setup (TDD First)
- [ ] Day 1: Setup testing infrastructure
  - Configure Vitest, Playwright, and GitHub Actions
  - Create test directory structure
  - Write first failing tests for Button component
- [ ] Day 2: Database schema & tests
  - Write tests for Drawing model operations
  - Create Drawing model and migration
  - Push to GitHub for CI validation
- [ ] Day 3-4: Tailwind CSS & Component tests
  - Write tests for base UI components (Button, Card, Input)
  - Setup Tailwind CSS configuration
  - Implement components to pass tests
- [ ] Day 5: Test review and CI refinement
  - Ensure all tests pass in GitHub Actions
  - Adjust CI pipeline if needed

### Week 2: Authentication & Components (Test-First)
- [ ] Day 1: Login page tests
  - Write E2E tests for login flow
  - Write unit tests for Login component
- [ ] Day 2: Login implementation
  - Implement Login page to pass tests
  - Push for CI validation
- [ ] Day 3: Session context tests
  - Write integration tests for SessionContext
  - Test session persistence and auth guards
- [ ] Day 4: Session implementation
  - Implement SessionContext to pass tests
  - Test protected route behavior
- [ ] Day 5: Navigation tests and implementation
  - Write tests for Navigation component
  - Implement and validate in CI

### Week 3: Core Pages (TDD Cycle)
- [ ] Day 1: Dashboard tests
  - Write E2E test for dashboard flow
  - Unit tests for dashboard components
- [ ] Day 2: Dashboard implementation
  - Build Dashboard to pass all tests
  - Validate with GitHub Actions
- [ ] Day 3: Library page tests
  - E2E tests for library browsing
  - Unit tests for DrawingCard, DrawingGrid
- [ ] Day 4: Library implementation
  - Implement Library page and components
  - Ensure tests pass in CI
- [ ] Day 5: Integration testing
  - Full user flow E2E tests
  - Cross-browser testing via Playwright

### Week 4: Polish & Production Readiness
- [ ] Day 1: Mobile responsiveness tests
  - Add Playwright mobile device tests
  - Fix any responsive issues
- [ ] Day 2: Performance and accessibility
  - Add performance metrics to tests
  - Implement accessibility tests
- [ ] Day 3: Error handling and edge cases
  - Write tests for error scenarios
  - Implement proper error boundaries
- [ ] Day 4: Final test coverage review
  - Achieve 80%+ unit test coverage
  - All E2E happy paths covered
- [ ] Day 5: Production deployment
  - Final CI/CD pipeline check
  - Deploy to Cloudflare Workers

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

## 2.11 Mobile Development Considerations

### Development Workflow on Mobile

Since development is happening on a mobile device (Termux), the workflow is optimized for:

1. **Code Writing:**
   - Use mobile-friendly editors
   - Write code in small, testable chunks
   - Frequent commits to save progress

2. **Testing Strategy:**
   - **No local test execution** - All tests run in GitHub Actions
   - Push to feature branches frequently for test feedback
   - Use GitHub mobile app to monitor CI/CD results

3. **Branch Strategy:**
   ```
   main (production)
   ├── staging (integration testing)
   └── feature/* (individual features with TDD)
   ```

4. **Daily Workflow:**
   ```bash
   # Morning: Pull latest changes
   git pull origin staging

   # Create feature branch
   git checkout -b feature/component-name

   # Write test first
   vim tests/unit/ComponentName.test.tsx

   # Commit and push test
   git add . && git commit -m "test: add ComponentName tests"
   git push origin feature/component-name

   # Check GitHub Actions for test results
   # Write implementation
   # Push again for validation
   ```

5. **GitHub Mobile App Usage:**
   - Monitor workflow runs
   - Review test results
   - Approve PRs
   - Check deployment status

### CI/CD Optimization for Mobile Dev

1. **Fast Feedback Loop:**
   - Tests run automatically on push
   - Results available in 2-5 minutes
   - Email/push notifications for failures

2. **Branch Protection Rules:**
   - Require tests to pass before merge
   - Auto-merge when all checks pass
   - Prevent direct pushes to main

3. **Test Result Artifacts:**
   - HTML reports accessible via GitHub
   - Coverage reports for code review
   - Screenshots from failed E2E tests

## 2.12 Risk Mitigation

### Identified Risks
1. **Passkey browser compatibility** - Provide fallback messaging for unsupported browsers
2. **Drawing data size** - Implement pagination and lazy loading
3. **Session management complexity** - Use proven patterns from Phase 1
4. **Styling consistency** - Establish component guidelines early
5. **Mobile development limitations** - Rely on CI/CD for testing and validation

### Mitigation Strategies
- Progressive enhancement for older browsers
- Database query optimization from day 1
- Extensive testing on different devices via Playwright
- Code reviews for component consistency
- Robust GitHub Actions pipeline for mobile development

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

### TDD Best Practices
1. **Red-Green-Refactor**: Always follow the TDD cycle strictly
2. **Test First**: Never write implementation code without a failing test
3. **Minimal Implementation**: Write just enough code to pass the test
4. **Test Names**: Use descriptive test names that explain expected behavior
5. **One Feature Per Test**: Each test should validate a single piece of functionality

### Component Development
1. **shadcn/ui Pattern**: Components should be copy-pasteable and customizable
2. **Test-Driven Components**: Write tests before component implementation
3. **Props Interface**: Define TypeScript interfaces first, then tests, then implementation
4. **Component Composition**: Prefer composition over complex single components

### Mobile Development Guidelines
1. **Small Commits**: Commit frequently with descriptive messages
2. **GitHub Actions**: Rely on CI for all testing and validation
3. **Feature Branches**: Create branches for each component/feature
4. **Mobile-First**: Test responsive design through Playwright mobile devices

### Technical Standards
1. **Styling**: Use Tailwind utility classes, avoid inline styles except for dynamic values
2. **Type Safety**: Every component should have proper TypeScript interfaces
3. **Accessibility**: Include proper ARIA labels, keyboard navigation, and focus management
4. **Documentation**: Comment complex logic, document API functions
5. **Test Coverage**: Aim for 80%+ unit test coverage

### GitHub Actions Workflow
1. **Push Early**: Push test files first to validate test setup
2. **Monitor Results**: Use GitHub mobile app to check workflow status
3. **Fix Fast**: Address test failures immediately
4. **Merge Often**: Don't let feature branches get stale

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