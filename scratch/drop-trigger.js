const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/aresdb";

const pool = new Pool({
  connectionString,
});

async function run() {
  try {
    console.log("Dropping stale trigger 'tsvectorupdate' on 'documents' table...");
    await pool.query(`DROP TRIGGER IF EXISTS tsvectorupdate ON documents;`);
    console.log("Trigger dropped successfully!");
  } catch (err) {
    console.error("Error dropping trigger:", err);
  } finally {
    await pool.end();
  }
}

run();
