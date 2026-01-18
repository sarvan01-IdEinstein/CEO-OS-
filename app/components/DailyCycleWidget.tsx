'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Target, Moon, Flag, CheckCircle, ArrowRight } from 'lucide-react';

export default function DailyCycleWidget() {
    const [status, setStatus] = useState<'loading' | 'morning' | 'active' | 'complete'>('loading');
    const [priority, setPriority] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Clock tick
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        // Fetch Status
        fetch('/api/daily-status', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                setStatus(data.status);
                if (data.priority) setPriority(data.priority);
            });

        return () => clearInterval(timer);
    }, []);

    const hours = currentTime.getHours();
    let greeting = 'Good Morning';
    if (hours >= 12) greeting = 'Good Afternoon';
    if (hours >= 17) greeting = 'Good Evening';

    if (status === 'loading') {
        return <div className="glass-card animate-pulse h-48"></div>;
    }

    // STATE 1: MORNING PRIME (No log yet)
    if (status === 'morning') {
        return (
            <div className="glass-card relative overflow-hidden group hover:border-[var(--accent)] transition-colors p-8 flex flex-col justify-center h-[300px]">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sun size={80} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-[var(--muted)] text-sm font-bold uppercase tracking-widest mb-2">{greeting}, CEO</h3>
                    <h2 className="text-3xl font-serif font-bold mb-4">Ready to Prime?</h2>
                    <p className="text-[var(--muted)] mb-6 max-w-sm">
                        "Win the morning, win the day." Initialize your targets and clear the mental cache.
                    </p>
                    <Link href="/prime" className="btn inline-flex items-center gap-2">
                        <Sun size={18} /> Run Morning Prime
                    </Link>
                </div>
            </div>
        )
    }

    // STATE 2: ACTIVE FOCUS (Log exists, but not shutdown)
    if (status === 'active') {
        return (
            <div className="glass-card bg-gradient-to-br from-[var(--glass-surface)] to-[var(--accent)]/10 p-8 flex flex-col justify-between relative overflow-hidden h-[300px]">
                <div className="absolute -right-4 -top-4 opacity-5">
                    <Target size={120} />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent)]">System Active</span>
                    </div>
                    <h2 className="text-xl font-serif font-bold mb-2">Primary Objective</h2>
                    <div className="text-2xl font-mono border-l-4 border-[var(--accent)] pl-4 py-2 my-4">
                        {priority}
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <Link href="/flow" className="btn flex-1 flex justify-center items-center gap-2">
                        <Target size={16} /> Enter Flow
                    </Link>
                    <Link href="/shutdown" className="btn bg-[var(--surface)] text-[var(--fg)] border border-[var(--glass-border)] hover:bg-red-500/5 hover:border-red-500/30 hover:text-red-500 transition-all flex-1 flex justify-center items-center gap-2">
                        <Moon size={16} /> Evening Shutdown
                    </Link>
                </div>
            </div>
        );
    }

    // STATE 3: COMPLETE (Shutdown done)
    return (
        <div className="glass-card flex flex-col justify-center items-center text-center p-8 opacity-90 h-[300px]">
            <div className="mb-4 text-[var(--accent)]">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">System Offline</h2>
            <p className="text-[var(--muted)] max-w-sm mx-auto mb-6">
                Cycle complete. Rest and recover. The mission continues tomorrow.
            </p>
            <div className="text-sm font-mono opacity-50">
                {priority} <span className="text-green-400">✓</span>
            </div>
        </div>
    )
}
