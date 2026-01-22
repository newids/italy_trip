'use server'

import SettingsEditor from '@/components/SettingsEditor'
import HamburgerMenu from '@/components/HamburgerMenu'
import BackButton from '@/components/BackButton'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm safe-top">
                <div className="max-w-screen-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BackButton />
                        <h1 className="font-bold text-lg text-gray-900 line-clamp-1">
                            Settings
                        </h1>
                    </div>
                    <HamburgerMenu locale={locale} />
                </div>
            </div>

            <div className="max-w-screen-md mx-auto p-4 sm:p-6 space-y-6">
                <SettingsEditor user={session.user} />
            </div>
        </div>
    )
}
