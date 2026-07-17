import { prisma } from "../lib/prisma"

async function test() {
  try {
    console.log("Querying database tables...")
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("Tables in public schema:")
    tables.forEach((t: any) => {
      console.log(`- ${t.table_name}`)
    })

    console.log("\nQuerying database table columns for 'document_versions'...")
    const columns: any = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'document_versions'
    `
    console.log("Columns in 'document_versions' table:")
    columns.forEach((col: any) => {
      console.log(`- ${col.column_name} (${col.data_type})`)
    })
  } catch (err: any) {
    console.error("Failed to query information schema:", err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
