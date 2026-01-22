
'use server'

import prisma from "@/lib/prisma"
import { auth, signOut } from "@/auth"
import bcrypt from 'bcryptjs'

export async function updateEmail(newEmail: string) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    if (!newEmail || !newEmail.includes('@')) return { error: "Invalid email" }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { email: newEmail }
        })
        // We do not need to sign out, session might persist but email in DB is updated.
        // Next time session refreshes it should have new email? 
        // Or we force signout to ensure security.
        return { success: "Email updated" }
    } catch (e) {
        return { error: "Failed to update email" }
    }
}

export async function updateName(newName: string) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    if (!newName || newName.trim().length === 0) return { error: "Invalid name" }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { name: newName }
        })
        return { success: "Name updated" }
    } catch (e) {
        return { error: "Failed to update name" }
    }
}

export async function deleteAccount() {
    const session = await auth()
    if (!session?.user?.email) return { error: "Not authenticated" }

    try {
        await prisma.user.delete({
            where: { email: session.user.email }
        })
        // Sign out handled by client or redirect?
        // We can call signOut server side.
        await signOut({ redirect: true, redirectTo: "/" })
    } catch (e) {
        return { error: "Failed to delete account" }
    }
}
