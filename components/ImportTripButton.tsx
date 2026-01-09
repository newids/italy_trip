'use client'

import { useTransition, useRef } from 'react'
import { importTrip } from '@/actions/share-actions'
import { useRouter } from 'next/navigation'

export default function ImportTripButton() {
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!confirm(`Import trip from "${file.name}"? This will create a new trip.`)) {
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        const reader = new FileReader()
        reader.onload = async (event) => {
            const content = event.target?.result as string
            if (!content) return

            startTransition(async () => {
                const res = await importTrip(content)
                if (res.error) {
                    alert('Import Failed: ' + res.error)
                } else {
                    alert('Trip imported successfully! 🎉')
                    if (res.tripId) {
                        // Optional: Redirect to new trip
                        // router.push(`/trips/${res.tripId}`)
                    }
                    router.refresh()
                }
                if (fileInputRef.current) fileInputRef.current.value = ''
            })
        }
        reader.readAsText(file)
    }

    return (
        <>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="btn-secondary"
            >
                {isPending ? 'Importing...' : '📥 Import Trip'}
            </button>
        </>
    )
}
