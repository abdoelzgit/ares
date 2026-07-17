const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/aresdb";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { code: 'GOV', name: 'Tata Kelola' },
  { code: 'CUR', name: 'Kurikulum' },
  { code: 'STU', name: 'Kesiswaan' },
  { code: 'BRD', name: 'Boarding' },
  { code: 'HRD', name: 'SDM' },
  { code: 'FIN', name: 'Keuangan' },
  { code: 'OPS', name: 'Operasional' },
  { code: 'QMS', name: 'Penjamin Mutu' },
  { code: 'COM', name: 'Humas' },
  { code: 'IT', name: 'Teknologi Informasi' },
];

async function run() {
  try {
    console.log("Seeding categories...");
    for (const cat of categories) {
      const dbCat = await prisma.category.upsert({
        where: { code: cat.code },
        update: {},
        create: {
          code: cat.code,
          name: cat.name,
        },
      });
      console.log(`- Category ${dbCat.code} (${dbCat.name}) is ready.`);
    }
    console.log("Seeding categories completed successfully!");
  } catch (err) {
    console.error("Error seeding categories:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
