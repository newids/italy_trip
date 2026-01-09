'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Accommodation } from "@prisma/client"

export async function upsertAccommodation(dayId: string, data: { name: string, link?: string, note?: string }) {
    try {
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
        await prisma.accommodation.delete({
            where: { dayId }
        })
        revalidatePath(`/days/${dayId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete" }
    }
}
