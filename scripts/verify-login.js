
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
    const email = 'newid@example.com'
    const password = '1234'

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.error('User not found!')
        process.exit(1)
    }

    if (!user.password) {
        console.error('User has no password set!')
        process.exit(1)
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (isValid) {
        console.log('Login verification SUCCESS! Password matches.')
    } else {
        console.error('Login verification FAILED! Password does not match.')
        process.exit(1)
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
