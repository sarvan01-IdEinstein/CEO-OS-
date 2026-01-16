'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Moon, Power, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Shutdown() {
    const [step, setStep] = useState(0);
    const [todayObjective, setTodayObjective] = useState('');
    const [didHit, setDidHit] = useState<boolean | null>(null);
    const [pmEnergy, setPmEnergy] = useState(5);
    const [tomorrowPriority, setTomorrowPriority] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch Today's Objective context
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const init = async () => {
            // Try Today's File first
            let res = await fetch(`/api/files?type=file&path=reviews/daily/${today}.md`);
            let data = await res.json();

            // If not found, try yesterday (maybe we just relied on yesterday's plan)
            if (!data.content || !data.content.match(/4\. \*\*.*Priority.*\*\*:\n\s+-\s+(.*)/)) {
                let res2 = await fetch(`/api/files?type=file&path=reviews/daily/${yesterday}.md`);
                let data2 = await res2.json();
                if (data2.content) data = data2; // Fallback to yesterday for context
            }

            if (data.content) {
                const match = data.content.match(/4\. \*\*.*Priority.*\*\*:\n\s+-\s+(.*)/);
                if (match && match[1]) setTodayObjective(match[1].trim());
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleNext = () => setStep(s => s + 1);

    const handleShutdown = async () => {
        const today = new Date().toISOString().split('T')[0];
        setStep(3); // Animation

        // 1. Read Today's File (or create if missing)
        let res = await fetch(`/api/files?type=file&path=reviews/daily/${today}.md`);
        let data = await res.json();
        let content = data.content || `# Daily Check-in\n*Date: ${today}*\n\n**Energy Level (1-10):** [ ]\n\n1. **One Meaningful Win**:\n   -\n\n2. **One Friction Point**:\n   -\n\n3. **One Thing to Let Go Of**:\n   -\n\n4. **The Single Major Priority for Tomorrow**:\n   -`;

        // 2. Update Content
        // A. Hit Rate
        if (!content.includes('**Hit Daily Target:**')) {
            content += `\n\n**Hit Daily Target:** ${didHit ? 'Yes' : 'No'}`;
        }

        // B. PM Energy and Shutdown Marker
        content += `\n\n## Evening Shutdown\n**PM Energy:** ${pmEnergy}`;

        // C. Tomorrow's Priority (Replace field 4)
        // Regex replace: 4. **...Priority...**:\n   - .*
        // We replace with our new priority
        content = content.replace(
            /(4\. \*\*.*Priority.*\*\*:\n\s+-\s+).*/,
            `$1${tomorrowPriority}`
        );

        // If replace didn't work (structure broken), append it
        if (!content.includes(tomorrowPriority)) {
            // Fallback
        }

        // 3. Save
        await fetch('/api/files', {
            method: 'POST',
            body: JSON.stringify({ path: `reviews/daily/${today}.md`, content })
        });

        setTimeout(() => {
            router.push('/');
        }, 4000);
    };

    const questions = [
        // Step 0: Review
        (
            <div className="text-center space-y-8 max-w-2xl mx-auto">
                <Moon size={64} className="mx-auto text-blue-400 mb-4" />
                <h1 className="text-4xl font-serif font-bold">Protocol Shutdown.</h1>
                <div className="card text-left p-8 border border-white/10 bg-white/5">
                    <h3 className="text-xs uppercase tracking-widest text-white/50 mb-4 font-bold">Today's Mission</h3>
                    <div className="text-xl font-serif">{todayObjective || "No mission logged."}</div>
                </div>
                <h2 className="text-2xl">Did you execute?</h2>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => { setDidHit(true); handleNext(); }} className="btn bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-white px-8 py-4 rounded-xl text-xl flex items-center gap-2">
                        <Check /> Yes
                    </button>
                    <button onClick={() => { setDidHit(false); handleNext(); }} className="btn bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-8 py-4 rounded-xl text-xl flex items-center gap-2">
                        <AlertCircle /> No
                    </button>
                </div>
            </div>
        ),
        // Step 1: Energy Log
        (
            <div className="max-w-xl mx-auto space-y-8 text-center">
                <h2 className="text-3xl font-serif">Closing Energy</h2>
                <div className="text-6xl font-mono font-bold text-blue-400">{pmEnergy}</div>
                <input
                    type="range" min="1" max="10"
                    value={pmEnergy}
                    onChange={e => setPmEnergy(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button onClick={handleNext} className="btn mt-8">Next <ArrowRight size={16} className="ml-2" /></button>
            </div>
        ),
        // Step 2: Tomorrow's Load
        (
            <div className="max-w-xl mx-auto space-y-8 text-center">
                <h2 className="text-3xl font-serif">Tomorrow's One Thing</h2>
                <div className="relative">
                    <input
                        autoFocus
                        className="w-full p-6 text-2xl text-center bg-transparent border-b-2 border-white/20 focus:border-blue-500 outline-none font-serif placeholder:opacity-20"
                        placeholder="One strategic priority..."
                        value={tomorrowPriority}
                        onChange={e => setTomorrowPriority(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleShutdown()}
                    />
                </div>
                <button onClick={handleShutdown} className="btn mt-12 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full shadow-lg shadow-blue-500/20">
                    <Power className="mr-2" /> System Offline
                </button>
            </div>
        ),
        // Step 3: Animation
        (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <motion.div
                    animate={{ scale: [1, 1.2, 0], opacity: [1, 1, 0] }}
                    transition={{ duration: 2, times: [0, 0.5, 1] }}
                    className="flex flex-col items-center text-center"
                >
                    <Power size={100} className="text-blue-500 mb-8" />
                    <h1 className="text-4xl font-serif font-bold">System Offline</h1>
                    <p className="text-white/50 mt-4">Rest well, CEO.</p>
                </motion.div>
            </div>
        )
    ];

    if (loading) return <div className="p-12 text-center">Initializing Shutdown...</div>;

    return (
        <div className="fixed inset-0 bg-[#050505] text-white z-50 flex items-center justify-center p-6">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {questions[step]}
                </motion.div>
            </AnimatePresence>

            {step < 3 && (
                <div className="absolute top-8 right-8">
                    <button onClick={() => router.push('/')} className="opacity-50 hover:opacity-100 text-sm uppercase tracking-widest font-bold">Abort</button>
                </div>
            )}
        </div>
    );
}
