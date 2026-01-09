'use client'

import { useTransition } from 'react'
import { exportTrip } from '@/actions/share-actions'

export default function ExportTripButton({ tripId, title }: { tripId: string, title: string }) {
    const [isPending, startTransition] = useTransition()

    const handleExport = () => {
        if (!confirm("Download this trip as a shareable file?")) return

        startTransition(async () => {
            const res = await exportTrip(tripId)

            if (res.error) {
                alert("Export failed: " + res.error)
                return
            }

            if (res.data) {
                // Create JSON Blob and Download
                const fileName = `Trip - ${title}.json`
                const json = JSON.stringify(res.data, null, 2)
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)

                const a = document.createElement('a')
                a.href = url
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }
        })
    }

    return (
        <button
            onClick={handleExport}
            disabled={isPending}
            className="btn-secondary text-xs px-3 py-1.5"
        >
            {isPending ? 'Exporting...' : '📤 Share Trip'}
        </button>
    )
}
