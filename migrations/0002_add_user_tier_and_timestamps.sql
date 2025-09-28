-- Add UserTier enum values and new columns to User table

-- Add the tier column with default value
ALTER TABLE "User" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'REGISTERED';

-- Add the lastLoginAt column (nullable)
ALTER TABLE "User" ADD COLUMN "lastLoginAt" DATETIME;

-- Add the lastActivity column with default value
ALTER TABLE "User" ADD COLUMN "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create a check constraint to ensure tier is one of the valid values
-- Note: SQLite doesn't have native enum support, so we use CHECK constraint
-- This will be enforced by Prisma at the application level as well
CREATE TABLE "User_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'REGISTERED' CHECK ("tier" IN ('GUEST', 'REGISTERED', 'TEAM_MEMBER')),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data to new table
INSERT INTO "User_new" ("id", "username", "createdAt", "tier", "lastActivity")
SELECT "id", "username", "createdAt", 'REGISTERED', CURRENT_TIMESTAMP
FROM "User";

-- Drop old table and rename new table
DROP TABLE "User";
ALTER TABLE "User_new" RENAME TO "User";

-- Recreate the unique index for username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Update foreign key constraints by recreating the Credential table
CREATE TABLE "Credential_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credentialId" TEXT NOT NULL,
    "publicKey" BLOB NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy credential data
INSERT INTO "Credential_new" SELECT * FROM "Credential";

-- Drop old credential table and rename new one
DROP TABLE "Credential";
ALTER TABLE "Credential_new" RENAME TO "Credential";

-- Recreate credential indexes
CREATE UNIQUE INDEX "Credential_userId_key" ON "Credential"("userId");
CREATE UNIQUE INDEX "Credential_credentialId_key" ON "Credential"("credentialId");
CREATE INDEX "Credential_credentialId_idx" ON "Credential"("credentialId");
CREATE INDEX "Credential_userId_idx" ON "Credential"("userId");