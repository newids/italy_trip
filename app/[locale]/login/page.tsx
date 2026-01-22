'use server'

import SignInForm from '@/components/auth/SignInForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // If already logged in, redirect home
    const session = await auth()
    if (session?.user) {
        redirect(`/${locale}`)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
            <LanguageSwitcher fixed />
            <SignInForm locale={locale} />
        </div>
    )
}
