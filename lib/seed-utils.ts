
import prisma from "@/lib/prisma"

export async function seedDefaultTrip(userId: string) {
    const tripTitle = "🇮🇹 이탈리아 로맨틱 여행"
    const subtitle = "9일간의 이탈리아 로맨스 & 모험"
    const startDate = new Date(2026, 2, 25) // March 25, 2026
    const endDate = new Date(2026, 3, 2)    // April 2, 2026
    const description = "아름다운 이탈리아의 주요 도시를 방문하며 역사, 문화,そして 맛있는 음식을 즐기는 9일간의 여행입니다."

    const trip = await prisma.trip.create({
        data: {
            userId: userId,
            title: tripTitle,
            subtitle: subtitle,
            startDate: startDate,
            endDate: endDate,
            description: description,
            features: JSON.stringify(['Romantic', 'History', 'Food']),
            isPublic: true,
        }
    })

    // Bookings
    const bookingsData = [
        { title: "✈ 항공편", type: "FLIGHT", details: "항공사: 대한항공 / 아시아나\n출발: 인천 (ICN) -> 로마 (FCO)\n도착: 밀라노 (MXP) -> 인천 (ICN)" },
        { title: "🚆 기차 이동", type: "TRAIN", details: "이탈리아 고속열차 (Italo/Trenitalia)\n로마 -> 피렌체 -> 베니스 -> 밀라노" },
        { title: "🎟 투어 예약", type: "TOUR", details: "바티칸 박물관 & 성 베드로 대성당 투어\n우피치 미술관 가이드 투어\n베니스 곤돌라 체험" }
    ]

    for (const b of bookingsData) {
        await prisma.booking.create({
            data: {
                tripId: trip.id,
                title: b.title,
                type: b.type,
                details: b.details
            }
        })
    }

    // Days Data
    const daysData = [
        {
            day: 1, date: new Date(2026, 2, 25), title: "도착일", city: "Roma (Rome)", transport: "Leonardo Express",
            activities: ["로마 피우미치노 공항 도착", "호텔 체크인 및 휴식", "스페인 광장 & 트레비 분수 야경 산책", "저녁 식사: 정통 까르보나라"],
            hotel: { name: "Hotel Artemide", note: "로마 중심부, 4박" }
        },

        {
            day: 2, date: new Date(2026, 2, 26), title: "고대 로마 탐방", city: "Roma (Rome)", transport: "도보 / 지하철",
            activities: ["콜로세움 (Colosseum) 내부 관람", "포로 로마노 (Roman Forum)", "팔라티노 언덕", "베네치아 광장", "판테온 (Pantheon)"],
            highlight: { type: "TIP", content: "콜로세움 통합권 미리 예약 필수!" }
        },

        {
            day: 3, date: new Date(2026, 2, 27), title: "바티칸 투어", city: "Vatican City", transport: "지하철 A선 (Ottaviano역)",
            activities: ["바티칸 박물관 (Vatican Museums)", "시스티나 성당 (천지창조)", "성 베드로 대성당 & 광장", "천사의 성 (Castel Sant'Angelo)"],
            highlight: { type: "HIGHLIGHT", content: "성 베드로 대성당 쿠폴라에서 보는 로마 전경" }
        },

        {
            day: 4, date: new Date(2026, 2, 28), title: "로마 시내 & 쇼핑", city: "Roma (Rome)", transport: "도보",
            activities: ["진실의 입 (Mouth of Truth)", "나보나 광장 (Piazza Navona)", "비아 델 코르소 (Via del Corso) 쇼핑", "티라미수 맛집 탐방 (Pompi)"]
        },

        {
            day: 5, date: new Date(2026, 2, 29), title: "피렌체로 이동", city: "Firenze (Florence)", transport: "고속열차 (1시간 30분)",
            activities: ["로마 -> 피렌체 기차 이동", "두오모 성당 (Duomo) 외관 감상", "피렌체 가죽 시장 구경", "미켈란젤로 언덕에서 노을 감상"],
            hotel: { name: "Grand Hotel Baglioni", note: "피렌체역 인근, 2박" },
            highlight: { type: "TIP", content: "미켈란젤로 언덕은 해질녘에 가세요." }
        },

        {
            day: 6, date: new Date(2026, 2, 30), title: "르네상스의 중심", city: "Firenze (Florence)", transport: "도보",
            activities: ["우피치 미술관 (Uffizi Gallery)", "베키오 다리 (Ponte Vecchio)", "시뇨리아 광장", "티본 스테이크 저녁 식사"]
        },

        {
            day: 7, date: new Date(2026, 2, 31), title: "베니스로 이동", city: "Venezia (Venice)", transport: "고속열차 (2시간)",
            activities: ["피렌체 -> 베니스 기차 이동", "수상 버스(바포레토) 타고 리알토 다리 이동", "산 마르코 광장 & 성당", "곤돌라 체험"],
            hotel: { name: "Hotel Danieli", note: "본섬, 1박" }
        },

        {
            day: 8, date: new Date(2026, 3, 1), title: "밀라노 & 최후의 만찬", city: "Milano (Milan)", transport: "고속열차 (2시간 30분)",
            activities: ["베니스 -> 밀라노 기차 이동", "밀라노 대성당 (Duomo di Milano)", "갤러리아 비토리오 에마누엘레 II", "최후의 만찬 관람 (사전 예약 필수)"],
            hotel: { name: "Hyatt Centric Milan", note: "밀라노 중앙역 인근, 1박" }
        },

        {
            day: 9, date: new Date(2026, 3, 2), title: "여행 마무리", city: "Milano -> Incheon", transport: "공항 셔틀 / 택시",
            activities: ["호텔 조식 후 체크아웃", "밀라노 말펜사 공항(MXP)으로 이동", "출국 수속 및 면세점 쇼핑", "인천행 항공편 탑승"]
        }
    ]

    for (const d of daysData) {
        const day = await prisma.day.create({
            data: {
                tripId: trip.id,
                dayNumber: d.day,
                date: d.date,
                title: d.title,
                city: d.city,
                transport: d.transport
            }
        })

        // Activities
        for (let i = 0; i < d.activities.length; i++) {
            await prisma.activity.create({
                data: {
                    dayId: day.id,
                    order: i + 1,
                    description: `✈ ${d.activities[i]}`, // Add legacy icon style
                    type: 'SIGHTSEEING'
                }
            })
        }

        // Accommodation
        if ('hotel' in d && d.hotel) {
            await prisma.accommodation.create({
                data: {
                    dayId: day.id,
                    name: d.hotel.name,
                    note: d.hotel.note
                }
            })
        }

        // Highlight
        if ('highlight' in d && d.highlight) {
            await prisma.highlight.create({
                data: {
                    dayId: day.id,
                    type: d.highlight.type,
                    content: d.highlight.content
                }
            })
        }
    }

    return trip
}
