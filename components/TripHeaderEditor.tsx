'use client'

import { useState, useTransition } from 'react'
import { updateTrip, toggleTripVisibility } from '@/actions/trip-actions'
import { format } from 'date-fns'
import { Trip } from '@prisma/client'

export default function TripHeaderEditor({ trip }: { trip: Trip }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, startTransition] = useTransition()

    // State
    const [title, setTitle] = useState(trip.title)
    const [subtitle, setSubtitle] = useState(trip.subtitle || '')
    const [icon, setIcon] = useState(trip.icon || '🇮🇹')
    const [startDate, setStartDate] = useState(format(new Date(trip.startDate), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(new Date(trip.endDate), 'yyyy-MM-dd'))

    // Community
    const [isPublic, setIsPublic] = useState(trip.isPublic)

    const handleToggleVisibility = () => {
        startTransition(async () => {
            const res = await toggleTripVisibility(trip.id)
            if (res.success && res.isPublic !== undefined) {
                setIsPublic(res.isPublic)
            }
        })
    }

    const handleSave = () => {
        startTransition(async () => {
            await updateTrip(trip.id, {
                title,
                subtitle,
                icon,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            })
            setIsEditing(false)
        })
    }

    if (isEditing) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-xl animate-in fade-in zoom-in-95 space-y-4 text-left relative z-20">
                <div className="text-center mb-6">
                    <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Trip Icon</label>
                    <input
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="text-6xl w-24 text-center bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        maxLength={2}
                        placeholder="🇮🇹"
                    />
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="input-label">Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field text-xl font-bold" />
                    </div>
                    <div>
                        <label className="input-label">Subtitle</label>
                        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="input-field" placeholder="e.g. Summer Vacation 2024" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="input-label">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="input-label">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">Public Visibility</span>
                        <span className="text-xs text-gray-500">Allow others to see this trip in Community</span>
                    </div>
                    <button
                        onClick={handleToggleVisibility}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button onClick={() => setIsEditing(false)} className="btn-ghost">Cancel</button>
                    <button onClick={handleSave} className="btn-primary" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto text-center space-y-4 group cursor-pointer rounded-xl p-4 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 relative" onClick={() => setIsEditing(true)}>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">✏️ Edit Header</span>
            </div>

            <div className="flex justify-center mb-2">
                <span className="text-6xl filter hover:brightness-110 transition-all">{trip.icon || '🇮🇹'}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                {trip.title}
            </h1>

            <p className="text-lg text-gray-500 font-medium min-h-[1.5em]">{trip.subtitle}</p>

            <div className="flex items-center justify-center gap-3 mt-4 text-sm text-gray-500">
                {isPublic && (
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 font-bold text-xs uppercase tracking-wider">
                        Public
                    </span>
                )}
                <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200 font-mono text-xs">
                    {format(new Date(trip.startDate), 'yyyy.MM.dd')} - {format(new Date(trip.endDate), 'MM.dd')}
                </span>
            </div>
        </div>
    )
}
