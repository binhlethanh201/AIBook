-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "author" TEXT,
ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;
