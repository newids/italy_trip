
import { Prisma } from '@prisma/client'

// Define types based on Prisma inclusions
export type TripWithDetails = Prisma.TripGetPayload<{
    include: {
        days: {
            include: {
                activities: true,
                highlights: true,
                accommodation: true,
            }
        },
        bookings: true
    }
}>

export type DayWithDetails = Prisma.DayGetPayload<{
    include: {
        activities: true,
        highlights: true,
        accommodation: true
    }
}>
