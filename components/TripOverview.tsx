'use client'

import { useState, useTransition } from 'react'
import { updateTrip } from '@/actions/trip-actions'

export default function TripOverview({ tripId, initialDescription }: { tripId: string, initialDescription: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [description, setDescription] = useState(initialDescription || '')
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            await updateTrip(tripId, { description })
            setIsEditing(false)
        })
    }

    if (isEditing) {
        return (
            <div className="space-y-4 animate-in fade-in">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field min-h-[150px] leading-relaxed"
                    placeholder="Write a brief overview of the trip..."
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="btn-ghost" disabled={isPending}>Cancel</button>
                    <button onClick={handleSave} className="btn-primary" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Overview'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="group relative">
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-gray-100"
                    title="Edit Overview"
                >
                    ✏️
                </button>
            </div>
            {description ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line cursor-text" onClick={() => setIsEditing(true)}>
                    {description}
                </p>
            ) : (
                <div onClick={() => setIsEditing(true)} className="text-gray-400 italic cursor-pointer border-2 border-dashed border-gray-100 rounded-lg p-4 text-center hover:border-gray-300 hover:text-gray-500 transition-all">
                    No overview yet. Click to add details about this trip.
                </div>
            )}
        </div>
    )
}
