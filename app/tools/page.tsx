'use client';
import Link from 'next/link';
import { Target, Skull, Grid3X3, Lightbulb, ArrowRight } from 'lucide-react';

const tools = [
    {
        id: 'decision',
        name: 'Decision Razor',
        desc: 'Cut through complexity with mental models',
        icon: Target,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        ready: true
    },
    {
        id: 'premortem',
        name: 'Pre-Mortem',
        desc: 'Identify risks before they happen',
        icon: Skull,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        ready: true
    },
    {
        id: 'matrix',
        name: 'Eisenhower Matrix',
        desc: 'Prioritize by urgency and importance',
        icon: Grid3X3,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        ready: true
    },
    {
        id: 'first-principles',
        name: 'First Principles',
        desc: 'Break problems to fundamentals',
        icon: Lightbulb,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        ready: true
    }
];

export default function ToolsHub() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-serif font-bold">Thinking Tools</h1>
                <p className="text-[var(--muted)] max-w-xl mx-auto">
                    Structured frameworks to cut through complexity. Each tool guides you through a proven mental model.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {tools.map(tool => (
                    <Link
                        key={tool.id}
                        href={tool.ready ? `/tools/${tool.id}` : '#'}
                        className={`glass-card group hover:border-[var(--accent)] transition-all relative overflow-hidden ${!tool.ready ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${tool.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-4`}>
                                <tool.icon className={tool.color} size={24} />
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--accent)] transition-colors">
                                {tool.name}
                            </h3>
                            <p className="text-[var(--muted)] text-sm mb-4">{tool.desc}</p>

                            {tool.ready ? (
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-2">
                                    Launch Tool <ArrowRight size={12} />
                                </span>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                                    Coming Soon
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
