'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            alert('Error creating magic link: ' + error.message);
        } else {
            setSubmitted(true);
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[var(--bg)] p-6 animate-fade-in">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold">Check your email</h1>
                    <p className="text-[var(--muted)] text-lg">
                        We sent a magic link to <span className="text-[var(--fg)] font-medium">{email}</span>.
                        <br />Click it to log in.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-sm text-[var(--accent)] hover:underline mt-8"
                    >
                        Try a different email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[var(--bg)] p-6">
            <div className="max-w-md w-full space-y-8 animate-fade-in">

                {/* Brand */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">CEO Personal OS</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-[var(--muted)]">Enter your email to access your personal operating system.</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] pl-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted)]/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--fg)] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                <span>Send Magic Link</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-8">
                    <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--fg)] flex items-center justify-center gap-2">
                        <ArrowLeft size={14} />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
