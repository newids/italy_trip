
import { PrismaClient } from '@prisma/client'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  // Helper to sanitize text
  const sanitize = (text: string) => {
    // Remove potential lone surrogates or invalid chars
    return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
      .trim()
  }

  // 1. Create Default User
  const userEmail = 'newid@example.com'
  // Use a placeholder password hash or mechanism. For now, we seed a user.
  // In real auth, this would be hashed.
  // We'll use a hardcoded user for the "Demo" trip.
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: 'Power P User',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PowerP'
    }
  })
  console.log(`Created/Found user: ${user.email}`)

  const htmlPath = path.join(process.cwd(), 'legacy_source', 'index.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')
  const $ = cheerio.load(html)

  console.log('Start seeding...')

  // 2. Create Trip linked to User
  const tripTitle = $('h1').text().trim() || 'Italy Trip' // Clean up emojis later
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      title: sanitize(tripTitle.replace(/🇮🇹\s*/, '')),
      subtitle: $('header p[data-lang="subtitle"]').text().trim(),
      startDate: new Date('2026-03-25'), // Hardcoded based on text
      endDate: new Date('2026-04-02'),
      description: $('.trip-overview p[data-lang="overview-desc"]').text().trim(),
      features: JSON.stringify(['Romantic', 'History', 'Food']),
      isPublic: true,
    },
  })

  console.log(`Created trip: ${trip.title}`)

  // 2. Create Bookings (Overview)
  const bookingCards = $('.booking-card')
  for (const card of bookingCards) {
    let rawTitle = $(card).find('h3').text()
    // Remove specific emojis we know
    const title = sanitize(rawTitle.replace(/^[✈🚄🎫]\s*/, ''))

    // Join details
    const content = $(card).find('p').map((i, el) => $(el).text()).get().join('\n')
    const details = sanitize(content)

    let type = 'OTHER'
    if (title.includes('항공') || title.includes('Flight')) type = 'FLIGHT'
    if (title.includes('기차') || title.includes('Train')) type = 'TRAIN'
    if (title.includes('투어') || title.includes('Tour')) type = 'TOUR'

    console.log(`Creating booking: ${title}`) // Debug
    await prisma.booking.create({
      data: {
        tripId: trip.id,
        title,
        type,
        details,
      },
    })
  }

  // 3. Create Days
  const dayCards = $('.day-card')
  for (const card of dayCards) {
    const dayText = $(card).find('.day-number').text().trim() // "1일차"
    const dayNumber = parseInt(dayText.replace(/[^0-9]/g, ''))
    const dateText = $(card).find('.day-date').text().trim() // "3월 25일 (목)"
    // Parse date: 2026 is year.
    const dateMatch = dateText.match(/(\d+)월 (\d+)일/)
    let date = new Date()
    if (dateMatch) {
      date = new Date(2026, parseInt(dateMatch[1]) - 1, parseInt(dateMatch[2]))
    }

    const title = $(card).find('.activities h3').text().trim()
    const city = $(card).find('.city-badge').text().trim()
    const transport = $(card).find('.transport').text().replace('교통편:', '').trim()

    const day = await prisma.day.create({
      data: {
        tripId: trip.id,
        dayNumber,
        date,
        title,
        city,
        transport,
      },
    })

    // Activities
    const items = $(card).find('.activities ul li')
    for (let i = 0; i < items.length; i++) {
      await prisma.activity.create({
        data: {
          dayId: day.id,
          order: i + 1,
          description: $(items[i]).text().trim(),
          type: 'SIGHTSEEING', // Default
        }
      })
    }

    // Highlights
    const highlightTitle = $(card).find('.highlight h3').text().trim()
    const highlightContent = $(card).find('.highlight p').text().trim()
    if (highlightContent) {
      await prisma.highlight.create({
        data: {
          dayId: day.id,
          type: highlightTitle.includes('팁') ? 'TIP' : 'HIGHLIGHT',
          content: highlightContent
        }
      })
    }

    // Hotel
    const hotelSection = $(card).find('.hotel-info')
    if (hotelSection.length > 0) {
      const hotelName = hotelSection.find('a').text().trim()
      const hotelLink = hotelSection.find('a').attr('href')
      const hotelNote = hotelSection.find('p').last().text().trim()

      await prisma.accommodation.create({
        data: {
          dayId: day.id,
          name: hotelName || 'Hotel',
          link: hotelLink,
          note: hotelNote
        }
      })
    }
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
