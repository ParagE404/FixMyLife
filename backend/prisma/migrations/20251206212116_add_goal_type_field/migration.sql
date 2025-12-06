/*
  Warnings:

  - You are about to drop the column `progressValue` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `targetUnit` on the `Goal` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Goal_categoryId_idx";

-- DropIndex
DROP INDEX "Goal_status_idx";

-- DropIndex
DROP INDEX "Goal_userId_idx";

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "progressValue",
DROP COLUMN "targetUnit",
ALTER COLUMN "goalType" SET DEFAULT 'habit';
