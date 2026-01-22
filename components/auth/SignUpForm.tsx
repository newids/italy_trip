'use client'

import { useState } from 'react'
import { signup } from '@/actions/auth-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function SignUpForm({ locale }: { locale: string }) {
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setError('')
        setIsPending(true)

        const email = formData.get('email') as string
        const res = await signup(null, formData)

        setIsPending(false)
        if (res?.error) {
            setError(res.error)
        } else if (res?.success) {
            // Redirect to verify page
            router.push(`/${locale}/verify?email=${encodeURIComponent(email)}`)
        }
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create Account</h1>
            <p className="text-gray-500 text-center text-sm mb-6">Join us to plan your perfect trip</p>

            <form action={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    disabled={isPending}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
                >
                    {isPending ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or sign up with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => signIn("google")} className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition bg-white text-gray-700 font-medium text-sm">
                    <span>🇬</span> Google
                </button>
                <button onClick={() => signIn("facebook")} className="flex items-center justify-center gap-2 py-2.5 border border-blue-600 bg-blue-600 rounded-xl hover:bg-blue-700 transition text-white font-medium text-sm">
                    <span>🇫</span> Facebook
                </button>
                <button onClick={() => signIn("twitter")} className="flex items-center justify-center gap-2 py-2.5 border border-black bg-black rounded-xl hover:bg-gray-800 transition text-white font-medium text-sm">
                    <span>𝕏</span> X
                </button>
                <button onClick={() => signIn("kakao")} className="flex items-center justify-center gap-2 py-2.5 border border-[#FEE500] bg-[#FEE500] rounded-xl hover:bg-[#FDD835] transition text-[#371D1E] font-medium text-sm">
                    <span>🇰</span> Kakao
                </button>
                <button onClick={() => signIn("naver")} className="flex items-center justify-center gap-2 py-2.5 border border-[#03C75A] bg-[#03C75A] rounded-xl hover:bg-[#02b351] transition text-white font-medium text-sm">
                    <span>🇳</span> Naver
                </button>
                <button onClick={() => signIn("passkey")} className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium text-sm">
                    <span>🔑</span> Passkey
                </button>
            </div>

            <div className="mt-8 text-center text-sm">
                <span className="text-gray-500">Already have an account? </span>
                <Link href={`/${locale}/login`} className="text-indigo-600 font-semibold hover:text-indigo-800">
                    Sign in
                </Link>
            </div>
        </div>
    )
}
