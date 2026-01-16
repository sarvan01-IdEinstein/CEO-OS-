'use client';
import { Sparkles } from 'lucide-react';

export default function WisdomWidget({ text }: { text: string }) {
    // Parse markdown bold if present
    const parts = text.split('**:');
    const title = parts.length > 1 ? parts[0].replace('**', '') : 'Insight';
    const body = parts.length > 1 ? parts[1] : parts[0];

    return (
        <div className="card bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border border-[var(--border)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={48} />
            </div>
            <div className="relative z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">Serendipity</h3>
                <div className="font-serif">
                    {parts.length > 1 && <span className="font-bold block mb-1">{title}</span>}
                    <p className="italic text-[var(--muted)]">"{body.trim()}"</p>
                </div>
            </div>
        </div>
    );
}
