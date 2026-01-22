'use client'

import { useState } from 'react'
import { sendOTP, resetPassword } from '@/actions/recovery-actions'
import Link from 'next/link'

export default function RecoveryForm({ locale }: { locale: string }) {
    const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL')
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [isPending, setIsPending] = useState(false)

    // Reset fields
    const [token, setToken] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const handleSendOTP = async (formData: FormData) => {
        setError('')
        setSuccessMsg('')
        setIsPending(true)

        const inputEmail = formData.get('email') as string
        const res = await sendOTP(inputEmail)

        setIsPending(false)
        if (res?.error) {
            setError(res.error)
        } else {
            setEmail(inputEmail)
            setStep('RESET')
            setSuccessMsg("Code sent! Check your email (or console).")
        }
    }

    const handleReset = async (formData: FormData) => {
        setError('')
        setIsPending(true)

        const res = await resetPassword(email, token, newPassword)

        setIsPending(false)
        if (res?.error) {
            setError(res.error)
        } else {
            // Success
            setSuccessMsg("Password updated successfully!")
            // Maybe wait a bit?
        }
    }

    // Success State (Password Changed)
    if (successMsg === "Password updated successfully!") {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
                <p className="text-gray-500 text-sm mb-6">Your password has been reset.</p>
                <Link
                    href={`/${locale}/login`}
                    className="block w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                    Sign In with New Password
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {step === 'EMAIL' ? 'Forgot Password?' : 'Reset Password'}
            </h1>
            <p className="text-gray-500 text-center text-sm mb-6">
                {step === 'EMAIL' ? 'Enter your email to receive a code' : `Enter code sent to ${email}`}
            </p>

            {step === 'EMAIL' ? (
                <form action={handleSendOTP} className="space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="name@example.com"
                        />
                    </div>

                    <button
                        disabled={isPending}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
                    >
                        {isPending ? 'Sending...' : 'Send Code'}
                    </button>
                </form>
            ) : (
                <form action={handleReset} className="space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
                    {successMsg && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl">{successMsg}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input
                            name="token"
                            type="text"
                            required
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl tracking-widest font-mono"
                            placeholder="000000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            name="newPassword"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="New strong password"
                        />
                    </div>

                    <button
                        disabled={isPending}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
                    >
                        {isPending ? 'Resetting...' : 'Set New Password'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep('EMAIL')}
                        className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
                    >
                        Use different email
                    </button>
                </form>
            )}

            <div className="mt-8 text-center text-sm">
                <Link href={`/${locale}/login`} className="text-gray-500 hover:text-gray-700">
                    ← Back to Login
                </Link>
            </div>
        </div>
    )
}
