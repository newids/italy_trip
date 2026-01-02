
'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function addLink(activityId: string, url: string, label: string) {
    const session = await auth()
    if (!session?.user) return

    const activity = await prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return

    const links = activity.links ? JSON.parse(activity.links as string) : []
    links.push({ url, label })

    await prisma.activity.update({
        where: { id: activityId },
        data: { links: JSON.stringify(links) }
    })
    revalidatePath('/[locale]/days/[id]')
}

export async function addImage(activityId: string, url: string) {
    const session = await auth()
    if (!session?.user) return

    const activity = await prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return

    const images = activity.images ? JSON.parse(activity.images as string) : []
    images.push(url)

    await prisma.activity.update({
        where: { id: activityId },
        data: { images: JSON.stringify(images) }
    })
    revalidatePath('/[locale]/days/[id]')
}

export async function removeLink(activityId: string, index: number) {
    const session = await auth()
    if (!session?.user) return

    const activity = await prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return

    const links = activity.links ? JSON.parse(activity.links as string) : []
    links.splice(index, 1)

    await prisma.activity.update({
        where: { id: activityId },
        data: { links: JSON.stringify(links) }
    })
    revalidatePath('/[locale]/days/[id]')
}

export async function removeImage(activityId: string, index: number) {
    const session = await auth()
    if (!session?.user) return

    const activity = await prisma.activity.findUnique({ where: { id: activityId } })
    if (!activity) return

    const images = activity.images ? JSON.parse(activity.images as string) : []
    images.splice(index, 1)

    await prisma.activity.update({
        where: { id: activityId },
        data: { images: JSON.stringify(images) }
    })
    revalidatePath('/[locale]/days/[id]')
}
