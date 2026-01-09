'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Booking } from "@prisma/client"

export async function createBooking(tripId: string, data: { type: string, title: string, details: string }) {
    try {
        await prisma.booking.create({
            data: {
                tripId,
                type: data.type,
                title: data.title,
                details: data.details
            }
        })
        revalidatePath(`/trips/${tripId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to create booking" }
    }
}

export async function updateBooking(id: string, data: Partial<Booking>) {
    try {
        const { id: _, tripId, ...updateData } = data as any
        const updated = await prisma.booking.update({
            where: { id },
            data: updateData
        })
        revalidatePath(`/trips/${updated.tripId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to update booking" }
    }
}

export async function deleteBooking(id: string) {
    try {
        const deleted = await prisma.booking.delete({ where: { id } })
        revalidatePath(`/trips/${deleted.tripId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete booking" }
    }
}
