'use client'

import { useState, useTransition } from 'react'
import { Activity } from '@prisma/client'
import { updateActivity, deleteActivity } from '@/actions/day-actions'
import ContentEditor from '@/app/components/ContentEditor'

const TYPE_ICONS: Record<string, string> = {
    SIGHTSEEING: '', // Removed default camera icon
    MEAL: '🍴',
    TRANSPORT: '🚆',
    HOTEL: '🏨',
    MEMO: '📝',
    OTHER: '🔹'
}

const TYPE_LABELS: Record<string, string> = {
    SIGHTSEEING: 'Sightseeing',
    MEAL: 'Meal',
    TRANSPORT: 'Transport',
    HOTEL: 'Accommodation',
    MEMO: 'Memo',
    OTHER: 'Other'
}

export default function ActivityRow({ activity, onInsertAbove, onInsertBelow }: {
    activity: Activity,
    onInsertAbove: () => void,
    onInsertBelow: () => void
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Edit State
    const [description, setDescription] = useState(activity.description)
    const [time, setTime] = useState(activity.time || '')
    const [type, setType] = useState(activity.type || 'SIGHTSEEING')

    // Mobile Menu State
    const [showMenu, setShowMenu] = useState(false)

    // Handle Save
    const handleSave = () => {
        startTransition(async () => {
            const res = await updateActivity(activity.id, { description, time, type })
            if (res.success) {
                setIsEditing(false)
            } else {
                alert("Failed to save")
            }
        })
    }

    // Handle Delete
    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this block?")) return
        startTransition(async () => {
            await deleteActivity(activity.id)
        })
    }

    // Colors
    const getBgColor = (t: string) => {
        switch (t) {
            case 'MEAL': return 'bg-orange-50 border-orange-100'
            case 'TRANSPORT': return 'bg-blue-50 border-blue-100'
            case 'HOTEL': return 'bg-purple-50 border-purple-100'
            case 'MEMO': return 'bg-yellow-50 border-yellow-100'
            default: return 'bg-white border-gray-100'
        }
    }

    // Parse links/images for View Mode display
    const links = activity.links ? JSON.parse(activity.links as string) : []
    const images = activity.images ? JSON.parse(activity.images as string) : []

    if (isEditing) {
        return (
            <div className={`card p-3 space-y-3 mb-2 shadow-lg border-2 border-indigo-500 animate-in fade-in zoom-in-95 duration-200 ${getBgColor(type)}`}>
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Editing Block</span>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 text-sm">✖</button>
                </div>

                <div className="flex gap-2">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="input-field w-1/3 text-xs font-medium"
                    >
                        {Object.entries(TYPE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="input-field w-24 text-xs font-mono"
                    />
                </div>

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field min-h-[80px] text-sm leading-relaxed"
                    placeholder="Describe this activity..."
                    autoFocus
                />

                {/* Embedded Content Editor */}
                <div className="border-t border-black/5 pt-2">
                    <ContentEditor activity={activity} forceOpen={true} />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/5">
                    <button onClick={() => setIsEditing(false)} className="btn-ghost text-xs" disabled={isPending}>Cancel</button>
                    <button onClick={handleSave} className="btn-primary text-xs" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="group relative flex items-start gap-2 mb-2">

            {/* Actions Toolbar - Unified Menu for ALL screens */}
            <div className="pt-3 relative">

                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded transition-colors"
                >
                    ⋮
                </button>

                {showMenu && (
                    <>
                        {/* Backdrop to close */}
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                        {/* Menu Dropdown */}
                        <div className="absolute left-0 top-8 z-20 bg-white border border-gray-200 shadow-xl rounded-lg flex flex-col p-1 min-w-[140px]" onClick={() => setShowMenu(false)}>
                            <button onClick={onInsertBelow} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded text-left transition-colors">
                                <span className="text-lg">➕</span> New Item
                            </button>
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded text-left transition-colors">
                                <span className="text-lg">✏️</span> Edit
                            </button>
                            <div className="border-t my-1"></div>
                            <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded text-left transition-colors">
                                <span className="text-lg">🗑️</span> Delete
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Card Content */}
            <div className={`flex-1 relative p-3 rounded-lg border transition-all hover:shadow-sm ${getBgColor(type)}`}>
                <div className="flex items-start gap-2">
                    {/* Icon (Only if not SIGHTSEEING/Empty) */}
                    {TYPE_ICONS[type] && (
                        <div className="text-lg select-none pt-0.5">
                            {TYPE_ICONS[type]}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                            <h4 className="font-medium text-gray-900 break-words whitespace-pre-wrap leading-relaxed text-sm">{description}</h4>
                            {time && <span className="text-[10px] font-mono text-gray-500 bg-white/60 px-1.5 py-0.5 rounded border border-black/5 whitespace-nowrap">{time}</span>}
                        </div>

                        {/* Display Links/Images (Read-only view) */}
                        {(links.length > 0 || images.length > 0) && (
                            <div className="pt-2 space-y-2">
                                {links.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {links.map((l: any, i: number) => (
                                            <a key={i} href={l.url} target="_blank" className="text-[10px] flex items-center gap-1 text-blue-600 bg-blue-50/50 hover:bg-blue-100 px-2 py-1 rounded transition-colors border border-blue-100">
                                                🔗 {l.label || 'Link'}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        {images.map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-100 bg-gray-100" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
