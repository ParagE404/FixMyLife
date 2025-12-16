-- CreateTable
CREATE TABLE "UserPatterns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patterns" JSONB NOT NULL,
    "lastAnalyzed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPatterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timing" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isActedOn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatternSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPatterns_userId_key" ON "UserPatterns"("userId");

-- CreateIndex
CREATE INDEX "UserPatterns_userId_idx" ON "UserPatterns"("userId");

-- CreateIndex
CREATE INDEX "UserPatterns_lastAnalyzed_idx" ON "UserPatterns"("lastAnalyzed");

-- CreateIndex
CREATE INDEX "PatternSuggestion_userId_idx" ON "PatternSuggestion"("userId");

-- CreateIndex
CREATE INDEX "PatternSuggestion_createdAt_idx" ON "PatternSuggestion"("createdAt");

-- CreateIndex
CREATE INDEX "PatternSuggestion_expiresAt_idx" ON "PatternSuggestion"("expiresAt");

-- CreateIndex
CREATE INDEX "PatternSuggestion_isRead_idx" ON "PatternSuggestion"("isRead");

-- AddForeignKey
ALTER TABLE "UserPatterns" ADD CONSTRAINT "UserPatterns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternSuggestion" ADD CONSTRAINT "PatternSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
