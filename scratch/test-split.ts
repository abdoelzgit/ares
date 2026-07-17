import { prisma } from "../lib/prisma"

const db = prisma as any

async function test() {
  try {
    const user = await db.user.findFirst()
    const category = await db.category.findFirst()

    if (!user || !category) {
      console.log("No user or category found.")
      return
    }

    console.log("Step 1: Attempting to create Document only (without versions relation)...")
    const doc = await db.document.create({
      data: {
        title: "Test Document Split",
        documentNumber: "TEST-SPLIT-001",
        schoolYear: "2026",
        confidentialityLevel: "INTERNAL",
        category: {
          connect: { id: category.id }
        }
      }
    })
    console.log("Document created successfully:", doc)

    console.log("\nStep 2: Attempting to create DocumentVersion for this document...")
    const version = await db.documentVersion.create({
      data: {
        versionNumber: "v1.0",
        filePath: "/uploads/test-split.pdf",
        document: {
          connect: { id: doc.id }
        },
        uploadedBy: {
          connect: { id: user.id }
        }
      }
    })
    console.log("DocumentVersion created successfully:", version)

    console.log("\nStep 3: Attempting to link currentVersionId...")
    const updatedDoc = await db.document.update({
      where: { id: doc.id },
      data: {
        currentVersionId: version.id
      }
    })
    console.log("Document updated successfully with currentVersionId:", updatedDoc)

  } catch (err: any) {
    console.error("Test failed with error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
