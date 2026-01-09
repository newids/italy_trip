
'use client'

import { useState } from 'react'
import { addLink, addImage, removeLink, removeImage } from '@/app/actions/content'

export default function ContentEditor({ activity, forceOpen = false }: { activity: any, forceOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(forceOpen)
    const [newLink, setNewLink] = useState('')
    const [newLabel, setNewLabel] = useState('')
    const [newImage, setNewImage] = useState('')

    const links = activity.links ? JSON.parse(activity.links) : []
    const images = activity.images ? JSON.parse(activity.images) : []

    if (!isOpen && !forceOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="text-xs text-indigo-500 hover:text-indigo-700 underline mt-2">
                Manage Content
            </button>
        )
    }

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-indigo-100">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-gray-700">Content Editor</h4>
                <button onClick={() => setIsOpen(false)} className="text-xs text-gray-400">Close</button>
            </div>

            {/* Links */}
            <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Links</label>
                <ul className="space-y-1 mb-2">
                    {links.map((link: any, i: number) => (
                        <li key={i} className="flex justify-between text-xs bg-white p-1 rounded border">
                            <a href={link.url} target="_blank" className="text-blue-500 truncate max-w-[150px]">{link.label || link.url}</a>
                            <button onClick={() => removeLink(activity.id, i)} className="text-red-400 hover:text-red-600">×</button>
                        </li>
                    ))}
                </ul>
                <div className="flex gap-2">
                    <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label" className="w-1/3 text-xs p-1 border rounded" />
                    <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="URL" className="flex-1 text-xs p-1 border rounded" />
                    <button onClick={async () => {
                        if (newLink) {
                            await addLink(activity.id, newLink, newLabel)
                            setNewLink(''); setNewLabel('');
                        }
                    }} className="bg-indigo-500 text-white text-xs px-2 rounded">Add</button>
                </div>
            </div>

            {/* Images */}
            <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Photos (URL)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {images.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square">
                            <img src={img} className="w-full h-full object-cover rounded" />
                            <button onClick={() => removeImage(activity.id, i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="Image URL" className="flex-1 text-xs p-1 border rounded" />
                    <button onClick={async () => {
                        if (newImage) {
                            await addImage(activity.id, newImage)
                            setNewImage('');
                        }
                    }} className="bg-indigo-500 text-white text-xs px-2 rounded">Add</button>
                </div>
            </div>
        </div>
    )
}
