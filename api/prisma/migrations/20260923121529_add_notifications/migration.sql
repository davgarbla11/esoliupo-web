-- AlterTable
ALTER TABLE "events" ADD COLUMN     "notifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "trainings" ADD COLUMN     "notifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifyEvents" BOOLEAN NOT NULL DEFAULT true;
