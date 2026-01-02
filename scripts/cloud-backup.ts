
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'
import { backup } from './backup' // Import local backup function

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})

const BUCKET_NAME = process.env.AWS_BUCKET

async function uploadBackup() {
    if (!BUCKET_NAME) {
        console.error('AWS_BUCKET is not defined in .env')
        return
    }

    // 1. Create local backup
    const backupPath = backup()
    const backupName = path.basename(backupPath)

    // 2. Upload to S3
    const fileContent = fs.readFileSync(backupPath)

    try {
        console.log(`Uploading ${backupName} to S3 bucket ${BUCKET_NAME}...`)
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `backups/${backupName}`,
            Body: fileContent
        }))
        console.log('Upload successful!')
    } catch (err) {
        console.error('Upload failed:', err)
    }
}

if (require.main === module) {
    uploadBackup()
}
