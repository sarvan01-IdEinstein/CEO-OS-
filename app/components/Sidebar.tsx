'use client';
import Link from 'next/link';
import { Home, PenTool, BarChart2, Book, Settings, DollarSign, User, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 glass-panel z-50 flex flex-col justify-between p-6">
            <div>
                <div className="mb-10 px-2 mt-2">
                    <h1 className="text-2xl font-serif font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--muted)]">
                        CEO.OS
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] font-bold mt-1">
                        v2.0 / Glass
                    </p>
                </div>

                <nav className="space-y-2">
                    <NavLink href="/" icon={<Home size={18} />} label="Dashboard" />

                    <p className="px-4 text-[10px] font-bold uppercase text-[var(--muted)] tracking-widest mb-2 mt-6">Core</p>
                    <NavLink href="/reviews" icon={<PenTool size={18} />} label="Reviews" />
                    <NavLink href="/goals" icon={<BarChart2 size={18} />} label="Goals" />
                    <NavLink href="/flow" icon={<Zap size={18} />} label="Deep Work" />

                    <p className="px-4 text-[10px] font-bold uppercase text-[var(--muted)] tracking-widest mb-2 mt-6">Tools</p>
                    <NavLink href="/frameworks/leverage" icon={<Settings size={18} />} label="Leverage Lab" />
                    <NavLink href="/frameworks/calculator" icon={<DollarSign size={18} />} label="Freedom Calc" />
                    <NavLink href="/frameworks/life_map" icon={<User size={18} />} label="Life Map" />
                    <NavLink href="/frameworks/life_usage" icon={<BarChart2 size={18} />} label="Life Usage" />
                    <NavLink href="/frameworks/board" icon={<User size={18} />} label="Board Room" />

                    <p className="px-4 text-[10px] font-bold uppercase text-[var(--muted)] tracking-widest mb-2 mt-6">Intelligence</p>
                    <NavLink href="/tools" icon={<Zap size={18} />} label="Thinking Tools" />
                    <NavLink href="/library" icon={<Book size={18} />} label="Library" />
                </nav>
            </div>

            <div>
                <Link href="/settings" className="flex items-center gap-3 text-sm text-[var(--muted)] px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                    <Settings size={16} />
                    <span>System Settings</span>
                </Link>
            </div>
        </aside>
    );
}

function NavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
            ? 'bg-[var(--fg)] text-[var(--bg-app)] shadow-md'
            : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
