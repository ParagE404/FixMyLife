-- CreateTable
CREATE TABLE "CorrelationAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "correlations" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "predictions" JSONB NOT NULL,
    "dataPoints" INTEGER NOT NULL DEFAULT 0,
    "lastAnalyzed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrelationAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorrelationAnalysis_userId_key" ON "CorrelationAnalysis"("userId");

-- CreateIndex
CREATE INDEX "CorrelationAnalysis_userId_idx" ON "CorrelationAnalysis"("userId");

-- CreateIndex
CREATE INDEX "CorrelationAnalysis_lastAnalyzed_idx" ON "CorrelationAnalysis"("lastAnalyzed");

-- AddForeignKey
ALTER TABLE "CorrelationAnalysis" ADD CONSTRAINT "CorrelationAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
