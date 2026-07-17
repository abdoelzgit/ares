import { prisma } from "../lib/prisma"

async function test() {
  try {
    console.log("Querying user-defined type for confidentiality_level...")
    const typeInfo: any = await prisma.$queryRaw`
      SELECT udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'confidentiality_level'
    `
    console.log("User-defined type (udt_name):", typeInfo)

    if (typeInfo.length > 0) {
      const udtName = typeInfo[0].udt_name
      const enumValues: any = await prisma.$queryRawUnsafe(`
        SELECT enumlabel 
        FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = '${udtName}'
      `)
      console.log(`Values in enum '${udtName}':`, enumValues)
    }

  } catch (err: any) {
    console.error("Failed to query enum type:", err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
