'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { Trip, Day, Activity, Booking, Accommodation, Highlight } from "@prisma/client"

// Type definition for the shareable format
export type ShareableTrip = {
    metadata: {
        version: string
        appName: string
        createdAt: string
    }
    trip: Partial<Trip> & {
        days: (Partial<Day> & {
            activities: Partial<Activity>[]
            accommodation: Partial<Accommodation> | null
            highlights: Partial<Highlight>[]
        })[]
        bookings: Partial<Booking>[]
    }
}

/**
 * Export a trip to JSON
 */
export async function exportTrip(tripId: string): Promise<{ data?: ShareableTrip, error?: string }> {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const trip = await prisma.trip.findUnique({
            where: { id: tripId, userId: session.user.id },
            include: {
                days: {
                    include: {
                        activities: { orderBy: { order: 'asc' } },
                        accommodation: true,
                        highlights: true
                    },
                    orderBy: { dayNumber: 'asc' }
                },
                bookings: true
            }
        })

        if (!trip) return { error: "Trip not found" }

        // Sanitize: Remove IDs and foreign keys
        const sanitizedTrip: any = { ...trip }
        delete sanitizedTrip.id
        delete sanitizedTrip.userId
        delete sanitizedTrip.createdAt
        delete sanitizedTrip.updatedAt

        sanitizedTrip.days = trip.days.map((d: any) => {
            const cleanDay = { ...d }
            delete cleanDay.id
            delete cleanDay.tripId

            cleanDay.activities = d.activities.map((a: any) => {
                const cleanA = { ...a }
                delete cleanA.id
                delete cleanA.dayId
                return cleanA
            })

            if (d.accommodation) {
                delete cleanDay.accommodation.id
                delete cleanDay.accommodation.dayId
            }

            cleanDay.highlights = d.highlights.map((h: any) => {
                const cleanH = { ...h }
                delete cleanH.id
                delete cleanH.dayId
                return cleanH
            })

            return cleanDay
        })

        sanitizedTrip.bookings = trip.bookings.map((b: any) => {
            const cleanB = { ...b }
            delete cleanB.id
            delete cleanB.tripId
            return cleanB
        })

        const shareable: ShareableTrip = {
            metadata: {
                version: "1.0",
                appName: "TripTimeTable",
                createdAt: new Date().toISOString()
            },
            trip: sanitizedTrip
        }

        return { data: shareable }
    } catch (e) {
        console.error(e)
        return { error: "Export failed" }
    }
}

/**
 * Import a trip from JSON
 */
export async function importTrip(jsonStr: string): Promise<{ success?: boolean, error?: string, tripId?: string }> {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const data: ShareableTrip = JSON.parse(jsonStr)

        // Basic Validation
        if (!data.trip || !data.trip.title) return { error: "Invalid trip format" }

        // Create Trip
        const newTrip = await prisma.trip.create({
            data: {
                userId: session.user.id,
                title: data.trip.title || "Untitled Import",
                subtitle: data.trip.subtitle || "",
                description: data.trip.description || "",
                startDate: new Date(data.trip.startDate!),
                endDate: new Date(data.trip.endDate!),
                isPublic: false, // Default to private on import
                features: data.trip.features || "[]"
            }
        })

        // Create Days & Relations
        if (data.trip.days) {
            for (const d of data.trip.days) {
                const newDay = await prisma.day.create({
                    data: {
                        tripId: newTrip.id,
                        dayNumber: d.dayNumber!,
                        date: new Date(d.date!),
                        title: d.title || "",
                        city: d.city || null,
                        transport: d.transport || null
                    }
                })

                // Activities
                if (d.activities) {
                    for (const a of d.activities) {
                        await prisma.activity.create({
                            data: {
                                dayId: newDay.id,
                                order: a.order!,
                                description: a.description!,
                                type: a.type || null,
                                location: a.location || null,
                                time: a.time || null,
                                images: a.images || null,
                                links: a.links || null
                            }
                        })
                    }
                }

                // Accommodation
                if (d.accommodation) {
                    await prisma.accommodation.create({
                        data: {
                            dayId: newDay.id,
                            name: d.accommodation.name!,
                            link: d.accommodation.link || null,
                            note: d.accommodation.note || null
                        }
                    })
                }

                // Highlights
                if (d.highlights) {
                    for (const h of d.highlights) {
                        await prisma.highlight.create({
                            data: {
                                dayId: newDay.id,
                                type: h.type!,
                                content: h.content!
                            }
                        })
                    }
                }
            }
        }

        // Create Bookings
        if (data.trip.bookings) {
            for (const b of data.trip.bookings) {
                await prisma.booking.create({
                    data: {
                        tripId: newTrip.id,
                        title: b.title!,
                        type: b.type!,
                        details: b.details!,
                        confirmationCode: b.confirmationCode || null,
                        provider: b.provider || null,
                        date: b.date ? new Date(b.date) : null
                    }
                })
            }
        }

        revalidatePath('/')
        return { success: true, tripId: newTrip.id }

    } catch (e) {
        console.error("Import error:", e)
        return { error: "Failed to import trip. Check file format." }
    }
}
