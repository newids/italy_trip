import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
    }),
    redirect: vi.fn(),
    notFound: vi.fn(),
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock Auth
vi.mock('@/auth', () => ({
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
}))

// Mock Prisma (Basic)
vi.mock('@/lib/prisma', () => ({
    default: {
        trip: {
            findUnique: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        },
        day: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        booking: {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
        },
        activity: {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
            updateMany: vi.fn(),
        },
        highlight: {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
        },
        accommodation: {
            upsert: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            count: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(vi.mocked('@/lib/prisma').default)),
    }
}))
