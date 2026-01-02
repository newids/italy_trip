import { auth } from "@/auth"
import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

const intlMiddleware = createMiddleware({
    locales: ['en', 'ko'],
    defaultLocale: 'ko',
    localePrefix: 'as-needed'
})

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // Public paths that don't need auth or locale (like api) are handled by matcher

    // Check auth for protected routes
    // For now, protect everything except login and public landing if any
    const isLoginPage = pathname.includes('/login')
    const isDashboard = pathname === '/' || pathname.includes('/dashboard') || pathname.includes('/days')

    // Allow if logged in or if public page
    // For now, let's just run intlMiddleware
    // Real auth logic:
    // if (isDashboard && !isLoggedIn) return NextResponse.redirect(new URL('/en/login', req.url))

    return intlMiddleware(req)
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon.png).*)'],
}
