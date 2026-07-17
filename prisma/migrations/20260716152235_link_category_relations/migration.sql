/*
  Warnings:

  - You are about to drop the column `category` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `users` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "documents_category_idx";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "category",
ADD COLUMN     "category_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "category",
ADD COLUMN     "category_id" UUID;

-- DropEnum
DROP TYPE "DocCategory";

-- CreateIndex
CREATE INDEX "documents_category_id_idx" ON "documents"("category_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
