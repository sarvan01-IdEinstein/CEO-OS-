'use client';
import Link from 'next/link';
import { Home, PenTool, BarChart2, Book, Settings, DollarSign, User, Zap, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SignOutButton from './SignOutButton';
import { useSidebar } from './SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
    const { isOpen, toggle, close } = useSidebar();
    const pathname = usePathname();

    // Close sidebar on navigation (mobile)
    const handleNavClick = () => {
        if (window.innerWidth < 1024) {
            close();
        }
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={toggle}
                className="fixed top-4 left-4 z-[60] lg:hidden p-3 rounded-xl glass border border-[var(--glass-border)] hover:bg-[var(--accent)]/10 transition-colors"
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-full w-64 glass-panel z-50 flex flex-col p-6
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="shrink-0 mb-6 px-2 mt-2">
                    <h1 className="text-2xl font-serif font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--muted)]">
                        CEO.OS
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] font-bold mt-1">
                        v2.0 / Glass
                    </p>
                </div>

                <nav className="flex-1 overflow-y-auto space-y-2 pr-1">
                    <NavLink href="/" icon={<Home size={18} />} label="Dashboard" onClick={handleNavClick} />

                    <p className="px-4 text-[10px] font-bold uppercase text-[var(--muted)] tracking-widest mb-2 mt-6">Core</p>
                    <NavLink href="/reviews" icon={<PenTool size={18} />} label="Reviews" onClick={handleNavClick} />
                    <NavLink href="/goals" icon={<BarChart2 size={18} />} label="Goals" onClick={handleNavClick} />
                    <NavLink href="/flow" icon={<Zap size={18} />} label="Deep Work" onClick={handleNavClick} />

                    <p className="px-4 text-[10px] font-bold uppercase text-[var(--muted)] tracking-widest mb-2 mt-6">Tools</p>
                    <NavLink href="/frameworks/leverage" icon={<Settings size={18} />} label="Leverage Lab" onClick={handleNavClick} />
                    <NavLink href="/frameworks/calculator" icon={<DollarSign size={18} />} label="Freedom Calc" onClick={handleNavClick} />
                    <NavLink href="/frameworks/life_map" icon={<User size={18} />} label="Life Map" onClick={handleNavClick} />
                    <NavLink href="/frameworks/life_usage" icon={<BarChart2 size={18} />} label="Life Usage" onClick={handleNavClick} />
                    <NavLink href="/frameworks/board" icon={<User size={18} />} label="Board Room" onClick={handleNavClick} />

                    <p className="px-4 text-[10px] font-bold uppercase text-[var(--muted)] tracking-widest mb-2 mt-6">Intelligence</p>
                    <NavLink href="/tools" icon={<Zap size={18} />} label="Thinking Tools" onClick={handleNavClick} />
                    <NavLink href="/library" icon={<Book size={18} />} label="Library" onClick={handleNavClick} />
                </nav>

                <div className="shrink-0 pt-4 border-t border-[var(--glass-border)] mt-4">
                    <div className="mb-2">
                        <Link href="/settings" onClick={handleNavClick} className="flex items-center gap-3 text-sm text-[var(--muted)] px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                            <Settings size={16} />
                            <span>System Settings</span>
                        </Link>
                    </div>
                    <SignOutButton />
                </div>
            </aside>
        </>
    );
}

interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function NavLink({ href, icon, label, onClick }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} onClick={onClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
            ? 'bg-[var(--fg)] text-[var(--bg-app)] shadow-md'
            : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
