'use client'

import { useState } from 'react'
import { updateName, deleteAccount } from '@/actions/user-actions'
import { useRouter } from 'next/navigation'

type UserProps = {
    name?: string | null
    email?: string | null
}

export default function SettingsEditor({ user }: { user: UserProps }) {
    const [name, setName] = useState(user.name || '')
    const [msg, setMsg] = useState('')
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleUpdateName = async () => {
        setMsg('')
        setError('')
        setIsPending(true)
        const res = await updateName(name)
        setIsPending(false)
        if (res?.error) setError(res.error)
        else setMsg("Name updated successfully")
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return

        setIsPending(true)
        const res = await deleteAccount()
        if (res?.error) {
            setIsPending(false)
            setError(res.error)
        } else {
            // Redirect happens server side or we force it
            router.push('/')
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                disabled
                                value={user.email || ''}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed securely at this time.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {msg && <p className="text-sm text-green-600 font-medium">{msg}</p>}
                        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                        <button
                            onClick={handleUpdateName}
                            disabled={isPending || name === user.name}
                            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
                    <p className="text-gray-500 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="px-5 py-2.5 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    )
}
