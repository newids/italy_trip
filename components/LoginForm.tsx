
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { checkEmail, loginAction, createOwner } from '@/actions/auth-actions'
import { sendOTP, resetPassword } from '@/actions/recovery-actions'
import { signIn } from 'next-auth/webauthn'

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
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm space-y-8 border border-gray-100">

            <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-gray-50 rounded-xl mb-6">
                    <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                    {view === 'SIGNUP' ? 'Setup Account' : view === 'OWNER_LOGIN' ? `Welcome Back` : 'TripTimeTable'}
                </h1>
                {view === 'OWNER_LOGIN' && (
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-gray-900 font-semibold">{ownerStatus.name}</p>
                        <p className="text-gray-500 text-sm">{ownerStatus.email}</p>
                    </div>
                )}

                {(view === 'EMAIL') && <p className="text-gray-500 text-sm">Sign in to access your plans</p>}
                {(view === 'PASSWORD') && <p className="text-gray-500 text-sm">Enter your password</p>}
            </div>

            {error && <div className="p-4 bg-red-50/90 border border-red-100 text-red-600 text-sm rounded-2xl animate-shake">{error}</div>}

            {/* LOGIN FORMS */}
            {(view === 'OWNER_LOGIN' || view === 'PASSWORD') && (
                <div className="space-y-4">
                    <form action={handleLogin} className="space-y-4">
                        <input type="hidden" name="email" value={email} />
                        <div>
                            <input
                                name="password"
                                type="password"
                                autoFocus
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="Password"
                            />
                        </div>
                        <button className="w-full btn-primary py-3 rounded-xl text-md">
                            Sign In
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn("passkey")}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                        <span className="text-xl">🙌</span> Sign in with Face ID / Passkey
                    </button>
                </div>
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="name@example.com"
                        />
                    </div>
                    <button disabled={isPending} className="w-full btn-primary py-3 rounded-xl text-md">
                        {isPending ? 'Checking...' : 'Continue'}
                    </button>
                </form>
            )}

            {/* SIGNUP FORM */}
            {view === 'SIGNUP' && (
                <form action={handleSignup} className="space-y-4 relative z-10">
                    <input type="hidden" name="email" value={email} />
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">Name</label>
                        <input name="name" type="text" required className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Your Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">Password</label>
                        <input name="password" type="password" required className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Strong password" />
                    </div>
                    <button className="w-full btn-primary py-4 rounded-2xl text-lg font-bold tracking-wide mt-2">
                        Create Account
                    </button>
                </form>
            )}

            {/* RECOVERY VIEW */}
            {view === 'RECOVERY' && (
                <div className="space-y-4 relative z-10">
                    {!email ? (
                        <form action={async (formData) => {
                            setError('')
                            const inputEmail = formData.get('email') as string
                            if (!inputEmail) return setError("Email required")
                            const res = await sendOTP(inputEmail)
                            if (res?.error) setError(res.error)
                            else {
                                setEmail(inputEmail)
                            }
                        }} className="space-y-4">
                            <p className="text-sm text-gray-600 text-center">Enter your email to receive a secure code.</p>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="owner@example.com"
                            />
                            <button className="w-full btn-primary py-3 rounded-2xl font-bold">
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
                                setView('OWNER_LOGIN')
                                setError('')
                                alert("Password reset successful. Please login.")
                            }
                        }} className="space-y-4">
                            <div className="p-3 bg-blue-50/50 text-blue-700 text-xs rounded-xl text-center mb-2 border border-blue-100">
                                Code sent to <b className="text-blue-800">{email}</b>. (Console)
                            </div>
                            <input type="hidden" name="email" value={email} />
                            <input
                                name="token"
                                type="text"
                                required
                                className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-center tracking-[0.5em] font-mono text-xl"
                                placeholder="000000"
                                maxLength={6}
                            />
                            <input
                                name="newPassword"
                                type="password"
                                required
                                className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="New Password"
                            />
                            <button className="w-full btn-primary py-3 rounded-2xl font-bold">
                                Set New Password
                            </button>
                        </form>
                    )}

                    <button type="button" onClick={() => { setView('OWNER_LOGIN'); setEmail(ownerStatus.email || '') }} className="block w-full text-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition p-2">
                        ← Back to Login
                    </button>
                </div>
            )}

            {/* FOOTER OPTIONS */}
            {view === 'OWNER_LOGIN' && (
                <div className="space-y-3 mt-6 pt-6 border-t border-gray-200/50 relative z-10">
                    <button onClick={() => { setView('EMAIL'); setEmail('') }} className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-indigo-700 hover:bg-white/40 rounded-xl transition flex items-center justify-center gap-2">
                        👤 Sign in with another account
                    </button>
                    <button onClick={() => { setView('EMAIL'); setEmail('') }} className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-indigo-700 hover:bg-white/40 rounded-xl transition flex items-center justify-center gap-2">
                        ✨ Create another account
                    </button>
                    <button onClick={() => setView('RECOVERY')} className="block w-full text-center text-xs font-semibold text-gray-400 hover:text-indigo-500 transition pt-2">
                        Forgot Password?
                    </button>
                </div>
            )}

            {(view === 'PASSWORD' || view === 'EMAIL' || view === 'SIGNUP') && (
                <div className="text-center mt-4 relative z-10">
                    <button onClick={() => setView(ownerStatus.exists ? 'OWNER_LOGIN' : 'EMAIL')} className="text-sm font-medium text-gray-400 hover:text-gray-700 transition px-4 py-2 hover:bg-white/30 rounded-lg">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )
}
