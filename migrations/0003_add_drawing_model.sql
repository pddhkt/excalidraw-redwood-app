-- Add Drawing table with hybrid storage architecture
-- Metadata stored in D1, content stored in R2

-- CreateTable
CREATE TABLE "Drawing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentUrl" TEXT,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isPublic" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    "lastOpenedAt" DATETIME,
    CONSTRAINT "Drawing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Drawing_userId_status_updatedAt_idx" ON "Drawing"("userId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Drawing_userId_status_idx" ON "Drawing"("userId", "status");

-- CreateIndex
CREATE INDEX "Drawing_isPublic_idx" ON "Drawing"("isPublic");
