'use client';

import { useState } from 'react';
import { Users, LayoutGrid, Briefcase, Activity, Heart, Home, DollarSign, Megaphone, Box, Globe, Shield } from 'lucide-react';

interface Domain {
    id: string;
    name: string;
    pulse: 'high' | 'medium' | 'low';
    note?: string;
    icon?: any;
}

const lifeDomains: Domain[] = [
    { id: '1', name: 'Empire', pulse: 'medium', note: 'Business Portfolio', icon: Briefcase },
    { id: '2', name: 'Tribe', pulse: 'high', note: 'Family & Friends', icon: Home },
    { id: '3', name: 'Vitality', pulse: 'low', note: 'Health & Energy', icon: Activity },
    { id: '4', name: 'Ops', pulse: 'medium', note: 'Life Admin', icon: Shield },
];

const soloDomains: Domain[] = [
    { id: 's1', name: 'Revenue', pulse: 'high', note: 'Cash / Runway', icon: DollarSign },
    { id: 's2', name: 'Audience', pulse: 'medium', note: 'Growth / Reach', icon: Megaphone },
    { id: 's3', name: 'Product', pulse: 'high', note: 'Delivery / Value', icon: Box },
    { id: 's4', name: 'Brand', pulse: 'medium', note: 'Reputation', icon: Globe },
];

export default function DomainsWidget() {
    const [mode, setMode] = useState<'life' | 'solo'>('life');
    const [domains, setDomains] = useState({ life: lifeDomains, solo: soloDomains });
    const [editMode, setEditMode] = useState(false);

    const currentList = domains[mode];

    const getPulseColor = (pulse: string) => {
        switch (pulse) {
            case 'high': return 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700';
            case 'low': return 'bg-rose-100 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700';
            default: return 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700';
        }
    };

    const cyclePulse = (id: string) => {
        if (!editMode) return;
        const newDomains = { ...domains };
        const list = newDomains[mode];
        const idx = list.findIndex(d => d.id === id);
        if (idx === -1) return;

        const pulses: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
        const currentPulseIdx = pulses.indexOf(list[idx].pulse);
        list[idx].pulse = pulses[(currentPulseIdx + 1) % 3];

        setDomains(newDomains);
    };

    return (
        <div className="glass-card transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMode('life')}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${mode === 'life' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface-2)] text-[var(--muted)]'}`}
                    >
                        <LayoutGrid size={14} /> Life
                    </button>
                    <button
                        onClick={() => setMode('solo')}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${mode === 'solo' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface-2)] text-[var(--muted)]'}`}
                    >
                        <Briefcase size={14} /> Biz
                    </button>
                </div>

                <button
                    onClick={() => setEditMode(!editMode)}
                    className={`text-xs text-[var(--muted)] hover:text-[var(--fg)] underline decoration-dotted`}
                >
                    {editMode ? 'Done' : 'Update'}
                </button>
            </div>

            <div className="space-y-2">
                {currentList.map(domain => {
                    const Icon = domain.icon || Users;
                    return (
                        <div
                            key={domain.id}
                            onClick={() => cyclePulse(domain.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${getPulseColor(domain.pulse)} ${editMode ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full bg-white/50 dark:bg-black/20`}>
                                    <Icon size={16} className="text-[var(--fg)] opacity-80" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{domain.name}</div>
                                    <div className="text-[10px] text-gray-600 dark:text-gray-300 opacity-80 uppercase tracking-wider">{domain.note}</div>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${domain.pulse === 'high' ? 'bg-emerald-600 text-white' :
                                    domain.pulse === 'low' ? 'bg-rose-600 text-white' :
                                        'bg-amber-500 text-white'
                                }`}>
                                {domain.pulse}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
