
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ChangeEvent, useTransition } from 'react'

export default function LanguageSwitcher({ fixed = true, className = "" }: { fixed?: boolean, className?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const locale = useLocale()
    const [isPending, startTransition] = useTransition()

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value
        startTransition(() => {
            // Split path into segments
            const segments = pathname.split('/')
            // Replace the second segment (index 1) which is the locale
            // Path structure: '' / 'en' / 'dashboard'
            if (segments.length > 1) {
                segments[1] = nextLocale
                const newPath = segments.join('/')
                router.replace(newPath)
            } else {
                // Fallback if path is weird, though middleware enforces locale
                router.replace(`/${nextLocale}`)
            }
        })
    }

    const containerInfo = fixed
        ? "fixed top-4 right-4 z-50"
        : "relative inline-block"

    return (
        <div className={`${containerInfo} ${className}`}>
            <select
                defaultValue={locale}
                onChange={onSelectChange}
                disabled={isPending}
                className="bg-white/90 backdrop-blur border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
                <option value="en">🇺🇸 English</option>
                <option value="ko">🇰🇷 한국어</option>
            </select>
        </div>
    )
}
