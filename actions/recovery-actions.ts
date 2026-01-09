
'use server'

import { generateVerificationToken, getVerificationTokenByEmail } from "@/lib/tokens"
import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'

export async function sendOTP(email: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    // We do not reveal if user does not exist for security, but for owner app it's fine?
    // User requested "find password through send a one-time-password".
    if (!existingUser) {
        return { error: "User not found" }
    }

    const verificationToken = await generateVerificationToken(email)

    // MOCK SENDING - Log to console as per plan
    console.log("------------------------------------------")
    console.log(`[Generated OTP] for ${email}: ${verificationToken.token}`)
    console.log("------------------------------------------")

    return { success: "OTP sent to console (Dev Mode)" }
}

export async function resetPassword(email: string, token: string, newPassword: string) {
    if (!email || !token || !newPassword) return { error: "Missing fields" }

    const existingToken = await getVerificationTokenByEmail(email)

    if (!existingToken) {
        return { error: "Invalid token" }
    }

    if (existingToken.token !== token) {
        return { error: "Invalid token" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) {
        return { error: "Token has expired" }
    }

    // Success - Update Password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    // Delete token
    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: email,
                token
            }
        }
    })

    return { success: "Password updated successfully" }
}
