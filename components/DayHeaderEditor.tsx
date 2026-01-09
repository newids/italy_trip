'use client'

import { useState, useTransition } from 'react'
import { updateDay } from '@/actions/day-actions'
import { format } from 'date-fns'

import Link from 'next/link'

export default function DayHeaderEditor({ day, locale, prevDayId, nextDayId }: { day: any, locale: string, prevDayId?: string, nextDayId?: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, startTransition] = useTransition()

    // State
    const [title, setTitle] = useState(day.title)
    const [date, setDate] = useState(format(new Date(day.date), 'yyyy-MM-dd'))
    const [city, setCity] = useState(day.city || '')
    const [transport, setTransport] = useState(day.transport || '')

    const handleSave = () => {
        startTransition(async () => {
            // @ts-ignore
            await updateDay(day.id, {
                title,
                date: new Date(date),
                city,
                transport
            })
            setIsEditing(false)
        })
    }

    if (isEditing) {
        return (
            <div className="relative z-10 space-y-4 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 text-white animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold opacity-70">Short Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold opacity-70">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold opacity-70">City</label>
                        <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50" />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold opacity-70">Transport</label>
                        <input value={transport} onChange={(e) => setTransport(e.target.value)} className="w-full bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50" />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs hover:bg-white/10 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded shadow-sm hover:bg-indigo-50">Save</button>
                </div>
            </div>
        )
    }

    return (
        <div className="group relative text-center mt-2 pb-2">
            <div className="absolute top-0 right-1/2 translate-x-[150px] opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="text-white/70 hover:text-white text-xs bg-white/10 p-1.5 rounded-full backdrop-blur-sm">✏️</button>
            </div>

            <div className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Day {day.dayNumber}</div>
            <h1 className="text-3xl font-bold cursor-text" onClick={() => setIsEditing(true)}>{day.title}</h1>

            <div className="flex items-center justify-center gap-3 mt-3 text-sm font-medium">
                {prevDayId ? (
                    <Link href={`/${locale}/days/${prevDayId}`} className="opacity-50 hover:opacity-100 transition-opacity" title="Previous Day">
                        <span className="text-xl">◀</span>
                    </Link>
                ) : <span className="w-[20px]"></span>}

                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <span>{format(new Date(day.date), 'yyyy.MM.dd EEEE')}</span>
                    {day.transport && (
                        <>
                            <span className="w-1 h-3 bg-white/30 rounded-full"></span>
                            <span className="flex items-center gap-1">
                                🚆 {day.transport}
                            </span>
                        </>
                    )}
                </div>

                {nextDayId ? (
                    <Link href={`/${locale}/days/${nextDayId}`} className="opacity-50 hover:opacity-100 transition-opacity" title="Next Day">
                        <span className="text-xl">▶</span>
                    </Link>
                ) : <span className="w-[20px]"></span>}
            </div>
        </div>
    )
}
