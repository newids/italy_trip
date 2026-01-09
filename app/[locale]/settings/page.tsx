
'use client'

import { useState, useTransition } from 'react'
import { updateEmail, deleteAccount } from '@/actions/user-actions'
import { restoreDatabase } from '@/actions/backup-actions'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import BackButton from '@/components/BackButton'

export default function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
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
                router.push('/')
                router.refresh()
            }
        })
    }

    return (
        <div className="min-h-screen p-6 flex flex-col items-center justify-center">
            <div className="glass-panel p-10 rounded-3xl w-full max-w-2xl space-y-10 relative overflow-hidden bg-white shadow-sm border border-gray-100">

                <div className="relative z-10">
                    <BackButton label="Dashboard" />
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your profile, data, and preferences.</p>
                </div>

                {message && <div className="p-4 bg-green-50/80 border border-green-200 text-green-800 rounded-xl text-sm backdrop-blur-sm animate-pulse-once">{message}</div>}
                {error && <div className="p-4 bg-red-50/80 border border-red-200 text-red-800 rounded-xl text-sm backdrop-blur-sm">{error}</div>}

                <div className="grid gap-12 md:grid-cols-2">

                    {/* Left Column: Email */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            ✉️ Identity
                        </h2>
                        <form action={handleUpdateEmail} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">New Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    placeholder="new-email@example.com"
                                />
                            </div>
                            <button disabled={isPending} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg transition transform hover:-translate-y-0.5">
                                Update Email
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Data & Danger */}
                    <div className="space-y-10">
                        {/* Language - Added */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                🌍 Language
                            </h2>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Display Language</span>
                                    <LanguageSwitcher fixed={false} className="w-40" />
                                </div>
                            </div>
                        </section>

                        {/* Data */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                💾 Data
                            </h2>

                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Export Database</span>
                                    <a href="/api/backup" className="text-xs bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition font-medium">
                                        Download
                                    </a>
                                </div>
                                <hr className="border-gray-200" />
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block mb-2">Import Database</span>
                                    <form action={async (formData) => {
                                        if (!confirm("Overwriting data. Continue?")) return;
                                        startTransition(async () => {
                                            const res = await restoreDatabase(formData)
                                            if (res?.error) setError(res.error)
                                            else { alert(res.success); window.location.reload() }
                                        })
                                    }} className="flex gap-2">
                                        <input type="file" name="backupFile" accept=".db" required className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                        <button disabled={isPending} className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">Restore</button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        {/* Danger */}
                        <section>
                            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2 mb-4">
                                ⚠️ Danger Zone
                            </h2>
                            <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                                <p className="text-xs text-red-800 mb-4 leading-relaxed">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <button onClick={handleDeleteAccount} disabled={isPending} className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition shadow-sm">
                                    Delete Account
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
