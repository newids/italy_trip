
import { getOwnerStatus } from '@/actions/auth-actions'
import LoginForm from '@/components/LoginForm'
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
        <div className="min-h-screen bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] flex items-center justify-center p-4">
            <LoginForm ownerStatus={ownerStatus} locale={locale} />
        </div>
    )
}
