import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from 'next/navigation'

export default async function NewTripPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth()

    if (!session?.user) {
        redirect('/api/auth/signin')
    }

    async function createTrip(formData: FormData) {
        'use server'
        const title = formData.get('title') as string
        const subtitle = formData.get('subtitle') as string
        if (!session?.user?.id || !title) return

        await prisma.trip.create({
            data: {
                user: { connect: { id: session.user.id } },
                title,
                subtitle,
                startDate: new Date(),
                endDate: new Date(),
                description: "",
            }
        })
        redirect(`/${locale}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <form action={createTrip} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Create New Trip</h1>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input name="title" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="My European Summer" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input name="subtitle" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="2 weeks in Italy..." />
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
                    Create Trip
                </button>
            </form>
        </div>
    )
}
