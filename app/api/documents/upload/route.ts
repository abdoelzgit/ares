import { NextResponse } from "next/server"
import { uploadDocument } from "@/app/dashboard/archive/[year]/[category]/actions"

export async function POST(request: Request) {
  const formData = await request.formData()
  const schoolYear = formData.get("schoolYear")
  const categoryCode = formData.get("categoryCode")
  const folderId = formData.get("folderId")

  if (typeof schoolYear !== "string" || typeof categoryCode !== "string") {
    return NextResponse.json({ success: false, error: "Tujuan upload tidak valid." }, { status: 400 })
  }

  const result = await uploadDocument(
    formData,
    schoolYear,
    categoryCode,
    typeof folderId === "string" && folderId ? folderId : null,
  )

  return NextResponse.json(result.success ? { success: true } : result, { status: result.success ? 200 : 400 })
}
