'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Activity, Day } from "@prisma/client"

export type ActivityType = 'SIGHTSEEING' | 'MEAL' | 'TRANSPORT' | 'HOTEL' | 'MEMO' | 'OTHER'

// --- Day Actions ---
export async function updateDay(id: string, data: Partial<Day>) {
    try {
        const { id: _, tripId: __, ...updateData } = data as any
        const updated = await prisma.day.update({
            where: { id },
            data: updateData
        })
        revalidatePath(`/days/${id}`)
        return { success: true, data: updated }
    } catch (e) {
        return { error: "Failed to update day" }
    }
}

// --- Activity Actions ---

export async function createActivity(dayId: string, data: {
    type: string,
    description: string,
    time?: string,
    order: number
}) {
    try {
        // Shift existing items if inserting in middle
        await prisma.activity.updateMany({
            where: { dayId, order: { gte: data.order } },
            data: { order: { increment: 1 } }
        })

        const newActivity = await prisma.activity.create({
            data: {
                dayId,
                type: data.type || 'SIGHTSEEING',
                description: data.description,
                time: data.time || null,
                order: data.order,
                links: JSON.stringify([]),
                images: JSON.stringify([])
            }
        })
        revalidatePath(`/days/${dayId}`)
        return { success: true, data: newActivity }
    } catch (e) {
        console.error(e)
        return { error: "Failed to create activity" }
    }
}

export async function updateActivity(id: string, data: Partial<Activity>) {
    try {
        const { id: _, dayId: __, ...updateData } = data as any // Prevent ID updates

        const updated = await prisma.activity.update({
            where: { id },
            data: updateData
        })
        revalidatePath(`/days/${updated.dayId}`)
        return { success: true, data: updated }
    } catch (e) {
        return { error: "Failed to update activity" }
    }
}

export async function deleteActivity(id: string) {
    try {
        const deleted = await prisma.activity.delete({
            where: { id }
        })
        revalidatePath(`/days/${deleted.dayId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete" }
    }
}
