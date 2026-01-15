import { getPublicTrips } from '@/actions/trip-actions'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const { data: trips } = await getPublicTrips()

    return (
        <main className="min-h-screen pb-20 bg-gray-50">
            <header className="bg-white border-b border-gray-200 pt-12 pb-12 px-6 mb-8">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex justify-between items-center mb-4">
                        <Link href="/" className="btn-secondary px-3 py-1.5 text-xs text-gray-600 inline-flex items-center gap-1">
                            <span>←</span> Dashboard
                        </Link>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Trips</h1>
                    <p className="text-gray-500">Explore travel plans shared by the community.</p>
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-5xl">
                {!trips || trips.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <span className="text-6xl mb-4 block">🌍</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No public trips yet</h3>
                        <p className="text-gray-500">Be the first to share your trip!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip: any) => (
                            <Link href={`/${locale}/trips/${trip.id}`} key={trip.id} className="block group">
                                <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300 origin-left">
                                            {trip.icon || '✈️'}
                                        </div>
                                        <div className="flex -space-x-2">
                                            {/* Avatar placeholder */}
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {trip.user?.name?.[0] || '?'}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {trip.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5em]">
                                        {trip.subtitle || trip.description || 'No description'}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
                                        <span className="bg-gray-50 px-2 py-1 rounded-md">
                                            {trip._count?.days || 0} Days
                                        </span>
                                        <span>
                                            {format(new Date(trip.updatedAt), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
