'use client'

import { useState, useTransition } from 'react'
import { Accommodation } from '@prisma/client'
import { upsertAccommodation, deleteAccommodation } from '@/actions/accommodation-actions'

export default function AccommodationCard({ dayId, initialData }: { dayId: string, initialData: Accommodation | null }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Form State
    const [name, setName] = useState(initialData?.name || '')
    const [link, setLink] = useState(initialData?.link || '')
    const [note, setNote] = useState(initialData?.note || '')

    const handleSave = () => {
        if (!name.trim()) return
        startTransition(async () => {
            const res = await upsertAccommodation(dayId, { name, link, note })
            if (res.success) {
                setIsEditing(false)
            }
        })
    }

    const handleDelete = () => {
        if (!confirm("Remove this accommodation?")) return
        startTransition(async () => {
            const res = await deleteAccommodation(dayId)
            if (res.success) {
                // Reset state to empty
                setName('')
                setLink('')
                setNote('')
                setIsEditing(false)
            }
        })
    }

    // Empty State (View Mode) -> Show "Add Accommodation" button or nothing?
    // User requested "editable block", so likely wants a visible placeholder if empty.
    if (!initialData && !isEditing) {
        return (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                onClick={() => setIsEditing(true)}
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition">🏨</span>
                    <span className="font-medium text-sm">Add Accommodation</span>
                </div>
            </div>
        )
    }

    // View Mode (Populated)
    if (!isEditing && initialData) {
        return (
            <div className="relative group bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white rounded-lg shadow-sm border border-gray-200">
                        ✏️
                    </button>
                </div>

                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    🏨 Accommodation
                </h3>
                <div className="text-lg font-semibold text-slate-800">
                    {initialData.name}
                </div>
                {initialData.link && (
                    <a href={initialData.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline block mt-1 flex items-center gap-1">
                        🔗 View Reservation / Link
                    </a>
                )}
                {initialData.note && (
                    <p className="text-slate-500 text-sm mt-3 bg-white/50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap">
                        {initialData.note}
                    </p>
                )}
            </div>
        )
    }

    // Edit Mode
    return (
        <div className="bg-white rounded-xl p-6 border-2 border-indigo-500 shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    🏨 Edit Accommodation
                </h3>
                {initialData && (
                    <button onClick={handleDelete} className="text-red-500 text-xs font-medium hover:underline">
                        Remove
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hotel Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Grand Hotel Plaza"
                        className="input-field font-semibold text-gray-900"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Booking Link / Map</label>
                    <input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://..."
                        className="input-field text-blue-600"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Confirmation / Notes</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Booking #12345, check-in at 3PM..."
                        className="input-field min-h-[100px]"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsEditing(false)} className="btn-ghost" disabled={isPending}>Cancel</button>
                <button onClick={handleSave} className="btn-primary" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Details'}
                </button>
            </div>
        </div>
    )
}
