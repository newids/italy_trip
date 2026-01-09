
import { getOwnerStatus } from '@/actions/auth-actions'
import LoginForm from '@/components/LoginForm'
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

    // Fetch initial status
    const ownerStatus = await getOwnerStatus()

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <LanguageSwitcher fixed />
            <LoginForm ownerStatus={ownerStatus} locale={locale} />
        </div>
    )
}
