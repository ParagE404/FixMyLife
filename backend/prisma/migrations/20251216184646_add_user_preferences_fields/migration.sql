-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT 'green',
ADD COLUMN     "dailyReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "goalAchievements" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "streakAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "weeklyReports" BOOLEAN NOT NULL DEFAULT true;
