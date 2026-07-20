/*
  Warnings:

  - You are about to drop the column `category_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_category_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "category_id";

-- CreateTable
CREATE TABLE "user_category_access" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_category_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_category_access_user_id_idx" ON "user_category_access"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_category_access_user_id_category_id_key" ON "user_category_access"("user_id", "category_id");

-- AddForeignKey
ALTER TABLE "user_category_access" ADD CONSTRAINT "user_category_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_category_access" ADD CONSTRAINT "user_category_access_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
