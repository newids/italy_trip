
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import HamburgerMenu from '@/components/HamburgerMenu'
import ImportTripButton from '@/components/ImportTripButton'

import LandingPage from '@/components/LandingPage'

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth()
  const t = await getTranslations('Index')

  if (!session?.user) {
    return <LandingPage locale={locale} />
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: 'desc' }
  })

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen p-6 md:p-12 space-y-12">

      {/* Header / Hero - Add z-index to ensure menu shows over content */}
      <header className="relative z-50 flex items-center justify-between gap-6 glass-panel p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <HamburgerMenu locale={locale} />
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <p className="text-gray-900 font-bold tracking-tight">TripTimeTable</p>
          </div>
        </div>

        <Link href={`/${locale}/community`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors border border-indigo-100">
          <span>🌍</span> Community
        </Link>
      </header>

      {/* Main Content */}
      <main>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📂 Your Collections
            <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">{trips.length}</span>
          </h2>
          <div className="flex items-center gap-2">
            <ImportTripButton />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/${locale}/trips/${trip.id}`} className="group relative">
              <div className="glass-card rounded-xl p-6 h-64 flex flex-col justify-between relative overflow-hidden bg-white hover:border-gray-300 transition-all">

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition">🇮🇹</span>
                    {trip.isPublic && (
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        PUBLIC
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">{trip.title}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{trip.subtitle || trip.description}</p>
                </div>

                <div className="relative z-10 flex items-center gap-2 mt-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <span>
                    {new Date(trip.startDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                    {' — '}
                    {new Date(trip.endDate).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Create New Trip Button */}
          <Link href={`/${locale}/trips/new`} className="group">
            <div className="h-64 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex flex-col items-center justify-center gap-3 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <span className="font-medium text-gray-500 group-hover:text-gray-700 text-sm">Create Trip</span>
            </div>
          </Link>
        </div>
      </main >

    </div >
  )
}
