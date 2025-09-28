import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Mock Prisma client for tests
vi.mock('@/db', () => ({
  db: {
    user: {
      create: vi.fn(),
      createMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn()
    },
    credential: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}))

// Global test setup
beforeEach(() => {
  // Reset any mocks or test state before each test
  vi.clearAllMocks()
})

// Mock environment variables if needed
process.env.NODE_ENV = 'test'