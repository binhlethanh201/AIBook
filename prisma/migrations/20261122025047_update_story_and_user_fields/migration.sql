UPDATE "Story"
SET "status" = 'Ongoing'
WHERE "status" IS NULL;

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "category",
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Ongoing';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;