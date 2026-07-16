-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DIREKTUR', 'WAKASEK', 'GURU', 'PEMBINA', 'TU', 'KEUANGAN');

-- CreateEnum
CREATE TYPE "DocCategory" AS ENUM ('GOV', 'CUR', 'STU', 'BRD', 'HRD', 'FIN', 'OPS', 'QMS', 'COM', 'IT');

-- CreateEnum
CREATE TYPE "ConfidentialityLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "category" "DocCategory",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "document_number" TEXT,
    "category" "DocCategory" NOT NULL,
    "school_year" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidentiality_level" "ConfidentialityLevel" NOT NULL DEFAULT 'INTERNAL',
    "current_version_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "document_id" UUID NOT NULL,
    "version_number" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "is_cold_storage" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "documents_current_version_id_key" ON "documents"("current_version_id");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "documents_school_year_idx" ON "documents"("school_year");

-- CreateIndex
CREATE INDEX "document_versions_document_id_idx" ON "document_versions"("document_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ==========================================
-- CUSTOM ADDITIONS FOR FULL-TEXT SEARCH (FTS)
-- ==========================================

-- Enable UUID extension if not enabled (done at top)

-- Add search_vector column to documents
ALTER TABLE "documents" ADD COLUMN "search_vector" tsvector;

-- Trigger function to automatically update search_vector
CREATE OR REPLACE FUNCTION documents_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('indonesian', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.document_number, '')), 'B') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS tsvectorupdate ON "documents";
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON "documents" FOR EACH ROW EXECUTE FUNCTION documents_search_trigger();

-- Create GIN index for search vector
CREATE INDEX IF NOT EXISTS "idx_documents_search" ON "documents" USING gin("search_vector");
