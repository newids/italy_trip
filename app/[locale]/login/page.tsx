
import { signIn } from "@/auth"
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth()
    if (session?.user) {
        redirect(`/${locale}`)
    }
    const userCount = await prisma.user.count();

    // Server Action for credential login
    async function credentialLogin(formData: FormData) {
        'use server'
        const email = formData.get('email')
        const password = formData.get('password')
        console.log(`[LOGIN ACTION] Attempting login for: ${email}`)
        if (!email || !password) return

        await signIn("credentials", {
            email,
            password,
            redirectTo: `/${locale}`
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#764ba2] mb-2">Trip Planner</h1>
                    <p className="text-gray-500 text-sm">Sign in to start planning</p>
                    {userCount === 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700 mb-2">No users found.</p>
                            <a href={`/${locale}/signup`} className="text-blue-600 font-bold hover:underline">
                                Setup Owner Account &rarr;
                            </a>
                        </div>
                    )}
                </div>

                <form action={credentialLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Email</label>
                        <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border-0 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition" placeholder="newid@example.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Password</label>
                        <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border-0 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition" placeholder="Any password" />
                    </div>
                    <button className="w-full bg-[#667eea] text-white font-bold py-3 rounded-xl hover:bg-[#5a6fd6] transition shadow-lg shadow-indigo-200">
                        Sign In with Email
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/0 text-gray-500 bg-[#fff5f5]">or continue with</span>
                    </div>
                </div>

                <button className="w-full bg-white text-gray-700 border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <span>🔑</span> Passkey / Biometric
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">
                    Password changes are only available via Biometric/Passkey login.
                </p>
            </div>
        </div>
    )
}
