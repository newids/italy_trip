'use client'

import { useState } from 'react'
import { signup } from '@/actions/auth-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

            <div className="mt-8 text-center text-sm">
                <span className="text-gray-500">Already have an account? </span>
                <Link href={`/${locale}/login`} className="text-indigo-600 font-semibold hover:text-indigo-800">
                    Sign in
                </Link>
            </div>
        </div>
    )
}
