'use client'

import { useState, useTransition } from 'react'
import { Booking } from '@prisma/client'
import { createBooking, updateBooking, deleteBooking } from '@/actions/booking-actions'

export default function BookingListEditor({ tripId, bookings }: { tripId: string, bookings: Booking[] }) {
    const [isCreating, setIsCreating] = useState(false)
    const [createType, setCreateType] = useState('FLIGHT')
    const [isPending, startTransition] = useTransition()

    // New Booking State
    const [newTitle, setNewTitle] = useState('')
    const [newDetails, setNewDetails] = useState('')

    const handleCreate = () => {
        if (!newTitle.trim()) return
        startTransition(async () => {
            // @ts-ignore
            await createBooking(tripId, { type: createType, title: newTitle, details: newDetails })
            setNewTitle('')
            setNewDetails('')
            setIsCreating(false)
        })
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((b) => (
                <EditableBookingCard key={b.id} booking={b} />
            ))}

            {/* Add New Button */}
            {!isCreating ? (
                <button
                    onClick={() => setIsCreating(true)}
                    className="min-h-[40px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-gray-50 transition-all gap-2"
                >
                    <span className="text-sm">➕</span>
                    <span className="text-xs font-medium">Add Booking</span>
                </button>
            ) : (
                <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-lg animate-in fade-in zoom-in-95 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600 uppercase">New Booking</span>
                        <button onClick={() => setIsCreating(false)} className="text-xs text-gray-400">Cancel</button>
                    </div>

                    <select
                        value={createType}
                        onChange={(e) => setCreateType(e.target.value)}
                        className="input-field py-1 text-xs"
                    >
                        <option value="FLIGHT">✈️ Flight</option>
                        <option value="TRAIN">🚄 Train</option>
                        <option value="TOUR">🎫 Tour</option>
                        <option value="OTHER">🔹 Other</option>
                    </select>

                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="input-field text-sm font-bold"
                        placeholder="Title (e.g. Flight to Rome)"
                        autoFocus
                    />

                    <textarea
                        value={newDetails}
                        onChange={(e) => setNewDetails(e.target.value)}
                        className="input-field text-sm min-h-[60px]"
                        placeholder="Details (Time, Confirm #...)"
                    />

                    <div className="flex justify-end">
                        <button onClick={handleCreate} disabled={isPending} className="btn-primary text-xs w-full">Add</button>
                    </div>
                </div>
            )}
        </div>
    )
}

function EditableBookingCard({ booking }: { booking: Booking }) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(booking.title)
    const [details, setDetails] = useState(booking.details)
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        if (title === booking.title && details === booking.details) { setIsEditing(false); return }
        startTransition(async () => {
            await updateBooking(booking.id, { title, details })
            setIsEditing(false)
        })
    }

    const handleDelete = () => {
        if (!confirm("Delete this booking?")) return
        startTransition(async () => {
            await deleteBooking(booking.id)
        })
    }

    const getIcon = (t: string) => {
        switch (t) {
            case 'FLIGHT': return '✈️';
            case 'TRAIN': return '🚄';
            case 'TOUR': return '🎫';
            default: return '🔹';
        }
    }

    if (isEditing) {
        return (
            <div className="bg-white p-4 rounded-xl border border-indigo-500 shadow-md space-y-3 relative">
                <button onClick={() => setIsEditing(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs">✕</button>

                <div className="flex gap-2 items-center mb-1">
                    <span className="text-xl">{getIcon(booking.type)}</span>
                    <span className="text-xs font-bold text-gray-400">{booking.type}</span>
                </div>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field text-sm font-bold"
                />
                <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="input-field text-sm min-h-[80px]"
                />

                <div className="flex justify-between items-center pt-2">
                    <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Delete</button>
                    <button onClick={handleSave} className="btn-primary text-xs py-1.5">Save</button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group hover:border-gray-300 transition-colors">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-indigo-600 bg-white rounded shadow-sm border border-gray-200">✏️</button>
            </div>

            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                {getIcon(booking.type)} {title}
            </h3>
            <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {details}
            </div>
        </div>
    )
}
