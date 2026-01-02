
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function SlideView({ days, locale }: { days: any[], locale: string }) {
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % days.length)
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + days.length) % days.length)

    return (
        <div className="relative w-full h-[500px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-12">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-90"></div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-2xl p-8 text-center text-white">
                    <h3 className="text-xl uppercase tracking-widest opacity-80 mb-2">
                        Day {days[currentSlide].dayNumber}
                    </h3>
                    <h2 className="text-4xl font-bold mb-4">{days[currentSlide].title}</h2>
                    <p className="text-lg opacity-90 mb-6">{days[currentSlide].city}</p>

                    <div className="space-y-3 text-left bg-white/10 backdrop-blur-md p-6 rounded-2xl max-h-[250px] overflow-y-auto">
                        {days[currentSlide].activities.map((act: any) => (
                            <div key={act.id} className="flex gap-3">
                                <span className="text-yellow-300">•</span>
                                <span>{act.description}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link href={`/${locale}/days/${days[currentSlide].id}`} className="bg-white text-[#764ba2] px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition">
                            View Details
                        </Link>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white backdrop-blur-md">
                ←
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white backdrop-blur-md">
                →
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {days.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`} />
                ))}
            </div>
        </div>
    )
}
