import { useTranslations } from 'next-intl';
import BackButton from '@/components/BackButton';

export default function AboutPage() {
    const t = useTranslations('Index'); // Reusing Index for now or common

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto space-y-8">
            <BackButton label="Dashboard" />
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">About TripTimeTable</h1>
                <p className="text-gray-500 mt-2">Your personal travel companion.</p>
            </header>

            <div className="glass-panel bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Goal</h2>
                    <p className="text-gray-600 leading-relaxed">
                        TripTimeTable is designed to help you organize your travel plans simply and beautifully.
                        Unlike complex travel apps, we focus on what matters: your timeline, your notes, and your memories.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Privacy First</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Your data is stored locally (`dev.db` in this version) and we prioritize your privacy.
                        You can export your database at any time from the Settings page.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Version</h2>
                    <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-mono text-gray-600">
                        v1.0.0
                    </div>
                </section>
            </div>
        </div>
    );
}
