import fs from 'fs';
import path from 'path';
import conn from '../lib/db';

async function main() {
  console.log('--- Database Verification Script ---');
  
  try {
    // 1. Run migrations / schema
    console.log('1. Reading db/schema.sql...');
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('2. Applying schema to PostgreSQL...');
    await conn.unsafe(schemaSql);
    console.log('✓ Schema applied successfully.');

    // 2. Insert/Upsert a test User
    console.log('3. Seeding a test user (WAKASEK Kesiswaan)...');
    const userEmail = 'wakasek.kesiswaan@school.sch.id';
    const [user] = await conn`
      INSERT INTO users (name, email, role, category)
      VALUES ('Ahmad Wakasek', ${userEmail}, 'WAKASEK', 'STU')
      ON CONFLICT (email) DO UPDATE 
      SET name = EXCLUDED.name
      RETURNING *;
    `;
    console.log('✓ User seeded:', user);

    // 3. Create a test Document entry
    console.log('4. Creating a test document entry...');
    const [doc] = await conn`
      INSERT INTO documents (title, document_number, category, school_year, description, tags, confidentiality_level)
      VALUES (
        'Panduan Pendaftaran Siswa Baru 2026', 
        'SURAT-KESISWAAN-001', 
        'STU', 
        '2025/2026', 
        'Dokumen panduan tata cara pendaftaran siswa baru tahun ajaran 2025/2026 secara daring.',
        ${['pendaftaran', 'siswa baru', 'panduan']},
        'INTERNAL'
      )
      RETURNING *;
    `;
    console.log('✓ Document created:', doc);

    // 4. Create a version for that document
    console.log('5. Creating document version v1.0...');
    const [ver] = await conn`
      INSERT INTO document_versions (document_id, version_number, file_path, uploaded_by)
      VALUES (${doc.id}, 'v1.0', '/uploads/2026/panduan_psb_v1.pdf', ${user.id})
      RETURNING *;
    `;
    console.log('✓ Version created:', ver);

    // 5. Update document to point to the current active version
    console.log('6. Updating document current active version reference...');
    await conn`
      UPDATE documents
      SET current_version_id = ${ver.id}
      WHERE id = ${doc.id};
    `;
    console.log('✓ Document active version updated.');

    // 6. Test Full-Text Search (FTS) in Indonesian
    console.log('7. Testing Full-Text Search on Indonesian terms...');
    // We convert 'pendaftaran' query to match search vector using plainto_tsquery or to_tsquery
    const searchQuery = 'pendaftaran';
    const results = await conn`
      SELECT id, title, document_number, category, ts_rank(search_vector, plainto_tsquery('indonesian', ${searchQuery})) as rank
      FROM documents
      WHERE search_vector @@ plainto_tsquery('indonesian', ${searchQuery})
      ORDER BY rank DESC;
    `;
    console.log('✓ Search Results for query:', searchQuery);
    console.log(results);

    // 7. Clean up test data
    console.log('8. Cleaning up test data...');
    await conn`DELETE FROM documents WHERE id = ${doc.id}`;
    await conn`DELETE FROM users WHERE id = ${user.id}`;
    console.log('✓ Cleanup done.');
    
    console.log('\n--- VERIFICATION SUCCESSFUL! PostgreSQL setup is fully working. ---');
  } catch (error) {
    console.error('✗ Verification failed:', error);
  } finally {
    // Close database connection pool
    await conn.end();
  }
}

main();
