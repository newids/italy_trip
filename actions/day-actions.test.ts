import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateDay, createActivity, updateActivity, deleteActivity } from '@/actions/day-actions'
import prisma from '@/lib/prisma'
import { verifyDayAccess, verifyActivityAccess } from '@/lib/auth-utils'

// Mocks
vi.mock('@/lib/auth-utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/auth-utils')>()
    return {
        ...actual,
        verifyDayAccess: vi.fn(),
        verifyActivityAccess: vi.fn(),
    }
})
const mockVerifyDayAccess = vi.mocked(verifyDayAccess)
const mockVerifyActivityAccess = vi.mocked(verifyActivityAccess)

const mockPrismaDayUpdate = vi.mocked(prisma.day.update)
const mockPrismaActivityCreate = vi.mocked(prisma.activity.create)
const mockPrismaActivityUpdate = vi.mocked(prisma.activity.update)
const mockPrismaActivityDelete = vi.mocked(prisma.activity.delete)
const mockPrismaActivityUpdateMany = vi.mocked(prisma.activity.updateMany)

describe('Day & Activity Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('updateDay', () => {
        it('should call verifyDayAccess and update day', async () => {
            mockVerifyDayAccess.mockResolvedValue({ user: { id: 'u1' }, day: { id: 'd1', trip: { userId: 'u1' } } } as any)
            mockPrismaDayUpdate.mockResolvedValue({ id: 'd1' } as any)

            const res = await updateDay('d1', { title: 'New Day Title' } as any)

            expect(mockVerifyDayAccess).toHaveBeenCalledWith('d1')
            expect(mockPrismaDayUpdate).toHaveBeenCalledWith({
                where: { id: 'd1' },
                data: { title: 'New Day Title' }
            })
            expect(res).toEqual({ success: true, data: { id: 'd1' } })
        })
    })

    describe('createActivity', () => {
        it('should call verifyDayAccess, shift order, and create activity', async () => {
            mockVerifyDayAccess.mockResolvedValue({ user: { id: 'u1' }, day: { id: 'd1' } } as any)
            mockPrismaActivityCreate.mockResolvedValue({ id: 'a1' } as any)

            const res = await createActivity('d1', { type: 'SIGHTSEEING', description: 'Colosseum', order: 1 })

            expect(mockVerifyDayAccess).toHaveBeenCalledWith('d1')
            // Verify reordering
            expect(mockPrismaActivityUpdateMany).toHaveBeenCalledWith({
                where: { dayId: 'd1', order: { gte: 1 } },
                data: { order: { increment: 1 } }
            })

            expect(mockPrismaActivityCreate).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    dayId: 'd1',
                    type: 'SIGHTSEEING',
                    description: 'Colosseum',
                    order: 1
                })
            })
            expect(res).toEqual({ success: true, data: { id: 'a1' } })
        })
    })

    describe('updateActivity', () => {
        it('should call verifyActivityAccess and update activity', async () => {
            mockVerifyActivityAccess.mockResolvedValue({ user: { id: 'u1' }, activity: { id: 'a1' } } as any)
            mockPrismaActivityUpdate.mockResolvedValue({ id: 'a1', dayId: 'd1' } as any)

            const res = await updateActivity('a1', { description: 'Updated Desc' } as any)

            expect(mockVerifyActivityAccess).toHaveBeenCalledWith('a1')
            expect(mockPrismaActivityUpdate).toHaveBeenCalledWith({
                where: { id: 'a1' },
                data: { description: 'Updated Desc' }
            })
            expect(res).toEqual({ success: true, data: { id: 'a1', dayId: 'd1' } })
        })
    })

    describe('deleteActivity', () => {
        it('should call verifyActivityAccess and delete activity', async () => {
            mockVerifyActivityAccess.mockResolvedValue({ user: { id: 'u1' }, activity: { id: 'a1' } } as any)
            mockPrismaActivityDelete.mockResolvedValue({ id: 'a1', dayId: 'd1' } as any)

            const res = await deleteActivity('a1')

            expect(mockVerifyActivityAccess).toHaveBeenCalledWith('a1')
            expect(mockPrismaActivityDelete).toHaveBeenCalledWith({ where: { id: 'a1' } })
            expect(res).toEqual({ success: true })
        })
    })
})
