'use server'

import VerifyForm from '@/components/auth/VerifyForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function VerifyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const session = await auth()
    if (session?.user) {
        redirect(`/${locale}`)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
            <LanguageSwitcher fixed />
            <VerifyForm locale={locale} />
        </div>
    )
}
