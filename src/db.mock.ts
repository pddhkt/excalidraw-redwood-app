// Mock database for Storybook
// This file mocks the Prisma client for use in Storybook stories

export const db = {
  user: {
    findUnique: async () => ({
      id: 'mock-user-id',
      username: 'mockuser',
      tier: 'FREE' as const,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }),
    create: async () => ({
      id: 'mock-user-id',
      username: 'newuser',
      tier: 'FREE' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  },
  credential: {
    findMany: async () => [],
    create: async () => ({
      id: 'mock-credential-id',
      userId: 'mock-user-id',
      credentialID: new Uint8Array(),
      credentialPublicKey: new Uint8Array(),
      counter: 0,
      credentialDeviceType: 'singleDevice' as const,
      credentialBackedUp: false,
      transports: [],
      createdAt: new Date(),
    }),
  },
};

export async function setupDb() {
  return db;
}
