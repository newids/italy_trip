'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Accommodation } from "@prisma/client"

import { verifyDayAccess, verifyAccommodationAccess } from "@/lib/auth-utils"

export async function upsertAccommodation(dayId: string, data: { name: string, link?: string, note?: string }) {
    try {
        // Since it's upsert on Day, Day ownership check is sufficient for both cases (create or update linked to that day)
        await verifyDayAccess(dayId)

        const accommodation = await prisma.accommodation.upsert({
            where: { dayId },
            update: {
                name: data.name,
                link: data.link || null,
                note: data.note || null
            },
            create: {
                dayId,
                name: data.name,
                link: data.link || null,
                note: data.note || null
            }
        })
        revalidatePath(`/days/${dayId}`)
        return { success: true, data: accommodation }
    } catch (e) {
        console.error(e)
        return { error: "Failed to save accommodation" }
    }
}

export async function deleteAccommodation(dayId: string) {
    try {
        await verifyDayAccess(dayId) // Accommodation is unique per Day, so deleting by dayId implies checking day access

        await prisma.accommodation.delete({
            where: { dayId }
        })
        revalidatePath(`/days/${dayId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete" }
    }
}
