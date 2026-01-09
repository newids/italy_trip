'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({ label = "Back" }: { label?: string }) {
    const router = useRouter()
    return (
        <button
            onClick={() => router.back()}
            className="btn-secondary px-3 py-1.5 text-xs text-gray-600 inline-flex items-center gap-1"
        >
            <span>←</span> {label}
        </button>
    )
}
