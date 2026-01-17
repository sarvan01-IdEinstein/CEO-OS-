'use client';

import { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { getOKRs, OKR } from '@/lib/persistence';
import { motion } from 'framer-motion';
import { getCurrentQuarter } from '@/lib/utils/date';

export default function OKRWidget() {
    const [okrs, setOkrs] = useState<OKR[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOKRs().then(data => {
            setOkrs(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="animate-pulse h-32 bg-[var(--surface)] rounded-2xl"></div>;

    // Group KRs under Objectives
    const objectives = okrs.filter(o => o.type === 'OBJECTIVE');
    const keyResults = okrs.filter(o => o.type === 'KEY_RESULT');

    if (objectives.length === 0) {
        return (
            <div className="card flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-[var(--border)]">
                <Target size={48} className="text-[var(--muted)] mb-4" />
                <h3 className="font-bold text-lg">No OKRs Set</h3>
                <p className="text-[var(--muted)] text-sm mb-4">Transform your strategy into measurable goals.</p>
                <a href="/goals" className="btn-primary">Generate from Strategy</a>
            </div>
        );
    }

    return (
        <div className="card space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                    <Target className="text-[var(--accent)]" /> Active OKRs
                </h2>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{getCurrentQuarter()}</div>
            </div>

            <div className="space-y-6">
                {objectives.map(obj => {
                    const myKRs = keyResults.filter(kr => kr.parent_id === obj.id);

                    // simple progress calc (average of KRs or manual)
                    const progress = myKRs.length > 0
                        ? myKRs.reduce((acc, kr) => acc + (kr.current_value / kr.target_value), 0) / myKRs.length * 100
                        : (obj.current_value / obj.target_value) * 100;

                    return (
                        <div key={obj.id} className="space-y-3">
                            {/* Objective Header */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{obj.title}</h3>
                                    <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">
                                        {myKRs.length} Key Results
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold font-mono">{Math.round(progress)}%</div>
                                </div>
                            </div>

                            {/* Overall Progress Bar */}
                            <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    className={`h-full ${progress >= 100 ? 'bg-emerald-500' : progress < 30 ? 'bg-rose-500' : 'bg-[var(--accent)]'}`}
                                />
                            </div>

                            {/* Key Results List (Compact) */}
                            <div className="pl-4 space-y-2 border-l-2 border-[var(--border)]">
                                {myKRs.map(kr => (
                                    <div key={kr.id} className="flex justify-between text-sm group cursor-pointer hover:bg-[var(--surface-2)] p-1 rounded">
                                        <span className="opacity-80">{kr.title}</span>
                                        <span className="font-mono text-[var(--muted)] group-hover:text-[var(--fg)]">
                                            {kr.current_value}/{kr.target_value} {kr.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
