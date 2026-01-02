
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { TripWithDetails } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SlideView from '@/app/components/SlideView'

async function getTrip(id: string): Promise<TripWithDetails | null> {
    const trip = await prisma.trip.findUnique({
        where: { id },
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
        }
    })
    return trip
}

export default async function TripDetail({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const trip = await getTrip(id)

    if (!trip) {
        notFound()
    }


    return (
        <main className="min-h-screen pb-20 bg-gradient-to-br from-[#ffecd2] to-[#fcb69f]">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white pt-12 pb-16 px-6 rounded-b-3xl shadow-lg mb-6 relative">
                <Link href={`/${locale}`} className="absolute top-6 left-6 text-white text-xl opacity-80 hover:opacity-100">
                    ← Dashboard
                </Link>
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-2 drop-shadow-md">
                        🇮🇹 {trip.title}
                    </h1>
                    <p className="text-lg opacity-90">{trip.subtitle}</p>
                    <p className="text-sm mt-4 opacity-75">
                        {format(new Date(trip.startDate), 'yyyy.MM.dd')} - {format(new Date(trip.endDate), 'MM.dd')}
                    </p>
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-4xl space-y-8">

                {/* Slide View */}
                <section>
                    <h2 className="text-xl font-bold text-[#764ba2] px-2 mb-4">Highlights Reel</h2>
                    <SlideView days={trip.days} locale={locale} />
                </section>

                {/* Overview */}
                <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border-l-4 border-[#764ba2]">
                    <h2 className="text-xl font-bold text-[#667eea] mb-4 border-b-2 border-purple-100 pb-2">
                        Trip Overview
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        {trip.description}
                    </p>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {trip.bookings.map((booking: Prisma.BookingGetPayload<any>) => (
                            <div key={booking.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-bl-full -mr-8 -mt-8"></div>
                                <h3 className="font-bold text-[#764ba2] flex items-center gap-2 mb-2">
                                    {booking.type === 'FLIGHT' ? '✈' : booking.type === 'TRAIN' ? '🚄' : '🎫'} {booking.title}
                                </h3>
                                <div className="text-sm text-gray-600 whitespace-pre-line">
                                    {booking.details}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Days List */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-[#764ba2] px-2">Itinerary</h2>
                    {trip.days.map((day: any) => (
                        <Link href={`/${locale}/days/${day.id}`} key={day.id} className="block group">
                            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#667eea] relative active:scale-[0.99] duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-2xl font-bold text-[#667eea] blocked">
                                            Day {day.dayNumber}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2 font-medium">
                                            {format(new Date(day.date), 'MM.dd (EEE)')}
                                        </span>
                                    </div>
                                    {day.city && (
                                        <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            {day.city}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-3 ml-1">
                                    {day.title}
                                </h3>

                                <ul className="space-y-2 mb-4">
                                    {day.activities.slice(0, 3).map((act: any) => (
                                        <li key={act.id} className="text-gray-600 text-sm flex items-start gap-2">
                                            <span className="text-[#667eea] mt-0.5">•</span>
                                            <span className="line-clamp-1">{act.description}</span>
                                        </li>
                                    ))}
                                    {day.activities.length > 3 && (
                                        <li className="text-gray-400 text-xs pl-4 font-medium">
                                            + {day.activities.length - 3} more activities...
                                        </li>
                                    )}
                                </ul>

                                <div className="mt-4 flex justify-between items-center">
                                    {day.transport && (
                                        <div className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg inline-block">
                                            🚍 {day.transport}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </section>

                <footer className="text-center text-gray-500 py-8 text-sm font-medium">
                    <p>✨ Built with Next.js & Prisma ✨</p>
                </footer>
            </div>
        </main>
    )
}
