import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export class AuthError extends Error {
    constructor(message: string = "Unauthorized") {
        super(message)
        this.name = "AuthError"
    }
}

/**
 * Verifies that the current user is authenticated.
 * Returns the session user object.
 */
export async function verifyAuth() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new AuthError("You must be logged in.")
    }
    return session.user
}

/**
 * Verifies that the current user is the owner of the trip.
 */
export async function verifyTripAccess(tripId: string) {
    const user = await verifyAuth()

    // Check ownership
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true, isPublic: true }
    })

    if (!trip) {
        throw new Error("Trip not found")
    }

    if (trip.userId !== user.id) {
        throw new AuthError("You do not have permission to modify this trip.")
    }

    return { user, trip }
}

/**
 * Verifies access to a day (via trip ownership).
 */
export async function verifyDayAccess(dayId: string) {
    const user = await verifyAuth()

    const day = await prisma.day.findUnique({
        where: { id: dayId },
        select: { id: true, trip: { select: { userId: true } } }
    })

    if (!day) {
        throw new Error("Day not found")
    }

    if (day.trip.userId !== user.id) {
        throw new AuthError("You do not have permission to modify this day.")
    }

    return { user, day }
}

/**
 * Verifies access to an activity (via day -> trip ownership).
 */
export async function verifyActivityAccess(activityId: string) {
    const user = await verifyAuth()

    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        select: { id: true, day: { select: { trip: { select: { userId: true } } } } }
    })

    if (!activity) {
        throw new Error("Activity not found")
    }

    if (activity.day.trip.userId !== user.id) {
        throw new AuthError("You do not have permission to modify this activity.")
    }

    return { user, activity }
}

/**
 * Verifies access to a booking (via trip ownership).
 */
export async function verifyBookingAccess(bookingId: string) {
    const user = await verifyAuth()

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, trip: { select: { userId: true } } }
    })

    if (!booking) {
        throw new Error("Booking not found")
    }

    if (booking.trip.userId !== user.id) {
        throw new AuthError("You do not have permission to modify this booking.")
    }

    return { user, booking }
}

/**
 * Verifies access to accommodation (via day -> trip ownership).
 */
export async function verifyAccommodationAccess(accommodationId: string) {
    const user = await verifyAuth()

    const accommodation = await prisma.accommodation.findUnique({
        where: { id: accommodationId },
        select: { id: true, day: { select: { trip: { select: { userId: true } } } } }
    })

    if (!accommodation) {
        throw new Error("Accommodation not found")
    }

    if (accommodation.day.trip.userId !== user.id) {
        throw new AuthError("You do not have permission to modify this accommodation.")
    }

    return { user, accommodation }
}

/**
 * Verifies access to highlight (via day -> trip ownership).
 */
export async function verifyHighlightAccess(highlightId: string) {
    const user = await verifyAuth()

    const highlight = await prisma.highlight.findUnique({
        where: { id: highlightId },
        select: { id: true, day: { select: { trip: { select: { userId: true } } } } }
    })

    if (!highlight) {
        throw new Error("Highlight not found")
    }

    if (highlight.day.trip.userId !== user.id) {
        throw new AuthError("You do not have permission to modify this highlight.")
    }

    return { user, highlight }
}
