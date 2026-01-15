import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBooking, updateBooking, deleteBooking } from '@/actions/booking-actions'
import prisma from '@/lib/prisma'
import { verifyTripAccess, verifyBookingAccess } from '@/lib/auth-utils'

// Mocks
vi.mock('@/lib/auth-utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/auth-utils')>()
    return {
        ...actual,
        verifyTripAccess: vi.fn(),
        verifyBookingAccess: vi.fn(),
    }
})
const mockVerifyTripAccess = vi.mocked(verifyTripAccess)
const mockVerifyBookingAccess = vi.mocked(verifyBookingAccess)

const mockPrismaBookingCreate = vi.mocked(prisma.booking.create)
const mockPrismaBookingUpdate = vi.mocked(prisma.booking.update)
const mockPrismaBookingDelete = vi.mocked(prisma.booking.delete)

describe('Booking Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createBooking', () => {
        it('should call verifyTripAccess and create booking', async () => {
            mockVerifyTripAccess.mockResolvedValue({ user: { id: 'u1' }, trip: { userId: 'u1' } as any })
            mockPrismaBookingCreate.mockResolvedValue({ id: 'b1' } as any)

            const res = await createBooking('t1', { type: 'FLIGHT', title: 'Flight to Rome', details: 'AZ123' })

            expect(mockVerifyTripAccess).toHaveBeenCalledWith('t1')
            expect(mockPrismaBookingCreate).toHaveBeenCalledWith({
                data: {
                    tripId: 't1',
                    type: 'FLIGHT',
                    title: 'Flight to Rome',
                    details: 'AZ123'
                }
            })
            expect(res).toEqual({ success: true })
        })

        it('should fail if access denied', async () => {
            mockVerifyTripAccess.mockRejectedValue(new Error('Unauthorized'))
            const res = await createBooking('t1', { type: 'FLIGHT', title: 'F', details: 'D' })
            expect(res).toEqual({ error: 'Failed to create booking' }) // Assuming generic error catch
        })
    })

    describe('updateBooking', () => {
        it('should call verifyBookingAccess and update booking', async () => {
            mockVerifyBookingAccess.mockResolvedValue({ user: { id: 'u1' }, booking: { id: 'b1', trip: { userId: 'u1' } } as any })
            mockPrismaBookingUpdate.mockResolvedValue({ id: 'b1', tripId: 't1' } as any)

            const res = await updateBooking('b1', { title: 'Updated Flight' } as any)

            expect(mockVerifyBookingAccess).toHaveBeenCalledWith('b1')
            expect(mockPrismaBookingUpdate).toHaveBeenCalledWith({
                where: { id: 'b1' },
                data: { title: 'Updated Flight' }
            })
            expect(res).toEqual({ success: true })
        })
    })

    describe('deleteBooking', () => {
        it('should call verifyBookingAccess and delete booking', async () => {
            mockVerifyBookingAccess.mockResolvedValue({ user: { id: 'u1' }, booking: { id: 'b1', trip: { userId: 'u1' } } as any })
            mockPrismaBookingDelete.mockResolvedValue({ id: 'b1', tripId: 't1' } as any)

            const res = await deleteBooking('b1')

            expect(mockVerifyBookingAccess).toHaveBeenCalledWith('b1')
            expect(mockPrismaBookingDelete).toHaveBeenCalledWith({ where: { id: 'b1' } })
            expect(res).toEqual({ success: true })
        })
    })
})
