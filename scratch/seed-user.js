const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/aresdb";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  try {
    const user = await prisma.user.upsert({
      where: { email: "direktur@school.sch.id" },
      update: {
        password: hashedPassword,
        role: "DIREKTUR",
      },
      create: {
        name: "Direktur Utama",
        email: "direktur@school.sch.id",
        password: hashedPassword,
        role: "DIREKTUR",
      },
    });
    console.log("User created/updated successfully:", user);
  } catch (err) {
    console.error("Error seeding user:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
