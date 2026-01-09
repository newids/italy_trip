'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function HamburgerMenu({ locale }: { locale: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const changeLanguage = (newLocale: string) => {
        startTransition(() => {
            // Replace /en/ with /ko/ etc.
            const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
            router.replace(newPath)
            setIsOpen(false)
        })
    }

    return (
        <div className="relative z-[999]" ref={menuRef}>
            {/* Standard "Pro" Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition shadow-sm active:translate-y-[1px]"
                aria-label="Menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-[999] overflow-hidden text-sm ring-1 ring-black/5 flex flex-col">

                    {/* Navigation */}
                    <div className="py-2">
                        <Link
                            href={`/${locale}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-lg">🏠</span> Dashboard
                        </Link>
                        <Link
                            href={`/${locale}/settings`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-lg">⚙️</span> Settings
                        </Link>
                        <Link
                            href={`/${locale}/about`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-lg">ℹ️</span> About
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Language Switcher Section */}
                    <div className="py-2 px-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Language</p>
                        <div className="flex flex-col gap-1">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm transition ${locale === 'en' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <span className="flex items-center gap-2">🇺🇸 English</span>
                                {locale === 'en' && <span>✓</span>}
                            </button>
                            <button
                                onClick={() => changeLanguage('ko')}
                                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm transition ${locale === 'ko' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <span className="flex items-center gap-2">🇰🇷 한국어</span>
                                {locale === 'ko' && <span>✓</span>}
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout */}
                    <div className="py-2">
                        <Link
                            href="/api/auth/signout"
                            className="flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50/50 transition-colors w-full text-left"
                        >
                            <span>🚪</span> Sign Out
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
