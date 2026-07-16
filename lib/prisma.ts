import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PostgreSQL Connection string from Environment Variable or fallback to localhost
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/aresdb';

const pool = new Pool({
  connectionString,
  max: 10,                 // Maximum connections in pool
  idleTimeoutMillis: 20000, // Close idle connections after 20 seconds
  connectionTimeoutMillis: 10000, // Timeout after 10 seconds on connect
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
