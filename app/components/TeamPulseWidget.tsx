'use client';

import { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Edit3 } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    pulse: 'high' | 'medium' | 'low';
    note?: string;
}

const defaultTeam: TeamMember[] = [
    { id: '1', name: 'Marketing', role: 'Team', pulse: 'high', note: 'Product launch going well' },
    { id: '2', name: 'Engineering', role: 'Team', pulse: 'medium', note: 'Sprint on track' },
    { id: '3', name: 'Sales', role: 'Team', pulse: 'high', note: 'Q1 targets exceeded' },
    { id: '4', name: 'Operations', role: 'Team', pulse: 'medium', note: 'Capacity planning needed' },
];

export default function TeamPulseWidget() {
    const [team, setTeam] = useState<TeamMember[]>(defaultTeam);
    const [editMode, setEditMode] = useState(false);

    const getPulseIcon = (pulse: string) => {
        switch (pulse) {
            case 'high': return <TrendingUp size={16} className="text-emerald-700 dark:text-emerald-400" />;
            case 'low': return <TrendingDown size={16} className="text-rose-700 dark:text-rose-400" />;
            default: return <Minus size={16} className="text-amber-700 dark:text-amber-400" />;
        }
    };

    const getPulseColor = (pulse: string) => {
        switch (pulse) {
            case 'high': return 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700';
            case 'low': return 'bg-rose-100 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700';
            default: return 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700';
        }
    };

    const cyclePulse = (id: string) => {
        if (!editMode) return;
        setTeam(team.map(m => {
            if (m.id === id) {
                const pulses: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
                const currentIndex = pulses.indexOf(m.pulse);
                return { ...m, pulse: pulses[(currentIndex + 1) % 3] };
            }
            return m;
        }));
    };

    const overallPulse = () => {
        const scores = team.map(t => t.pulse === 'high' ? 3 : t.pulse === 'medium' ? 2 : 1);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= 2.5) return { label: 'Strong', color: 'text-emerald-700 dark:text-emerald-400', icon: <CheckCircle2 size={16} /> };
        if (avg >= 1.5) return { label: 'Steady', color: 'text-amber-700 dark:text-amber-400', icon: <AlertCircle size={16} /> };
        return { label: 'Attention', color: 'text-rose-700 dark:text-rose-400', icon: <AlertCircle size={16} /> };
    };

    const overall = overallPulse();

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-[var(--fg)]">
                    <Users size={18} className="text-[var(--accent)]" />
                    Team Pulse
                </h3>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${overall.color}`}>
                        {overall.icon} {overall.label}
                    </span>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`p-1.5 rounded-lg transition-colors ${editMode ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--accent)]/10 text-[var(--muted)]'}`}
                        title={editMode ? 'Done editing' : 'Edit pulse'}
                    >
                        <Edit3 size={14} />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {team.map(member => (
                    <div
                        key={member.id}
                        onClick={() => cyclePulse(member.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${getPulseColor(member.pulse)} ${editMode ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            {getPulseIcon(member.pulse)}
                            <div>
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">{member.name}</div>
                                {member.note && (
                                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[150px]">{member.note}</div>
                                )}
                            </div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${member.pulse === 'high' ? 'bg-emerald-600 text-white' :
                            member.pulse === 'low' ? 'bg-rose-600 text-white' :
                                'bg-amber-500 text-white'
                            }`}>
                            {member.pulse.charAt(0).toUpperCase() + member.pulse.slice(1)}
                        </span>
                    </div>
                ))}
            </div>

            {editMode && (
                <p className="text-xs text-[var(--muted)] mt-3 text-center">
                    Click team to cycle pulse status
                </p>
            )}
        </div>
    );
}
