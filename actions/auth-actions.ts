
'use server'

import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'
import { signIn } from "@/auth"
import { seedDefaultTrip } from "@/lib/seed-utils"
import { generateVerificationToken, getVerificationTokenByEmail } from "@/lib/tokens"

export async function getOwnerStatus() {
    const userCount = await prisma.user.count()
    if (userCount > 0) {
        const owner = await prisma.user.findFirst({
            select: { email: true, name: true }
        })
        return {
            exists: true,
            email: owner?.email || null,
            name: owner?.name || null
        }
    }
    return { exists: false, email: null, name: null }
}

export async function checkEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
    })
    return { exists: !!user }
}

export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!email || !password || !name) {
        return { error: "Missing fields" }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return { error: "User already exists" }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        })

        // Generate Token
        const token = await generateVerificationToken(email)

        // MOCK EMAIL SENDING
        console.log("------------------------------------------")
        console.log(`[VERIFY EMAIL] for ${email}: ${token.token}`)
        console.log("------------------------------------------")

        return { success: true }

    } catch (e) {
        return { error: "Failed to create user." }
    }
}

export async function verifyEmail(email: string, token: string) {
    const existingToken = await getVerificationTokenByEmail(email)

    if (!existingToken || existingToken.token !== token) {
        return { error: "Invalid token" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) {
        return { error: "Token has expired" }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (!existingUser) return { error: "User not found" }

    await prisma.user.update({
        where: { email },
        data: {
            emailVerified: new Date(),
            email // Ensure email matches if changed
        }
    })

    await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token } }
    })

    // Auto login after verification?
    // Usually standard flow asks to login again, but for UX we can try to login if we had password... 
    // But we don't have password here. So just return success.
    return { success: true }
}

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { error: "Missing fields" }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/"
        })
    } catch (error) {
        if ((error as Error).message.includes('NEXT_REDIRECT')) {
            throw error;
        }
        // If we get here, it's likely a credential error
        return { error: "Invalid password" }
    }
}
