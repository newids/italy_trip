'use client'

import { useState, useTransition } from 'react'
import ActivityRow from './ActivityRow'
import { Activity } from '@prisma/client'
import { createActivity } from '@/actions/day-actions'

export default function DayScheduleEditor({ dayId, activities }: { dayId: string, activities: Activity[] }) {
    const [isCreating, setIsCreating] = useState(false)
    const [createOrder, setCreateOrder] = useState(0)
    const [createType, setCreateType] = useState('SIGHTSEEING')

    // Create Form State
    const [newDesc, setNewDesc] = useState('')
    const [newTime, setNewTime] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleCreateStart = (order: number, type: string = 'SIGHTSEEING') => {
        setCreateOrder(order)
        setCreateType(type)
        setNewDesc('')
        setNewTime('')
        setIsCreating(true)
    }

    const handleCreateSave = () => {
        startTransition(async () => {
            await createActivity(dayId, {
                description: newDesc,
                type: createType,
                time: newTime,
                order: createOrder
            })
            setIsCreating(false)
        })
    }

    // Determine insert position for "Top" button
    const firstOrder = activities.length > 0 ? activities[0].order : 1

    return (
        <div className="space-y-4">
            {/* Empty State / Insert Top */}
            {activities.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-400 mb-4">No schedule items yet.</p>
                    <button
                        onClick={() => handleCreateStart(1)}
                        className="btn-primary"
                    >
                        + Add First Item
                    </button>
                </div>
            ) : (
                <div className="flex justify-center mb-2">
                    <button
                        onClick={() => handleCreateStart(firstOrder - 1)} // Insert before first
                        className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity"
                    >
                        <span>➕ Insert at Top</span>
                    </button>
                </div>
            )}

            {/* Creation Form (if inserting at top/middle) */}
            {isCreating && (
                <div className="card p-4 border-2 border-green-500 mb-4 animate-in slide-in-from-top-2">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-green-700">New Item (Order: {createOrder})</span>
                        <button onClick={() => setIsCreating(false)} className="text-xs text-gray-400">Cancel</button>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <select
                            value={createType}
                            onChange={(e) => setCreateType(e.target.value)}
                            className="input-field w-32 text-xs"
                        >
                            <option value="SIGHTSEEING">📷 Sightseeing</option>
                            <option value="MEAL">🍴 Meal</option>
                            <option value="TRANSPORT">🚆 Transport</option>
                            <option value="HOTEL">🏨 Hotel</option>
                            <option value="MEMO">📝 Memo</option>
                        </select>
                        <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="input-field w-28 text-xs"
                        />
                    </div>
                    <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="input-field min-h-[80px]"
                        placeholder="What's happening?"
                        autoFocus
                    />
                    <div className="flex justify-end mt-2">
                        <button onClick={handleCreateSave} className="btn-primary text-xs">Create Item</button>
                    </div>
                </div>
            )}

            {/* List */}
            {activities.map((act) => (
                <ActivityRow
                    key={act.id}
                    activity={act}
                    onInsertAbove={() => handleCreateStart(act.order)}
                    onInsertBelow={() => handleCreateStart(act.order + 1)}
                />
            ))}

            {/* Add New Item at Bottom */}
            <div className="flex justify-center pt-4 pb-8">
                <button
                    onClick={() => handleCreateStart(activities.length > 0 ? activities[activities.length - 1].order + 1 : 1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all text-sm font-medium"
                >
                    <span className="text-lg">➕</span> Add New Item
                </button>
            </div>
        </div>
    )
}
