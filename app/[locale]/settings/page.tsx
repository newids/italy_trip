
'use client'

import { useState, useTransition } from 'react'
import { updateEmail, deleteAccount } from '@/actions/user-actions'
import { useRouter } from 'next/navigation'

export default function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    // Unwrapping params in client component (use hook or await in valid way if mixed? Next 15 prefers use(params), Next 14 await props)
    // Actually params are passed as promise in latest Next.js.
    // We can just ignore locale if not used for links, or use hook if needed.
    // Let's rely on standard "use client" behavior where props are serialized.
    // Wait, in Next 15 params is a Promise. We need to unwrap it with `use` or `await`.
    // But this is top level page... let's make it a wrapper.
    // Simpler: Just make the form a separate component. page.tsx can be server component.
    return <SettingsForm />
}

function SettingsForm() {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleUpdateEmail = async (formData: FormData) => {
        setMessage('')
        setError('')
        const newEmail = formData.get('email') as string

        startTransition(async () => {
            const res = await updateEmail(newEmail)
            if (res.error) setError(res.error)
            else setMessage("Email updated successfully.")
        })
    }

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to DELETE your account? This will wipe all data and reset the app.")) return

        const confirmation = prompt("Type 'DELETE' to confirm:")
        if (confirmation !== 'DELETE') return

        startTransition(async () => {
            const res = await deleteAccount()
            if (res?.error) setError(res.error)
            else {
                // Should redirect to /
                router.push('/')
                router.refresh()
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md space-y-8">
                <div>
                    <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-4">
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                    <p className="text-gray-500 text-sm">Manage your profile and data.</p>
                </div>

                {message && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}
                {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                {/* Change Email */}
                <section className="space-y-4 pt-4 border-t border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700">Change Email</h2>
                    <form action={handleUpdateEmail} className="space-y-3">
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="New Email Address"
                        />
                        <button disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full">
                            Update Email
                        </button>
                    </form>
                </section>

                {/* Delete Account */}
                <section className="space-y-4 pt-8 border-t border-gray-100">
                    <div className="bg-red-50 p-4 rounded-xl space-y-3 border border-red-100">
                        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                        <p className="text-xs text-red-600">
                            Deleting your account will remove all trips, bookings, and data. This action cannot be undone.
                            The app will reset to "Fresh Install" state.
                        </p>
                        <button onClick={handleDeleteAccount} disabled={isPending} className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition w-full">
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}
