import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateTrip, toggleTripVisibility, getPublicTrips } from '@/actions/trip-actions'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { verifyTripAccess } from '@/lib/auth-utils'

// Mocks
vi.mock('@/lib/auth-utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/auth-utils')>()
    return {
        ...actual,
        verifyTripAccess: vi.fn(),
    }
})
const mockVerifyTripAccess = vi.mocked(verifyTripAccess)
const mockPrismaTripUpdate = vi.mocked(prisma.trip.update)
const mockPrismaTripFindMany = vi.mocked(prisma.trip.findMany)

const mockAuth = vi.mocked(auth)

describe('Trip Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('updateTrip', () => {
        it('should call verifyTripAccess and update trip', async () => {
            mockVerifyTripAccess.mockResolvedValue({ user: { id: 'u1' }, trip: { userId: 'u1' } as any })
            mockPrismaTripUpdate.mockResolvedValue({} as any)

            const res = await updateTrip('t1', { title: 'New Title' })

            expect(mockVerifyTripAccess).toHaveBeenCalledWith('t1')
            expect(mockPrismaTripUpdate).toHaveBeenCalledWith({
                where: { id: 't1' },
                data: { title: 'New Title' }
            })
            expect(res).toEqual({ success: true })
        })

        it('should return error if verifyTripAccess fails', async () => {
            mockVerifyTripAccess.mockRejectedValue(new Error('Unauthorized'))

            const res = await updateTrip('t1', {})
            expect(res).toEqual({ error: 'Unauthorized' })
        })
    })

    describe('toggleTripVisibility', () => {
        it('should toggle isPublic flag', async () => {
            // Mock that current state is private
            mockVerifyTripAccess.mockResolvedValue({
                user: { id: 'u1' },
                trip: { userId: 'u1', isPublic: false } as any
            })

            // Mock update result (toggled to true)
            mockPrismaTripUpdate.mockResolvedValue({ isPublic: true } as any)

            const res = await toggleTripVisibility('t1')

            expect(mockPrismaTripUpdate).toHaveBeenCalledWith({
                where: { id: 't1' },
                data: { isPublic: true } // !false
            })
            expect(res).toEqual({ success: true, isPublic: true })
        })
    })

    describe('getPublicTrips', () => {
        it('should fetch public trips with correct query', async () => {
            mockPrismaTripFindMany.mockResolvedValue([{ id: 't1' }] as any)

            const res = await getPublicTrips()

            expect(mockPrismaTripFindMany).toHaveBeenCalledWith({
                where: { isPublic: true },
                orderBy: { updatedAt: 'desc' },
                take: 20,
                include: expect.any(Object)
            })
            expect(res).toEqual({ data: [{ id: 't1' }] })
        })
    })
})
