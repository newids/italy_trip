import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { auth } from "@/auth"
import ContentEditor from "@/app/components/ContentEditor"
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

    if (!day) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#fff5f5]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-6 pb-12 rounded-b-3xl relative">
                <Link href={`/${locale}/trips/${day.trip.id}`} className="absolute top-6 left-6 text-white text-2xl opacity-80 hover:opacity-100">
                    ←
                </Link>
                <div className="text-center mt-4">
                    <div className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Day {day.dayNumber}</div>
                    <h1 className="text-3xl font-bold">{day.title}</h1>
                    <p className="opacity-90 mt-2">{format(new Date(day.date), 'yyyy.MM.dd EEEE')}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-6 max-w-2xl space-y-6 pb-20">

                {/* City & Transport */}
                <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center gap-2">
                    {day.city && (
                        <span className="bg-indigo-100 text-indigo-700 font-bold px-4 py-1 rounded-full text-sm">
                            📍 {day.city}
                        </span>
                    )}
                    {day.transport && (
                        <div className="text-gray-600 text-sm">
                            🚆 {day.transport}
                        </div>
                    )}
                </div>

                {/* Activities */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-[#764ba2] mb-4 flex items-center gap-2">
                        <span>📝</span> Schedule
                    </h2>
                    <ul className="space-y-4">
                        {day.activities.map((act: any) => (
                            <li key={act.id} className="text-gray-600 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-[#667eea] mt-0.5">•</span>
                                    <span>{act.description}</span>
                                </div>
                                {session?.user && (
                                    <ContentEditor activity={act} />
                                )}

                                {/* Display Links/Images if not in editor (or always) */}
                                {act.links && (
                                    <div className="flex gap-2 mt-1 ml-4 flex-wrap">
                                        {JSON.parse(act.links as string).map((l: any, i: number) => (
                                            <a key={i} href={l.url} target="_blank" className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded hover:underline">
                                                🔗 {l.label || 'Link'}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {act.images && (
                                    <div className="flex gap-2 mt-1 ml-4 overflow-x-auto">
                                        {JSON.parse(act.images as string).map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-16 h-16 object-cover rounded shadow-sm" />
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Highlights/Tips */}
                {day.highlights.map((highlight) => (
                    <div key={highlight.id} className={`rounded-xl p-6 border-l-4 shadow-sm ${highlight.type === 'TIP' ? 'bg-yellow-50 border-yellow-400' : 'bg-pink-50 border-pink-400'}`}>
                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${highlight.type === 'TIP' ? 'text-yellow-700' : 'text-pink-700'}`}>
                            {highlight.type === 'TIP' ? '💡 Tip' : '🌟 Highlight'}
                        </h3>
                        <p className="text-gray-700 text-sm">
                            {highlight.content}
                        </p>
                    </div>
                ))}

                {/* Accommodation */}
                {day.accommodation && (
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                            🏨 Accommodation
                        </h3>
                        <div className="text-lg font-semibold text-slate-800">
                            {day.accommodation.name}
                        </div>
                        {day.accommodation.link && (
                            <a href={day.accommodation.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline block mt-1">
                                View Reservation →
                            </a>
                        )}
                        {day.accommodation.note && (
                            <p className="text-slate-500 text-xs mt-2">{day.accommodation.note}</p>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}
