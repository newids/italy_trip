import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyTripAccess, AuthError } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

// Setup Mocks
const mockAuth = vi.mocked(auth)
const mockPrismaTripFindUnique = vi.mocked(prisma.trip.findUnique)

describe('verifyTripAccess', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should throw AuthError if user is not logged in', async () => {
        mockAuth.mockResolvedValue(null as any)

        await expect(verifyTripAccess('trip-123'))
            .rejects.toThrow("You must be logged in.")
    })

    it('should throw Error if trip is not found', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as any)
        mockPrismaTripFindUnique.mockResolvedValue(null)

        await expect(verifyTripAccess('trip-123'))
            .rejects.toThrow("Trip not found")
    })

    it('should throw AuthError if user is not the owner', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as any)
        mockPrismaTripFindUnique.mockResolvedValue({ userId: 'user-2', isPublic: false } as any)

        await expect(verifyTripAccess('trip-123'))
            .rejects.toThrow("You do not have permission to modify this trip.")
    })

    it('should return user and trip if access is granted', async () => {
        mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as any)
        mockPrismaTripFindUnique.mockResolvedValue({ userId: 'user-1', isPublic: false } as any)

        const result = await verifyTripAccess('trip-123')

        expect(result.user.id).toBe('user-1')
        expect(result.trip.userId).toBe('user-1')
    })
})
