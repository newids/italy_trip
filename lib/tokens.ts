
import prisma from "@/lib/prisma"
import { randomInt } from "crypto"

export async function generateVerificationToken(email: string) {
    const token = randomInt(100000, 999999).toString()
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000) // 15 mins

    // Check if existing token exists
    const existingToken = await prisma.verificationToken.findFirst({
        where: { identifier: email }
    })

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: existingToken.token // or use id if model allowed, but schema uses composite unique
                }
            }
        })
    }

    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    })

    return verificationToken
}

export async function getVerificationTokenByEmail(email: string) {
    try {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { identifier: email }
        })
        return verificationToken
    } catch {
        return null
    }
}
