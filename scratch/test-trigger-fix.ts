import { prisma } from "../lib/prisma"

async function test() {
  try {
    console.log("Updating documents_search_trigger function to use 'simple' instead of 'indonesian'...")
    await prisma.$executeRawUnsafe(`
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
    console.log("Trigger function updated successfully!")
  } catch (err: any) {
    console.error("Failed to update trigger function:", err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
