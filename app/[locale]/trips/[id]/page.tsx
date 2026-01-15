import ExportTripButton from '@/components/ExportTripButton'
import BackButton from '@/components/BackButton'
import TripOverview from '@/components/TripOverview'
import BookingListEditor from '@/components/BookingListEditor'
import TripHeaderEditor from '@/components/TripHeaderEditor'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { TripWithDetails } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SlideView from '@/app/components/SlideView'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'

// ... existing imports

async function getTrip(id: string): Promise<TripWithDetails | null> {
    // ... same implementation
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
    const session = await auth()
    const trip = await getTrip(id)

    if (!trip) {
        notFound()
    }

    const isOwner = session?.user?.id === trip.userId
    const canView = isOwner || trip.isPublic

    if (!canView) {
        // If logged in, 403 (or redirect). If not logged in, redirect to login.
        if (!session) {
            redirect(`/login?callbackUrl=/trips/${id}`)
        }
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Private Trip</h1>
                    <p className="text-gray-500">This trip is private and you do not have permission to view it.</p>
                    <Link href="/" className="btn-primary mt-6 inline-block">Go Home</Link>
                </div>
            </div>
        )
    }

    const isReadOnly = !isOwner


    return (
        <main className="min-h-screen pb-20 bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 pt-12 pb-12 px-6 mb-8 relative">
                <div className="absolute top-6 left-6 flex gap-4">
                    <Link href="/" className="btn-secondary px-3 py-1.5 text-xs text-gray-600 inline-flex items-center gap-1">
                        <span>←</span> Dashboard
                    </Link>
                </div>

                <TripHeaderEditor trip={trip} />

                <div className="flex items-center justify-center gap-3 mt-4 text-sm text-gray-500">
                    <ExportTripButton tripId={trip.id} title={trip.title} />
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-4xl space-y-12">

                {/* Slide View */}
                <section>
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <h2 className="text-xl font-bold text-gray-900">Highlights</h2>
                        <span className="h-px flex-1 bg-gray-200"></span>
                    </div>
                    <SlideView days={trip.days} locale={locale} />
                </section>

                {/* Overview */}
                <section className="card p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📝 Overview
                    </h2>
                    <TripOverview tripId={trip.id} initialDescription={trip.description || ''} />

                    <BookingListEditor tripId={trip.id} bookings={trip.bookings} />
                </section>

                {/* Days List */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <h2 className="text-xl font-bold text-gray-900">Itinerary</h2>
                        <span className="h-px flex-1 bg-gray-200"></span>
                    </div>

                    {trip.days.map((day: any) => (
                        <Link href={`/${locale}/days/${day.id}`} key={day.id} className="block group">
                            <div className="card p-6 border-l-4 border-l-gray-900 hover:border-l-indigo-600 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-2xl font-bold text-gray-900 block">
                                            Day {day.dayNumber}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium font-mono uppercase tracking-wide">
                                            {format(new Date(day.date), 'MM.dd (EEE)')}
                                        </span>
                                    </div>
                                    {day.city && (
                                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                                            {day.city}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors">
                                    {day.title}
                                </h3>

                                <ul className="space-y-3 mb-4">
                                    {day.activities.map((act: any) => (
                                        <li key={act.id} className="text-gray-600 text-sm flex items-start gap-3">
                                            <span className="text-gray-300 mt-0.5">•</span>
                                            <span className="line-clamp-1">{act.description}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {day.transport ? (
                                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                            🚍 {day.transport}
                                        </div>
                                    ) : <div className="h-4"></div>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </section>

                <footer className="text-center text-gray-400 py-12 text-sm font-medium">
                    <p>TripTimeTable</p>
                </footer>
            </div>
        </main>
    )
}
