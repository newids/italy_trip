'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createHighlight(dayId: string, data: { type: string, content: string }) {
    try {
        await prisma.highlight.create({
            data: {
                dayId,
                type: data.type,
                content: data.content
            }
        })
        revalidatePath(`/days/${dayId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to create" }
    }
}

export async function updateHighlight(id: string, content: string) {
    try {
        await prisma.highlight.update({
            where: { id },
            data: { content }
        })
        revalidatePath('/days/[id]') // HACK: Revalidate generic path as we don't have dayId easily here without fetch
        return { success: true }
    } catch (e) {
        return { error: "Failed to update" }
    }
}

export async function deleteHighlight(id: string) {
    try {
        await prisma.highlight.delete({ where: { id } })
        revalidatePath('/days/[id]')
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete" }
    }
}
