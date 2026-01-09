
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
    console.log('Resetting database for First-Run Owner Signup...')

    // Delete all users. Cascade will delete trips, sessions, etc.
    // This allows the "First-Run" logic in layout.tsx to trigger.
    const deletedUsers = await prisma.user.deleteMany({})

    console.log(`Deleted ${deletedUsers.count} users.`)
    console.log('Database is clean. You can now visit the app to Trigger the Owner Signup flow.')
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
