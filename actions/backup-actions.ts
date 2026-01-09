
'use server'

import fs from 'fs'
import path from 'path'
import { auth } from '@/auth'
import prisma from "@/lib/prisma"

export async function restoreDatabase(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const file = formData.get('backupFile') as File
    if (!file) return { error: "No file provided" }

    if (!file.name.endsWith('.db')) return { error: "Invalid file format. Must be .db" }

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

        // Disconnect before writing to avoid locking issues (though SQLite WAL might handle it, safer to disconnect)
        await prisma.$disconnect()

        fs.writeFileSync(dbPath, buffer)

        return { success: "Database restored successfully. Please refresh." }
    } catch (e) {
        console.error(e)
        return { error: "Failed to restore database." }
    }
}
