'use client'

import { useState } from 'react'
import { verifyEmail } from '@/actions/auth-actions'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyForm({ locale }: { locale: string }) {
    const searchParams = useSearchParams()
    const emailParam = searchParams.get('email') || ''

    const [token, setToken] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        setError('')
        setIsPending(true)

        const res = await verifyEmail(emailParam, token)

        setIsPending(false)
        if (res?.error) {
            setError(res.error)
        } else if (res?.success) {
            setSuccess(true)
        }
    }

    if (success) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h1>
                <p className="text-gray-500 text-sm mb-6">Your email has been verified successfully.</p>
                <Link
                    href={`/${locale}/login?email=${encodeURIComponent(emailParam)}`}
                    className="block w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                    Sign In
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Verify Email</h1>
            <p className="text-gray-500 text-center text-sm mb-6">
                Enter the code sent to <span className="font-semibold text-gray-700">{emailParam}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                    <input
                        name="token"
                        type="text"
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                        maxLength={6}
                    />
                </div>

                <div className="text-xs text-center text-gray-400 mt-2">
                    (Check server console for code in Dev mode)
                </div>

                <button
                    disabled={isPending}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
                >
                    {isPending ? 'Verifying...' : 'Verify'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <Link href={`/${locale}/signup`} className="text-gray-500 hover:text-gray-700">
                    ← Back using correct email
                </Link>
            </div>
        </div>
    )
}
