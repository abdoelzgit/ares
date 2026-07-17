import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

const db = prisma as any;

async function run() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  try {
    const user = await db.user.upsert({
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
  }
}

run();
