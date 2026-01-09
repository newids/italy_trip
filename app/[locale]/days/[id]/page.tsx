import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { auth } from "@/auth"
import DayScheduleEditor from '@/components/DayScheduleEditor'
import DayHeaderEditor from '@/components/DayHeaderEditor'
import ContentEditor from "@/app/components/ContentEditor"
import BackButton from '@/components/BackButton'
import AccommodationCard from '@/components/AccommodationCard'
import HighlightListEditor from '@/components/HighlightListEditor'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DayWithDetails } from '@/types'
import { Prisma } from '@prisma/client'

export default async function DayDetail({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const day = await prisma.day.findUnique({
        where: { id },
        include: {
            activities: { orderBy: { order: 'asc' } },
            highlights: true,
            accommodation: true,
            trip: true // Include trip for ID
        }
    }) as (DayWithDetails & { trip: { id: string } }) | null

    const session = await auth()

    // Get Prev/Next Day
    const prevDay = await prisma.day.findFirst({
        where: { tripId: day.trip.id, dayNumber: day.dayNumber - 1 },
        select: { id: true }
    })
    const nextDay = await prisma.day.findFirst({
        where: { tripId: day.trip.id, dayNumber: day.dayNumber + 1 },
        select: { id: true }
    })

    // Vars for template
    const prevDayId = prevDay?.id
    const nextDayId = nextDay?.id

    if (!day) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#fff5f5]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-4 pb-8 rounded-b-2xl relative shadow-lg">
                <div className="flex justify-between items-start">
                    <div className="bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm p-1 transition-colors">
                        <Link href={`/${locale}/trips/${day.trip.id}`} className="text-white text-xs font-bold px-2 py-1 flex items-center gap-1">
                            ← Trip
                        </Link>
                    </div>
                </div>

                {/* Day Editor Component (Title, Date, City, Transport) */}
                <div className="mt-2 mb-4">
                    <DayHeaderEditor day={day} locale={locale} prevDayId={prevDayId} nextDayId={nextDayId} />
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-4 max-w-2xl space-y-6 pb-20 relative z-10">

                {/* City & Transport (Moved into Header Editor mostly, but if user wants visual cards here... keeping logic but maybe hidden? 
                   Actually, user said "make all components in days editable". 
                   The DayHeaderEditor handles Title, Date, City, Transport. 
                   So we can probably REMOVE this duplicate display or update it to read from the edited data.
                   But DayHeaderEditor is client side. This page is server side. 
                   Ideally we show the same data. 
                   Let's Remove the separate City/Transport card since it's now in the header editor.
                */}

                {/* Activities Editor */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span>📝</span> Schedule
                    </h2>

                    {session?.user ? (
                        <DayScheduleEditor dayId={day.id} activities={day.activities} />
                    ) : (
                        // Read-only View for non-users (or if needed separate component)
                        <ul className="space-y-4">
                            {day.activities.map((act: any) => (
                                <li key={act.id} className="text-gray-600 text-sm flex items-start gap-2">
                                    <span className="mt-0.5 select-none text-xl w-8 text-center">
                                        {act.type === 'MEAL' ? '🍴' : act.type === 'TRANSPORT' ? '🚆' : act.type === 'HOTEL' ? '🏨' : '📷'}
                                    </span>
                                    <div>
                                        <p>{act.description}</p>
                                        {act.time && <span className="text-xs text-gray-400">{act.time}</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Highlights/Tips */}
                <HighlightListEditor dayId={day.id} highlights={day.highlights} />

                {/* Accommodation */}
                <AccommodationCard dayId={day.id} initialData={day.accommodation} />

            </div>
        </div>
    )
}
