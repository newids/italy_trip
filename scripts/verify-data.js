
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const trip = await prisma.trip.findFirst({
        include: {
            days: {
                include: {
                    activities: true
                }
            },
            bookings: true
        }
    })

    if (!trip) {
        console.log('No trip found!')
        return
    }

    console.log('Trip Title:', trip.title)
    console.log('Bookings:', trip.bookings.length)
    if (trip.bookings.length > 0) {
        console.log('Sample Booking:', trip.bookings[0].title)
    }

    console.log('Days:', trip.days.length)
    if (trip.days.length > 0) {
        console.log('Day 1 Title:', trip.days[0].title)
        console.log('Day 1 Activities:', trip.days[0].activities.length)
        if (trip.days[0].activities.length > 0) {
            console.log('Activity 1:', trip.days[0].activities[0].description)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
