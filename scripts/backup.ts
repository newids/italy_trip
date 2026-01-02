
import * as fs from 'fs'
import * as path from 'path'
import { format } from 'date-fns' // Need to install date-fns or use standard Date

const BACKUP_DIR = path.join(process.cwd(), 'backups')
const DB_PATH = path.join(process.cwd(), 'dev.db')

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR)
}

function backup() {
    const now = new Date()
    // Manual format: YYYY-MM-DD_HH-mm-ss
    const timestamp = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-')
    const backupName = `backup_${timestamp}.db`
    const backupPath = path.join(BACKUP_DIR, backupName)

    console.log(`Backing up database...`)
    fs.copyFileSync(DB_PATH, backupPath)
    console.log(`Backup created at: ${backupPath}`)
    return backupPath
}

if (require.main === module) {
    backup()
}

export { backup }
