
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import prisma from "@/lib/prisma"

import Passkey from "next-auth/providers/passkey"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        Passkey({
            formFields: {
                email: { label: "Email", type: "email", required: true, autocomplete: "webauthn" },
            }
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.error(`[AUTH] Authorize called for: ${credentials?.email}`)
                if (!credentials?.email || !credentials?.password) {
                    return null
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })
                if (!user || !user.password) {
                    console.error("Auth Error: User not found or no password set.")
                    return null;
                }
                const isValid = await bcrypt.compare(credentials.password as string, user.password);
                if (!isValid) {
                    console.error("Auth Error: Invalid password.")
                    return null;
                }
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
