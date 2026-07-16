import postgres from 'postgres';

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// PostgreSQL Connection string from Environment Variable or fallback to localhost
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/siad_sekolah';

export const conn = globalForDb.conn ?? postgres(connectionString, {
  max: 10,             // Maximum number of connections in the pool
  idle_timeout: 20,    // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = conn;
}

export default conn;
