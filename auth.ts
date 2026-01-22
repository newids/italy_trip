import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Twitter from "next-auth/providers/twitter"
import Kakao from "next-auth/providers/kakao"
import Naver from "next-auth/providers/naver"
import Passkey from "next-auth/providers/passkey"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        Google,
        Facebook,
        Twitter,
        Kakao,
        Naver,
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
})
