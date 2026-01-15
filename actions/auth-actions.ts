
'use server'

import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'
import { signIn } from "@/auth"
import { seedDefaultTrip } from "@/lib/seed-utils"

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

export async function createOwner(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!email || !password || !name) {
        return { error: "Missing fields" }
    }

    // Double check constraint
    // const count = await prisma.user.count()
    // if (count > 0) {
    //    return { error: "Owner account already exists." }
    // }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        })

        // Seed default trip
        await seedDefaultTrip(user.id)

    } catch (e) {
        return { error: "Failed to create user." }
    }

    // Attempt sign in
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
        return { error: "Failed to sign in after creation." }
    }
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
