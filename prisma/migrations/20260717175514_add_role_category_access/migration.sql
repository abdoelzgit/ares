-- CreateTable
CREATE TABLE "role_category_access" (
    "id" UUID NOT NULL,
    "role" "UserRole" NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_category_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_category_access_role_idx" ON "role_category_access"("role");

-- CreateIndex
CREATE UNIQUE INDEX "role_category_access_role_category_id_key" ON "role_category_access"("role", "category_id");

-- AddForeignKey
ALTER TABLE "role_category_access" ADD CONSTRAINT "role_category_access_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
