/*
  Warnings:

  - You are about to drop the column `school_year` on the `documents` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "documents_school_year_idx";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "school_year",
ADD COLUMN     "school_year_id" UUID;

-- CreateTable
CREATE TABLE "archive_years" (
    "id" UUID NOT NULL,
    "year" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archive_years_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "archive_years_year_key" ON "archive_years"("year");

-- CreateIndex
CREATE INDEX "documents_school_year_id_idx" ON "documents"("school_year_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "archive_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;
