import { getLifeMapScores, getFile } from '@/lib/api';
import LifeMapRadar from '../../components/LifeMapRadar';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';

export default async function LifeMapPage() {
    const scores = await getLifeMapScores();
    const file = await getFile('frameworks/life_map.md');

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header - stacks on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Link href="/" className="text-[var(--muted)] hover:text-[var(--fg)] flex items-center gap-2 mb-2"><ArrowLeft size={16} /> Back</Link>
                    <h1 className="text-2xl sm:text-4xl font-serif font-bold">The Life Map</h1>
                    <p className="text-[var(--muted)] text-sm sm:text-base">Annual balance check across the 6 core domains.</p>
                </div>
                <Link href={`/library/file?path=${encodeURIComponent('frameworks/life_map.md')}`} className="btn gap-2 self-start sm:self-auto text-sm">
                    <Edit2 size={16} /> Edit Scores
                </Link>
            </div>

            {/* Main content - stacks on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="glass-card flex items-center justify-center p-4 sm:p-8 bg-[var(--surface)]">
                    <div className="w-full max-w-md">
                        <LifeMapRadar scores={scores} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h3 className="font-bold uppercase text-xs text-[var(--muted)] mb-4">Current Assessment</h3>
                        <div className="space-y-4">
                            {Object.entries(scores).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-4">
                                    <span className="w-20 sm:w-24 capitalize text-sm font-medium">{key}</span>
                                    <div className="flex-1 h-2 bg-[var(--bg-app)] rounded-full overflow-hidden">
                                        <div className="h-full bg-[var(--accent)]" style={{ width: `${(val / 10) * 100}%` }}></div>
                                    </div>
                                    <span className="font-mono text-sm">{val}/10</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-6 rounded-xl border border-[var(--glass-border)] text-sm opacity-80 italic">
                        "Success without fulfillment is the ultimate failure." — Tony Robbins
                    </div>
                </div>
            </div>
        </div>
    )
}
