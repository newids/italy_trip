'use client'

import { useState } from 'react'
import { signup } from '@/actions/auth-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import Button from '@/components/ui/Button'

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

                <Button
                    disabled={isPending}
                    variant="primary"
                    className="w-full mt-2"
                >
                    {isPending ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or sign up with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="social" onClick={() => signIn("google")} className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                    <span>🇬</span> Google
                </Button>
                <Button type="button" variant="social" onClick={() => signIn("facebook")} className="border-blue-600 bg-blue-600 text-white hover:bg-blue-700">
                    <span>🇫</span> Facebook
                </Button>
                <Button type="button" variant="social" onClick={() => signIn("twitter")} className="border-black bg-black text-white hover:bg-gray-800">
                    <span>𝕏</span> X
                </Button>
                <Button type="button" variant="social" onClick={() => signIn("kakao")} className="border-[#FEE500] bg-[#FEE500] text-[#371D1E] hover:bg-[#FDD835]">
                    <span>🇰</span> Kakao
                </Button>
                <Button type="button" variant="social" onClick={() => signIn("naver")} className="border-[#03C75A] bg-[#03C75A] text-white hover:bg-[#02b351]">
                    <span>🇳</span> Naver
                </Button>
                <Button type="button" variant="social" onClick={() => signIn("passkey")} className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                    <span>🔑</span> Passkey
                </Button>
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
