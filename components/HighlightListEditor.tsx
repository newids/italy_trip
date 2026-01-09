'use client'

import { useState, useTransition } from 'react'
import { Highlight } from '@prisma/client'
import { createHighlight, updateHighlight, deleteHighlight } from '@/actions/highlight-actions'

export default function HighlightListEditor({ dayId, highlights }: { dayId: string, highlights: Highlight[] }) {
    const [activeType, setActiveType] = useState<'TIP' | 'HIGHLIGHT' | null>(null) // For creating
    const [newContent, setNewContent] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleCreate = () => {
        if (!activeType || !newContent.trim()) return
        startTransition(async () => {
            // @ts-ignore
            await createHighlight(dayId, { type: activeType, content: newContent })
            setNewContent('')
            setActiveType(null)
        })
    }

    return (
        <div className="space-y-4">
            {/* List Existing Highlights */}
            {highlights.map((h) => (
                <EditableHighlight key={h.id} highlight={h} />
            ))}

            {/* Creation Buttons */}
            {!activeType ? (
                <div className="flex gap-2 justify-center py-2 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => setActiveType('TIP')} className="text-xs flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full border border-yellow-200 hover:bg-yellow-100 transition">
                        <span>💡</span> Add Tip
                    </button>
                    <button onClick={() => setActiveType('HIGHLIGHT')} className="text-xs flex items-center gap-1 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full border border-pink-200 hover:bg-pink-100 transition">
                        <span>🌟</span> Add Highlight
                    </button>
                </div>
            ) : (
                <div className={`rounded-xl p-4 border-2 ${activeType === 'TIP' ? 'bg-yellow-50 border-yellow-200' : 'bg-pink-50 border-pink-200'} animate-in fade-in slide-in-from-top-2`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wide ${activeType === 'TIP' ? 'text-yellow-700' : 'text-pink-700'}`}>
                            New {activeType === 'TIP' ? 'Tip' : 'Highlight'}
                        </span>
                        <button onClick={() => setActiveType(null)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
                    </div>
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="input-field min-h-[80px] bg-white"
                        placeholder={activeType === 'TIP' ? "Don't forget to pack..." : "Must see the sunset at..."}
                        autoFocus
                    />
                    <div className="flex justify-end mt-2">
                        <button onClick={handleCreate} disabled={isPending} className="btn-primary text-xs">Add</button>
                    </div>
                </div>
            )}
        </div>
    )
}

function EditableHighlight({ highlight }: { highlight: Highlight }) {
    const [isEditing, setIsEditing] = useState(false)
    const [content, setContent] = useState(highlight.content)
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        if (content === highlight.content) { setIsEditing(false); return }
        startTransition(async () => {
            await updateHighlight(highlight.id, content)
            setIsEditing(false)
        })
    }

    const handleDelete = () => {
        if (!confirm("Delete this item?")) return
        startTransition(async () => {
            await deleteHighlight(highlight.id)
        })
    }

    const isTip = highlight.type === 'TIP'

    if (isEditing) {
        return (
            <div className={`relative rounded-xl p-4 border-2 ${isTip ? 'bg-yellow-50 border-yellow-300' : 'bg-pink-50 border-pink-300'}`}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="input-field min-h-[80px] bg-white mb-2"
                />
                <div className="flex justify-between items-center">
                    <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Delete</button>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-xs text-gray-500 hover:text-gray-800">Cancel</button>
                        <button onClick={handleSave} className="text-xs bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-800">Save</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`group relative rounded-xl p-6 border-l-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${isTip ? 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100' : 'bg-pink-50 border-pink-400 hover:bg-pink-100'}`}
            onClick={() => setIsEditing(true)}
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400">Click to edit</span>
            </div>

            <h3 className={`font-bold mb-2 flex items-center gap-2 ${isTip ? 'text-yellow-700' : 'text-pink-700'}`}>
                {isTip ? '💡 Tip' : '🌟 Highlight'}
            </h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {highlight.content}
            </p>
        </div>
    )
}
