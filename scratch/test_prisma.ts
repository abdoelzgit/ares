import { prisma } from '../lib/prisma';

async function main() {
  console.log('--- Prisma Verification Script ---');
  
  try {
    // 1. Seed a test User
    console.log('1. Seeding a test user (WAKASEK Kesiswaan)...');
    const userEmail = 'wakasek.kesiswaan@school.sch.id';
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: 'Ahmad Wakasek' },
      create: {
        name: 'Ahmad Wakasek',
        email: userEmail,
        role: 'WAKASEK',
        category: 'STU',
      },
    });
    console.log('✓ User seeded:', user);

    // 2. Create a test Document entry
    console.log('2. Creating a test document entry...');
    const doc = await prisma.document.create({
      data: {
        title: 'Panduan Pendaftaran Siswa Baru 2026',
        documentNumber: 'SURAT-KESISWAAN-001',
        category: 'STU',
        schoolYear: '2025/2026',
        description: 'Dokumen panduan tata cara pendaftaran siswa baru tahun ajaran 2025/2026 secara daring.',
        tags: ['pendaftaran', 'siswa baru', 'panduan'],
        confidentialityLevel: 'INTERNAL',
      },
    });
    console.log('✓ Document created:', doc);

    // 3. Create a version for that document
    console.log('3. Creating document version v1.0...');
    const ver = await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: 'v1.0',
        filePath: '/uploads/2026/panduan_psb_v1.pdf',
        uploadedById: user.id,
      },
    });
    console.log('✓ Version created:', ver);

    // 4. Update document to point to the current active version
    console.log('4. Updating document current active version reference...');
    await prisma.document.update({
      where: { id: doc.id },
      data: { currentVersionId: ver.id },
    });
    console.log('✓ Document active version updated.');

    // 5. Test Full-Text Search (FTS) in Indonesian using raw query
    console.log('5. Testing Full-Text Search on Indonesian terms...');
    const searchQuery = 'pendaftaran';
    
    // We use raw query since search_vector is a custom PostgreSQL column not mapped directly in Prisma schema
    const results = await prisma.$queryRaw<any[]>`
      SELECT id, title, document_number as "documentNumber", category, ts_rank(search_vector, plainto_tsquery('indonesian', ${searchQuery})) as rank
      FROM documents
      WHERE search_vector @@ plainto_tsquery('indonesian', ${searchQuery})
      ORDER BY rank DESC;
    `;
    console.log('✓ Search Results for query:', searchQuery);
    console.log(results);

    // 6. Clean up test data
    console.log('6. Cleaning up test data...');
    await prisma.document.delete({ where: { id: doc.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✓ Cleanup done.');
    
    console.log('\n--- VERIFICATION SUCCESSFUL! Prisma setup is fully working. ---');
  } catch (error) {
    console.error('✗ Verification failed:', error);
  } finally {
    // Close Prisma Client connection
    await prisma.$disconnect();
  }
}

main();
