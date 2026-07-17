import { prisma } from "../lib/prisma"

const db = prisma as any

async function test() {
  try {
    const user = await db.user.findFirst()
    const category = await db.category.findFirst()

    if (!user || !category) {
      console.log("No user or category found. Please seed first.")
      return
    }

    console.log("Applying dynamic trigger function fix...")
    await db.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION documents_search_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('simple', COALESCE(NEW.document_number, '')), 'B') ||
          setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;
    `)
    console.log("Trigger fix applied.")

    console.log("Attempting to create a test document...")
    const doc = await db.document.create({
      data: {
        title: "Test Document NATIVE",
        documentNumber: "TEST-NAT-001",
        schoolYear: "2026",
        confidentialityLevel: "INTERNAL",
        category: {
          connect: { id: category.id }
        },
        versions: {
          create: {
            versionNumber: "v1.0",
            filePath: "/uploads/test-native.pdf",
            uploadedById: user.id,
          },
        },
      },
      include: {
        versions: true,
      },
    })
    console.log("Document created successfully:", doc)
  } catch (err: any) {
    console.error("Test failed with error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
