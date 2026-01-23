'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function LandingPage({ locale }: { locale: string }) {
    return (
        <div className="min-h-screen bg-white">
            <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">✈️</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            TripTimeTable
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={`/${locale}/login`}>
                            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                                Sign In
                            </Button>
                        </Link>
                        <Link href={`/${locale}/signup`}>
                            <Button variant="primary" className="rounded-full px-6">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-in slide-in-from-bottom-8 fade-in duration-700">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                            Plan your dream trip <br />
                            <span className="text-indigo-600">in minutes.</span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
                            Organize flights, hotels, and activities in one beautiful timeline.
                            Share with friends and discover community trips.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href={`/${locale}/signup`}>
                                <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg rounded-2xl">
                                    Start First Trip
                                </Button>
                            </Link>
                            <Link href={`/${locale}/community`}>
                                <Button variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg rounded-2xl bg-gray-100 border-transparent hover:bg-gray-200 text-gray-700">
                                    Explorer Community
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Feature Preview */}
                    <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <div className="aspect-[16/9] bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-gray-400">
                            {/* Placeholder for screenshot - using emoji for now */}
                            <span className="text-9xl opacity-20">🗺️</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-12">
                        <Feature
                            icon="📅"
                            title="Drag & Drop Planning"
                            desc="Easily reorder activities. Add flights, hotels, and sightseeing spots with a single click."
                        />
                        <Feature
                            icon="🌍"
                            title="Community Sharing"
                            desc="Publish your itinerary to inspire others. Browse public trips for your next adventure."
                        />
                        <Feature
                            icon="📱"
                            title="Mobile First"
                            desc="Access your plans anywhere. Perfect for checking details while you're on the go."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

function Feature({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="text-left p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    )
}
