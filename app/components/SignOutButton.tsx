'use client';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <button
            onClick={handleSignOut}
            className="w-full mt-auto flex items-center gap-3 px-3 py-2 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--glass-surface)] rounded-lg transition-all text-sm font-medium"
        >
            <LogOut size={16} />
            Sign Out
        </button>
    )
}
