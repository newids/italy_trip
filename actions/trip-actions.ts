'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// --- Update ---
export async function updateTrip(tripId: string, data: { description?: string, title?: string, subtitle?: string, icon?: string, startDate?: Date, endDate?: Date }) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.trip.update({
            where: { id: tripId },
            data: {
                ...data
            }
        })
        revalidatePath(`/trips/${tripId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to update trip" }
    }
}

// --- Create ---
export async function createNewTrip(data: { title: string, days: number }) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const today = new Date()
        const endDate = new Date(today)
        endDate.setDate(today.getDate() + data.days - 1)

        const trip = await prisma.trip.create({
            data: {
                userId: session.user.id,
                title: data.title,
                startDate: today,
                endDate: endDate,
                description: "New trip description...",
                isPublic: false
            }
        })

        // Create Days
        for (let i = 0; i < data.days; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)

            await prisma.day.create({
                data: {
                    tripId: trip.id,
                    dayNumber: i + 1,
                    date: date,
                    title: `Day ${i + 1}`,
                    city: 'City Name',
                    transport: 'Transport info'
                }
            })
        }

        revalidatePath('/')
        return { success: true, tripId: trip.id }

    } catch (e) {
        console.error(e)
        return { error: "Failed to create trip" }
    }
}
