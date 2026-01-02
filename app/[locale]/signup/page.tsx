
import { signIn } from "@/auth"
import { redirect } from 'next/navigation'
import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Check if any user exists
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Signup Disabled</h1>
                    <p className="text-gray-600">Owner account already exists.</p>
                    <a href={`/${locale}/login`} className="block w-full bg-[#667eea] text-white font-bold py-3 rounded-xl hover:bg-[#5a6fd6] transition">
                        Go to Login
                    </a>
                </div>
            </div>
        )
    }

    // Server Action for signup
    async function signup(formData: FormData) {
        'use server'
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const name = formData.get('name') as string

        if (!email || !password) return

        // Double check count to prevent race condition
        const count = await prisma.user.count();
        if (count > 0) {
            throw new Error("Signup disabled");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        })

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
                    <h1 className="text-3xl font-bold text-[#764ba2] mb-2">Setup Owner Account</h1>
                    <p className="text-gray-500 text-sm">Create the first account to own this app</p>
                </div>

                <form action={signup} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Name</label>
                        <input name="name" type="text" required className="w-full px-4 py-2 rounded-lg border-0 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition" placeholder="Your Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Email</label>
                        <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border-0 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition" placeholder="owner@example.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Password</label>
                        <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border-0 bg-white/50 focus:ring-2 focus:ring-[#667eea] outline-none transition" placeholder="Strong password" />
                    </div>
                    <button className="w-full bg-[#667eea] text-white font-bold py-3 rounded-xl hover:bg-[#5a6fd6] transition shadow-lg shadow-indigo-200">
                        Create Owner Account
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Note: Password changes after signup are only available via Biometric/Passkey login.
                    </p>
                </form>
            </div>
        </div>
    )
}
