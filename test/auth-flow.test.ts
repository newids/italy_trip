import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signup, verifyEmail } from '@/actions/auth-actions'
import prisma from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/tokens'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
            findFirst: vi.fn(),
        },
        verificationToken: {
            findFirst: vi.fn(),
            delete: vi.fn(),
            create: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback({} as any)),
    }
}))

vi.mock('@/lib/tokens', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/tokens')>()
    return {
        ...actual,
        generateVerificationToken: vi.fn(),
        getVerificationTokenByEmail: vi.fn(),
    }
})

describe('Auth Flow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('signup', () => {
        it('should create a user and generate a token', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'password123')
            formData.append('name', 'Test User')

            // Mock prisma responses
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
            vi.mocked(prisma.user.create).mockResolvedValue({ id: 'user-1', email: 'test@example.com' } as any)

            // Mock token generation
            vi.mocked(generateVerificationToken).mockResolvedValue({ token: '123456' } as any)

            const result = await signup(null, formData)

            expect(result).toEqual({ success: true })
            expect(prisma.user.create).toHaveBeenCalled()
            expect(generateVerificationToken).toHaveBeenCalledWith('test@example.com')
        })

        it('should fail if user already exists', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'password123')
            formData.append('name', 'Test User')

            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)

            const result = await signup(null, formData)

            expect(result).toEqual({ error: 'User already exists' })
            expect(prisma.user.create).not.toHaveBeenCalled()
        })
    })

    describe('verifyEmail', () => {
        it('should verify email with correct token', async () => {
            // Mock token retrieval
            const validToken = {
                identifier: 'test@example.com',
                token: '123456',
                expires: new Date(Date.now() + 10000) // Future
            }

            // We need to mock getVerificationTokenByEmail which is imported in auth-actions
            // But verifyEmail uses `getVerificationTokenByEmail` from lib/tokens
            // Wait, we mocked the module, so we need to set the implementation
            const tokensModule = await import('@/lib/tokens')
            vi.mocked(tokensModule.getVerificationTokenByEmail).mockResolvedValue(validToken as any)

            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1', email: 'test@example.com' } as any)

            const result = await verifyEmail('test@example.com', '123456')

            expect(result).toEqual({ success: true })
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                data: expect.objectContaining({ emailVerified: expect.any(Date) })
            })
            expect(prisma.verificationToken.delete).toHaveBeenCalled()
        })

        it('should fail validation with invalid token', async () => {
            const tokensModule = await import('@/lib/tokens')
            vi.mocked(tokensModule.getVerificationTokenByEmail).mockResolvedValue(null)

            const result = await verifyEmail('test@example.com', 'wrong')

            expect(result).toEqual({ error: 'Invalid token' })
            expect(prisma.user.update).not.toHaveBeenCalled()
        })
    })
})
