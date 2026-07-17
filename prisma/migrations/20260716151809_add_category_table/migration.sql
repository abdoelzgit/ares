/*
  Warnings:

  - You are about to drop the column `search_vector` on the `documents` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_documents_search";

-- AlterTable
ALTER TABLE "document_versions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "search_vector",
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");
