
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { checkEmail, loginAction, createOwner } from '@/actions/auth-actions'
import { sendOTP, resetPassword } from '@/actions/recovery-actions'

type OwnerStatus = {
    exists: boolean
    email: string | null
    name: string | null
}

export default function LoginForm({ ownerStatus, locale }: { ownerStatus: OwnerStatus, locale: string }) {
    // States: 'OWNER_LOGIN', 'EMAIL', 'PASSWORD', 'SIGNUP', 'RECOVERY'
    const [view, setView] = useState<'OWNER_LOGIN' | 'EMAIL' | 'PASSWORD' | 'SIGNUP' | 'RECOVERY'>(
        ownerStatus.exists ? 'OWNER_LOGIN' : 'EMAIL'
    )

    const [email, setEmail] = useState(ownerStatus.exists ? ownerStatus.email || '' : '')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleEmailSubmit = (formData: FormData) => {
        const inputEmail = formData.get('email') as string
        setEmail(inputEmail)
        setError('')

        startTransition(async () => {
            const result = await checkEmail(inputEmail)
            if (result.exists) {
                setView('PASSWORD')
            } else {
                if (ownerStatus.exists) {
                    setError("Account not found. This app is managed by a single owner.")
                } else {
                    setView('SIGNUP')
                }
            }
        })
    }

    const handleLogin = async (formData: FormData) => {
        setError('')
        const res = await loginAction(formData)
        if (res?.error) setError(res.error)
    }

    const handleSignup = async (formData: FormData) => {
        setError('')
        const res = await createOwner(null, formData)
        if (res?.error) setError(res.error)
    }

    return (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-[#764ba2] mb-2">
                    {view === 'SIGNUP' ? 'Setup Owner' : view === 'OWNER_LOGIN' ? `Welcome, ${ownerStatus.name}!` : 'Trip Planner'}
                </h1>
                {view === 'OWNER_LOGIN' && <p className="text-gray-500 text-sm">{email}</p>}
                {(view === 'EMAIL') && <p className="text-gray-500 text-sm">Sign in to start planning</p>}
                {(view === 'PASSWORD') && <p className="text-gray-500 text-sm">Welcome back</p>}
            </div>

            {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">{error}</div>}

            {/* LOGIN FORMS */}
            {(view === 'OWNER_LOGIN' || view === 'PASSWORD') && (
                <form action={handleLogin} className="space-y-4">
                    <input type="hidden" name="email" value={email} />
                    <div>
                        <input
                            name="password"
                            type="password"
                            autoFocus
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition text-base"
                            placeholder="Password"
                        />
                    </div>
                    <button className="w-full bg-[#667eea] text-white font-bold py-3 rounded-xl hover:bg-[#5a6fd6] transition shadow-lg shadow-indigo-200">
                        Sign In
                    </button>
                </form>
            )}

            {/* EMAIL FORM */}
            {view === 'EMAIL' && (
                <form action={handleEmailSubmit} className="space-y-4">
                    <div>
                        <input
                            name="email"
                            type="email"
                            autoFocus
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition text-base"
                            placeholder="name@example.com"
                        />
                    </div>
                    <button disabled={isPending} className="w-full bg-[#667eea] text-white font-bold py-3 rounded-xl hover:bg-[#5a6fd6] transition shadow-lg shadow-indigo-200">
                        {isPending ? 'Checking...' : 'Next'}
                    </button>
                </form>
            )}

            {/* SIGNUP FORM */}
            {view === 'SIGNUP' && (
                <form action={handleSignup} className="space-y-4">
                    <input type="hidden" name="email" value={email} />
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Name</label>
                        <input name="name" type="text" required className="w-full px-4 py-2 rounded-lg border-0 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition" placeholder="Your Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Password</label>
                        <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border-0 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition" placeholder="Strong password" />
                    </div>
                    <button className="w-full bg-[#667eea] text-white font-bold py-3 rounded-xl hover:bg-[#5a6fd6] transition shadow-lg shadow-indigo-200">
                        Create Owner Account
                    </button>
                </form>
            )}

            {/* RECOVERY VIEW */}
            {view === 'RECOVERY' && (
                <div className="space-y-4">
                    {!email ? (
                        <form action={async (formData) => {
                            setError('')
                            const inputEmail = formData.get('email') as string
                            if (!inputEmail) return setError("Email required")
                            const res = await sendOTP(inputEmail)
                            if (res?.error) setError(res.error)
                            else {
                                setEmail(inputEmail)
                                // We stay in RECOVERY but now we have email, show verification
                            }
                        }} className="space-y-3">
                            <p className="text-sm text-gray-600 text-center">Enter your email to receive a code.</p>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition"
                                placeholder="owner@example.com"
                            />
                            <button className="w-full bg-[#667eea] text-white font-bold py-2 rounded-xl hover:bg-[#5a6fd6] transition">
                                Send Code
                            </button>
                        </form>
                    ) : (
                        <form action={async (formData) => {
                            setError('')
                            const token = formData.get('token') as string
                            const newPwd = formData.get('newPassword') as string
                            const res = await resetPassword(email, token, newPwd)
                            if (res?.error) setError(res.error)
                            else {
                                // Success
                                setView('OWNER_LOGIN')
                                setError('') // Clear any errors
                                alert("Password reset successful. Please login.")
                            }
                        }} className="space-y-3">
                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg text-center mb-2">
                                Code sent to <b>{email}</b>. Check server console.
                            </div>
                            <input type="hidden" name="email" value={email} />
                            <input
                                name="token"
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition text-center tracking-widest font-mono text-lg"
                                placeholder="123456"
                                maxLength={6}
                            />
                            <input
                                name="newPassword"
                                type="password"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition"
                                placeholder="New Password"
                            />
                            <button className="w-full bg-[#667eea] text-white font-bold py-2 rounded-xl hover:bg-[#5a6fd6] transition">
                                Reset Password
                            </button>
                        </form>
                    )}

                    <button type="button" onClick={() => { setView('OWNER_LOGIN'); setEmail(ownerStatus.email || '') }} className="block w-full text-center text-sm text-blue-600 hover:underline">
                        Back to Login
                    </button>
                </div>
            )}

            {/* FOOTER OPTIONS */}
            {view === 'OWNER_LOGIN' && (
                <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
                    <button onClick={() => { setView('EMAIL'); setEmail('') }} className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 rounded-lg transition flex items-center justify-center gap-2">
                        👤 Sign in with another account
                    </button>
                    <button onClick={() => { setView('EMAIL'); setEmail('') }} className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 rounded-lg transition flex items-center justify-center gap-2">
                        ✨ Create another account
                    </button>
                    <button onClick={() => setView('RECOVERY')} className="block w-full text-center text-xs text-gray-400 hover:text-[#667eea] transition">
                        Forgot Password?
                    </button>
                </div>
            )}

            {(view === 'PASSWORD' || view === 'EMAIL' || view === 'SIGNUP') && (
                <div className="text-center mt-4">
                    <button onClick={() => setView(ownerStatus.exists ? 'OWNER_LOGIN' : 'EMAIL')} className="text-sm text-gray-400 hover:text-gray-600">
                        Back
                    </button>
                </div>
            )}
        </div>
    )
}
