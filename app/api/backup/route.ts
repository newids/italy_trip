
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { auth } from '@/auth'

export async function GET() {
    const session = await auth()
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

    if (!fs.existsSync(dbPath)) {
        return new NextResponse("Database not found", { status: 404 })
    }

    const fileBuffer = fs.readFileSync(dbPath)

    // Format date for filename
    const date = new Date().toISOString().split('T')[0]
    const filename = `trip-timetable-backup-${date}.db`

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'application/x-sqlite3',
        },
    })
}
