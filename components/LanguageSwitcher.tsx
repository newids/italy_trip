
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ChangeEvent, useTransition } from 'react'

export default function LanguageSwitcher() {
    const router = useRouter()
    const pathname = usePathname()
    const locale = useLocale()
    const [isPending, startTransition] = useTransition()

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value
        startTransition(() => {
            // Replace the locale in the pathname
            // Assuming pathname starts with /en or /ko
            const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`)
            router.replace(newPath)
        })
    }

    return (
        <div className="fixed top-4 right-4 z-50">
            <select
                defaultValue={locale}
                onChange={onSelectChange}
                disabled={isPending}
                className="bg-white/90 backdrop-blur border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-lg"
            >
                <option value="en">🇺🇸 English</option>
                <option value="ko">🇰🇷 한국어</option>
            </select>
        </div>
    )
}
