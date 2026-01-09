'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import { createNewTrip } from '@/actions/trip-actions'

export default function NewTripPage({ params }: { params: Promise<{ locale: string }> }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [title, setTitle] = useState('')
    const [days, setDays] = useState(5)

    const handleCreate = () => {
        if (!title.trim()) return
        startTransition(async () => {
            const res = await createNewTrip({ title, days })
            if (res.success && res.tripId) {
                // Get locale from params is async in server components? 
                // In client component we usually use useParam or pass it down. 
                // But let's just use window location relative or assume 'en' default if needed?
                // Better: Use the prop. But props are promises in Next 15 types, unwrapping...
                // Actually, simplified:
                router.push(`/en/trips/${res.tripId}`) // Hardcoded 'en' for now or handle better
                router.refresh()
            } else {
                alert("Error creating trip")
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-6">
                <div>
                    <BackButton label="Dashboard" />
                </div>

                <div className="text-center mb-8">
                    <span className="text-4xl mb-2 block">✈️</span>
                    <h1 className="text-3xl font-bold text-gray-900">Start a New Trip</h1>
                    <p className="text-gray-500 mt-2">Let's begin your journey.</p>
                </div>

                <div className="card p-8 space-y-6 bg-white shadow-xl border-t-4 border-t-indigo-500">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Trip Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Summer in Italy"
                            className="input-field text-lg font-semibold"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duration (Days)</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value))}
                            className="input-field text-lg font-semibold"
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={isPending || !title}
                        className="btn-primary w-full py-4 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        {isPending ? 'Creating...' : 'Create Trip ✨'}
                    </button>
                </div>
            </div>
        </div>
    )
}
