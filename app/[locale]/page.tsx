
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Dashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth()
  const t = await getTranslations('Index')

  if (!session?.user) {
    // If not logged in, show landing or redirect
    // For now, redirect to login
    redirect('/api/auth/signin') // Or custom login page
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('myTrips')}</h1>
        <div className="flex gap-4">
          <span className="text-sm text-gray-600 self-center">{session.user.email}</span>
          <Link href="/api/auth/signout" className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition">
            {t('signOut')}
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Create New Trip Card */}
        <Link href={`/${locale}/trips/new`} className="group border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer h-48">
          <div className="text-4xl text-gray-300 group-hover:text-indigo-500 mb-2">+</div>
          <span className="text-gray-500 font-medium group-hover:text-indigo-600">Create New Trip</span>
        </Link>

        {trips.map((trip) => (
          <Link key={trip.id} href={`/${locale}/trips/${trip.id}`} className="block block group">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 h-48 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600">{trip.title}</h2>
              <div className="text-sm text-gray-500 mb-4">{trip.subtitle}</div>
              <div className="flex gap-2 mt-auto">
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {new Date(trip.startDate).toLocaleDateString()}
                </span>
                {trip.isPublic && (
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">Public</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
