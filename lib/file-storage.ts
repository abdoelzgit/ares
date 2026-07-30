import { randomUUID } from "crypto";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";


const STORAGE_ROOT = process.env.STORAGE_PATH || path.join(process.cwd(), "storage")

export async function saveFile(file: File, subfolder = "documents"): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name)
    const uniqueName = `${randomUUID()}${ext}`

    const targetDir = path.join(STORAGE_ROOT, subfolder)
    await mkdir(targetDir, { recursive: true })

    const absolutePath = path.join(targetDir, uniqueName)
    await writeFile(absolutePath, buffer)

    return path.join(subfolder, uniqueName)
}

export async function deleteFile(relativePath: string): Promise<void> {
    const absolutePath = path.join(STORAGE_ROOT, relativePath)
    await unlink(absolutePath).catch(() => { })
}

export function resolveStoragePath(relativePath: string): string {
  return path.join(STORAGE_ROOT, relativePath)
}