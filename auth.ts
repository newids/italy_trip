
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import prisma from "@/lib/prisma"

import Passkey from "next-auth/providers/passkey"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Passkey({
            formFields: {
                email: { label: "Email", type: "email", required: true },
            }
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Logic to verify user
                // For Power P Demo, we accept any password for the seeded user 'newid@example.com'
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user) {
                    return null; // Or create a new user dynamically for demo?
                }

                // In a real app, verify hash. 
                // For MVP Power P, we'll just allow login if user exists
                return user
            },
        }),
    ],
    experimental: { enableWebAuthn: true },
    callbacks: {
        async session({ session, user, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
            }
            return token
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/login',
    }
})
