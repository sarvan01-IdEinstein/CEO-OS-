'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Sun, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MorningPrime() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        energy: 5,
        win: '',
        friction: '',
        letGo: '',
        priority: '',
        northStar: ''
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load North Star for context
        fetch('/api/files?type=file&path=north_star.md')
            .then(res => res.json())
            .then(file => {
                if (file.content) setData(d => ({ ...d, northStar: file.content.slice(0, 300) + '...' }));
                setLoading(false);
            });
    }, []);

    const handleNext = () => setStep(s => s + 1);

    const handleSubmit = async () => {
        const today = new Date().toISOString().split('T')[0];
        const content = `# Daily Check-in\n*Date: ${today}*\n\n**Energy Level (1-10):** [${data.energy}]\n\n1. **One Meaningful Win**:\n   - ${data.win}\n\n2. **One Friction Point**:\n   - ${data.friction}\n\n3. **One Thing to Let Go Of**:\n   - ${data.letGo}\n\n4. **The Single Major Priority for Tomorrow**:\n   - ${data.priority}`;

        await fetch('/api/files', {
            method: 'POST',
            body: JSON.stringify({ path: `reviews/daily/${today}.md`, content })
        });

        router.push('/');
    };

    const questions = [
        // Step 0: The Anchor
        (
            <div className="space-y-8 text-center max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <Sun size={64} className="mx-auto text-[var(--accent)] mb-6" />
                    <h1 className="text-4xl font-serif font-bold">Good Morning.</h1>
                    <p className="text-[var(--muted)] mt-2">Let's align your compass.</p>
                </motion.div>

                <div className="card bg-[var(--surface)] text-left p-8 border-l-4 border-[var(--accent)]">
                    <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-bold">Your North Star Compass</h3>
                    <div className="prose prose-sm font-serif opacity-80 whitespace-pre-wrap">{data.northStar}</div>
                </div>

                <button onClick={handleNext} className="btn-primary text-lg px-8 py-4 mt-12">
                    Begin Sequence <ArrowRight className="ml-2" />
                </button>
            </div>
        ),
        // Step 1: Energy & Wins
        (
            <div className="max-w-xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif">1. The State Check</h2>

                <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-4 opacity-70">Energy Level ({data.energy}/10)</label>
                    <input
                        type="range" min="1" max="10"
                        value={data.energy}
                        onChange={e => setData({ ...data, energy: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                    <div className="flex justify-between text-xs text-[var(--muted)] mt-2">
                        <span>Depleted</span>
                        <span>Unstoppable</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-70">One Real Win (Yesterday)</label>
                    <textarea
                        autoFocus
                        className="w-full p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none min-h-[100px]"
                        placeholder="Small or big, what went right?"
                        value={data.win}
                        onChange={e => setData({ ...data, win: e.target.value })}
                    />
                </div>

                <div className="flex justify-end">
                    <button onClick={handleNext} className="btn">Next <ArrowRight size={16} className="ml-2" /></button>
                </div>
            </div>
        ),
        // Step 2: The Clearing
        (
            <div className="max-w-xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif">2. Clear the Vessel</h2>

                <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-70">One Friction Point</label>
                    <input
                        className="w-full p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] outline-none"
                        placeholder="What felt harder than it should have?"
                        value={data.friction}
                        onChange={e => setData({ ...data, friction: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-70">Variable to Drop</label>
                    <input
                        className="w-full p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] outline-none"
                        placeholder="What mental loop are you closing right now?"
                        value={data.letGo}
                        onChange={e => setData({ ...data, letGo: e.target.value })}
                    />
                </div>

                <div className="flex justify-between">
                    <button onClick={() => setStep(s => s - 1)} className="btn-ghost">Back</button>
                    <button onClick={handleNext} className="btn">Next <ArrowRight size={16} className="ml-2" /></button>
                </div>
            </div>
        ),
        // Step 3: The Target
        (
            <div className="max-w-xl mx-auto space-y-8 text-center">
                <Target size={48} className="mx-auto text-[var(--accent)]" />
                <h2 className="text-3xl font-serif">3. The One Thing</h2>
                <p className="text-[var(--muted)]">If you only accomplished one strategic thing today, what would make the day a success?</p>

                <div className="relative">
                    <input
                        autoFocus
                        className="w-full p-6 text-2xl text-center bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--accent)] outline-none font-serif placeholder:opacity-20"
                        placeholder="Define the mission..."
                        value={data.priority}
                        onChange={e => setData({ ...data, priority: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                </div>

                <div className="pt-12">
                    <button onClick={handleSubmit} className="btn text-lg px-8 py-4 rounded-full bg-[var(--accent)] text-white hover:opacity-90 w-full shadow-lg shadow-fuchsia-500/20">
                        <Zap className="mr-2" /> Ignite Day
                    </button>
                </div>
            </div>
        )
    ];

    if (loading) return <div>Loading...</div>;

    return (
        <div className="h-screen w-full fixed top-0 left-0 bg-[var(--bg)] z-50 flex items-center justify-center p-6">

            {/* Exit/Back Button */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors z-[60]"
                title="Exit Prime"
            >
                <span className="text-xs font-bold uppercase tracking-widest mr-2">Exit</span>
            </button>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {questions[step]}
                </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="absolute bottom-10 left-0 w-full flex justify-center gap-2">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
                ))}
            </div>
        </div>
    );
}
