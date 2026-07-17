const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/aresdb";

const pool = new Pool({
  connectionString,
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'documents';
    `);
    console.log("Columns in 'documents' table:");
    console.log(res.rows);
  } catch (err) {
    console.error("Error inspecting database:", err);
  } finally {
    await pool.end();
  }
}

run();
