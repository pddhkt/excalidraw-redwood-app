-- Add UserTier enum values and new columns to User table

-- Add the tier column with default value
ALTER TABLE "User" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'REGISTERED';

-- Add the lastLoginAt column (nullable)
ALTER TABLE "User" ADD COLUMN "lastLoginAt" DATETIME;

-- Add the lastActivity column with default value
ALTER TABLE "User" ADD COLUMN "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;