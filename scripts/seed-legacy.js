
const { PrismaClient } = require('@prisma/client')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding from legacy_source/index.html...')

    // 1. Create Default User
    // We'll use the same email as before to ensure "Owner" logic works if used later.
    const userEmail = 'newid@example.com'
    const hashedPassword = await bcrypt.hash('1234', 10)

    // Note: We are setting a password here so we can log in.
    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
            password: hashedPassword
        },
        create: {
            email: userEmail,
            name: 'Power P User', // Default name
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PowerP',
            password: hashedPassword
        }
    })
    console.log(`User confirmed: ${user.email}`)

    // 2. Read HTML
    const htmlPath = path.join(process.cwd(), 'legacy_source', 'index.html')
    if (!fs.existsSync(htmlPath)) {
        console.error(`File not found: ${htmlPath}`)
        process.exit(1)
    }
    const html = fs.readFileSync(htmlPath, 'utf-8')
    const $ = cheerio.load(html)

    // 3. Parse Trip Info
    // <h1>🇮🇹 <span data-lang="title">이탈리아 로맨틱 여행</span></h1>
    const rawTitle = $('header h1').text().trim() // "🇮🇹 이탈리아 로맨틱 여행"
    const subtitle = $('header p[data-lang="subtitle"]').text().trim() // "9일간의 이탈리아 로맨스 & 모험"
    const dateText = $('header p').eq(1).text().trim() // "2026년 3월 25일 - 4월 2일"
    const description = $('.trip-overview p[data-lang="overview-desc"]').text().trim()

    // Parse dates
    const year = 2026
    // Simplistic parsing assuming the format in the HTML won't change drastically
    // "3월 25일" -> 3, 25
    const startDate = new Date(year, 2, 25) // Month is 0-indexed: 3월 -> 2
    const endDate = new Date(year, 3, 2)    // 4월 -> 3

    // Clean title? User said "exactly the same". 
    // If the HTML has the flag in the h1 text, we keep it.
    const tripTitle = rawTitle

    // Create Trip
    // Deleting existing trips for this user to avoid duplicates if re-running
    await prisma.trip.deleteMany({ where: { userId: user.id } })

    const trip = await prisma.trip.create({
        data: {
            userId: user.id,
            title: tripTitle,
            subtitle: subtitle,
            startDate: startDate,
            endDate: endDate,
            description: description,
            // features not in HTML explicitly as a list, so we can omit or hardcode defaults
            features: JSON.stringify(['Romantic', 'History', 'Food']),
            isPublic: true,
        }
    })
    console.log(`Created Trip: ${trip.title}`)

    // 4. Parse Bookings
    const bookingCards = $('.booking-card')
    for (let i = 0; i < bookingCards.length; i++) {
        const card = bookingCards[i]
        // <h3>✈ <span data-lang="flights">항공편</span></h3>
        const cardTitle = $(card).find('h3').text().trim()  // "✈ 항공편"

        // Extract details
        // <p><strong data-lang="airline">항공사:</strong> 대한항공 / 아시아나</p>
        // We want to capture the full text of the p lines
        const pTags = $(card).find('p')
        const details = pTags.map((_, el) => $(el).text().trim()).get().join('\n')

        let type = 'OTHER'
        if (cardTitle.includes('항공') || cardTitle.includes('Flights')) type = 'FLIGHT'
        if (cardTitle.includes('기차') || cardTitle.includes('Train')) type = 'TRAIN'
        if (cardTitle.includes('투어') || cardTitle.includes('Tour')) type = 'TOUR'

        await prisma.booking.create({
            data: {
                tripId: trip.id,
                title: cardTitle,
                type: type,
                details: details
            }
        })
    }
    console.log(`Processed ${bookingCards.length} bookings.`)

    // 5. Parse Days
    const dayCards = $('.day-card')
    for (let i = 0; i < dayCards.length; i++) {
        const card = dayCards[i]

        // Day Header
        const dayNumText = $(card).find('.day-number').text().trim() // "1일차"
        const dayNumber = parseInt(dayNumText.replace(/[^0-9]/g, ''))

        const dayDateText = $(card).find('.day-date').text().trim() // "3월 25일 (목)"
        // Parse date for this day
        const dayDateMatch = dayDateText.match(/(\d+)월 (\d+)일/)
        let dayDate = new Date()
        if (dayDateMatch) {
            dayDate = new Date(year, parseInt(dayDateMatch[1]) - 1, parseInt(dayDateMatch[2]))
        }

        const city = $(card).find('.city-badge').text().trim() // "Roma (Rome)"

        // Activities Title is often the "Day Title"
        const dayTitle = $(card).find('.activities h3').text().trim() // "도착일"

        // Transport
        // <div class="transport">🚆 <span ...>교통편:</span> Leonardo Express</div>
        const transportText = $(card).find('.transport').text().trim() // "🚆 교통편: Leonardo Express"
        // We might want to clean "교통편:" or keep it. Let's keep it to be "exactly same" content-wise?
        // Usually "transport" field is clean. Let's clean the label "교통편:" but keep emoji?
        // "🚆 교통편: Leonardo Express" -> "🚆 Leonardo Express" looks better?
        // Let's stick to the text content roughly.
        const transport = transportText.replace('교통편:', '').trim()

        const day = await prisma.day.create({
            data: {
                tripId: trip.id,
                dayNumber: dayNumber,
                date: dayDate,
                title: dayTitle,
                city: city,
                transport: transport
            }
        })

        // Activities
        const listItems = $(card).find('.activities ul li')
        for (let j = 0; j < listItems.length; j++) {
            const li = listItems[j]
            const text = $(li).text().trim()
            // Note: "✈" icon in CSS content (::before) won't be in .text().
            // If the icon is in CSS, we can't easily get it via cheerio unless checking style/class.
            // The CSS says: .activities li:before { content: "✈"; ... }
            // So the text returned is just "Leonardo da Vinci..."
            // The user wants "perfectly exactly the same". 
            // If I want the icon in DB, I should prepend it.
            // CSS rule is generic: `.activities li:before { content: "✈"; ... }`
            // So ALL activities have a plane?
            // Wait, let's look at CSS.
            // .activities li:before { content: "✈"; ... }
            // Yes, it seems ALL list items get a plane icon.
            // So I should prepend "✈ " to the description? 
            // Or relies on the Frontend to add it?
            // Since this is "data", usually we store text. 
            // But if the NEW app doesn't have that CSS, we lose the icon.
            // "generate initial data so it can be output perfectly exactly the same"
            // I will PREPEND "✈ " to ensure it's there.

            const description = `✈ ${text}`

            await prisma.activity.create({
                data: {
                    dayId: day.id,
                    order: j + 1,
                    description: description,
                    type: 'SIGHTSEEING'
                }
            })
        }

        // Highlights / Tips
        const highlightDiv = $(card).find('.highlight')
        if (highlightDiv.length > 0) {
            const hTitle = highlightDiv.find('h3').text().trim() // "💡 팁" or "🌟 하이라이트"
            const hContent = highlightDiv.find('p').text().trim()

            // Determine type
            let hType = 'HIGHLIGHT'
            if (hTitle.includes('팁') || hTitle.includes('Tip')) hType = 'TIP'

            // We store the full title? Or just type? 
            // Schema has `type` and `content`.
            // Maybe we want to preserve the emoji in the content or assume UI handles it?
            // Let's append the title to content or just store content.
            // The previous seed script stored just content.
            // Let's store content. The UI likely renders a "Tip" box.
            await prisma.highlight.create({
                data: {
                    dayId: day.id,
                    type: hType,
                    content: hContent
                }
            })
        }

        // Accommodation
        const hotelDiv = $(card).find('.hotel-info')
        if (hotelDiv.length > 0) {
            // <h4>🏨 <span data-lang="hotel">숙소</span></h4>
            // <p><a ...>Name</a> (Dates)</p>
            const hotelName = hotelDiv.find('a').text().trim()
            const hotelLink = hotelDiv.find('a').attr('href') || ''
            const hotelNote = hotelDiv.find('p').last().text().trim() // "로마 중심부, 4박"

            await prisma.accommodation.create({
                data: {
                    dayId: day.id,
                    name: hotelName,
                    link: hotelLink,
                    note: hotelNote
                }
            })
        }
    }

    console.log(`Processed ${dayCards.length} days.`)
    console.log('Done!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
