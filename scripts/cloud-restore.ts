
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import 'dotenv/config'
import { backup } from './backup'

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})

const BUCKET_NAME = process.env.AWS_BUCKET
const DB_PATH = path.join(process.cwd(), 'dev.db')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function listBackups() {
    if (!BUCKET_NAME) {
        console.error('AWS_BUCKET is not defined')
        return []
    }

    const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'backups/'
    })

    try {
        const response = await s3.send(command)
        return response.Contents || []
    } catch (err) {
        console.error('Failed to list backups:', err)
        return []
    }
}

async function restore() {
    console.log('Fetching backups from Cloud...')
    const backups = await listBackups()
    if (backups.length === 0) {
        console.log('No backups found.')
        rl.close()
        return
    }

    // Sort by date desc
    backups.sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))

    console.log('\nAvailable Backups:')
    backups.forEach((b, i) => {
        console.log(`${i + 1}. ${b.Key} (${b.LastModified})`)
    })

    rl.question('\nEnter number to restore (or q to quit): ', async (answer) => {
        if (answer.toLowerCase() === 'q') {
            rl.close()
            return
        }

        const index = parseInt(answer) - 1
        if (index >= 0 && index < backups.length) {
            const selected = backups[index]
            console.log(`Restoring ${selected.Key}...`)

            // Safety: Local backup first
            console.log('Creating safety local backup first...')
            backup()

            try {
                const getCmd = new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: selected.Key
                })
                const response = await s3.send(getCmd)
                // Convert stream to buffer
                const byteArray = await response.Body?.transformToByteArray()

                if (byteArray) {
                    fs.writeFileSync(DB_PATH, Buffer.from(byteArray))
                    console.log('Restore successfully completed!')
                }
            } catch (err) {
                console.error('Restore failed:', err)
            }
        } else {
            console.log('Invalid selection')
        }
        rl.close()
    })
}

if (require.main === module) {
    restore()
}
