
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        // Fetch the trip (assuming there's only one for now, or take the latest)
        const trip = await prisma.trip.findFirst({
            include: {
                days: {
                    include: {
                        activities: {
                            orderBy: { order: 'asc' }
                        },
                        highlights: true,
                        accommodation: true,
                    },
                    orderBy: { dayNumber: 'asc' }
                },
                bookings: true,
            },
            orderBy: { startDate: 'asc' }
        })

        if (!trip) {
            return NextResponse.json({ error: 'No trip found' }, { status: 404 })
        }

        return NextResponse.json(trip)
    } catch (error) {
        console.error('Failed to fetch trip:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
