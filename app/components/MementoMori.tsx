'use client';
import { useState, useEffect } from 'react';
import { differenceInWeeks, parse, addYears, format } from 'date-fns';
import { Settings, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function MementoMori() {
    const [dob, setDob] = useState('');
    const [expectancy, setExpectancy] = useState(90);
    const [isConfigured, setIsConfigured] = useState(false);
    const [stats, setStats] = useState({ lived: 0, remaining: 0, total: 0 });
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const savedDob = localStorage.getItem('ceo_dob');
        const savedExp = localStorage.getItem('ceo_expectancy');

        if (savedDob) {
            setDob(savedDob);
            if (savedExp) setExpectancy(parseInt(savedExp));
            calculate(savedDob, savedExp ? parseInt(savedExp) : 90);
            setIsConfigured(true);
        } else {
            // Default setup mode
        }
    }, []);

    const calculate = (birthDate: string, lifeExp: number) => {
        const start = new Date(birthDate);
        const end = addYears(start, lifeExp);
        const now = new Date();

        const totalWeeks = differenceInWeeks(end, start);
        const livedWeeks = differenceInWeeks(now, start);

        setStats({
            lived: livedWeeks,
            remaining: totalWeeks - livedWeeks,
            total: totalWeeks
        });
    };

    const handleSave = () => {
        if (!dob) return;
        localStorage.setItem('ceo_dob', dob);
        localStorage.setItem('ceo_expectancy', expectancy.toString());
        calculate(dob, expectancy);
        setIsConfigured(true);
        setShowSettings(false);
    };

    if (!isConfigured || showSettings) {
        return (
            <div className="glass-card p-8 text-center relative">
                {isConfigured && (
                    <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-xs opacity-50 hover:opacity-100 uppercase font-bold">Cancel</button>
                )}
                <h3 className="font-serif font-bold text-xl mb-6">Memento Mori Setup</h3>
                <div className="space-y-4 max-w-xs mx-auto">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Date of Birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={e => setDob(e.target.value)}
                            className="w-full text-center p-3 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] outline-none focus:border-[var(--accent)]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Target Age</label>
                        <input
                            type="number"
                            value={expectancy}
                            onChange={e => setExpectancy(parseInt(e.target.value))}
                            className="w-full text-center p-3 rounded-lg bg-[var(--bg-app)] border border-[var(--border)] outline-none focus:border-[var(--accent)]"
                        />
                    </div>
                    <button onClick={handleSave} className="btn w-full mt-4">Initialize System</button>
                </div>
            </div>
        )
    }

    const percentage = Math.round((stats.lived / stats.total) * 100);

    return (
        <div className="glass-card relative group">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="font-serif font-bold text-lg">Life Usage</h3>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold mt-1">
                        {stats.remaining.toLocaleString()} Weeks Remaining
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-mono font-bold">{percentage}%</span>
                    <span className="text-xs text-[var(--muted)] ml-1">Lived</span>
                </div>

                <Link
                    href="/frameworks/life_usage"
                    className="absolute top-6 right-16 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity btn-glass p-2"
                    title="Open Life Usage Timeline"
                >
                    <ArrowUpRight size={14} />
                </Link>
                <button
                    onClick={() => setShowSettings(true)}
                    className="absolute top-6 right-6 opacity-0 group-hover:opacity-20 hover:!opacity-100 transition-opacity"
                >
                    <Settings size={14} />
                </button>
            </div>

            {/* Visual Grid: Each dot is ~1 year (52 weeks) to fit nicely, or we abstract it */}
            <div className="flex flex-wrap gap-1">
                {/* Rendering thousands of dots is heavy. Let's render blocks representing 1 Year (52 weeks) */}
                {Array.from({ length: expectancy }).map((_, i) => {
                    const isLived = i < (stats.lived / 52);
                    return (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${isLived ? 'bg-[var(--fg)] opacity-80' : 'bg-[var(--border)]'
                                }`}
                            style={{ minWidth: '4px' }}
                            title={`Year ${i + 1}`}
                        />
                    )
                })}
            </div>

            <p className="text-center text-[10px] text-[var(--muted)] mt-4 uppercase tracking-widest opacity-50">
                You have lived {Math.floor(stats.lived / 52)} years
            </p>
        </div>
    );
}
