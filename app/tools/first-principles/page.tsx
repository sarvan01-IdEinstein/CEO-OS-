'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FirstPrinciplesWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        problem: '',
        assumptions: '',
        breakdown: ''
    });
    const [aiLoading, setAiLoading] = useState(false);

    const handleAnalyze = async () => {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            alert("Please configure API Key in Settings first.");
            return;
        }

        setAiLoading(true);

        const prompt = `You are a First Principles thinking coach (like Elon Musk or Aristotle).

PROBLEM: "${data.problem}"

Guide the user through First Principles analysis:

1. **Identify Assumptions** - What are 3-5 hidden assumptions in how this problem is typically approached?

2. **Break Down to Fundamentals** - What are the absolute fundamental truths (physics, economics, human nature) that underlie this problem?

3. **Rebuild from Ground Up** - Given only these fundamentals, what's a novel approach that ignores conventional wisdom?

4. **Action Step** - What's ONE thing the user can do this week to test this new approach?

Be Socratic, challenging, and concrete. Format with clear headers and bullet points.`;

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const result = await res.json();
            const analysis = result.choices?.[0]?.message?.content || "Analysis failed.";
            setData({ ...data, breakdown: analysis });
            setStep(2);
        } catch (e) {
            alert("AI connection failed.");
        }
        setAiLoading(false);
    };

    const steps = [
        // Step 0: Intro
        (
            <div className="text-center space-y-8 max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
                    <Lightbulb className="text-amber-500" size={40} />
                </div>
                <h1 className="text-4xl font-serif font-bold">First Principles</h1>
                <p className="text-[var(--muted)]">
                    "I think it's important to reason from first principles rather than by analogy." — Elon Musk
                </p>
                <p className="text-[var(--muted)] text-sm">
                    Break problems down to their fundamental truths. Then rebuild solutions from the ground up.
                </p>
                <button onClick={() => setStep(1)} className="btn-primary text-lg px-8 py-4">
                    Start Breakdown <ArrowRight className="ml-2" size={18} />
                </button>
            </div>
        ),
        // Step 1: Define Problem
        (
            <div className="max-w-xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif font-bold">What problem are you solving?</h2>
                <p className="text-[var(--muted)]">Describe the challenge you're facing. Don't assume any particular solution.</p>

                <textarea
                    autoFocus
                    value={data.problem}
                    onChange={e => setData({ ...data, problem: e.target.value })}
                    placeholder="e.g., How do I reduce customer acquisition cost by 50%?"
                    className="w-full p-4 h-32 bg-[var(--bg-app)] border border-[var(--glass-border)] rounded-xl outline-none focus:border-[var(--accent)] resize-none"
                />

                <div className="flex justify-between">
                    <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft size={16} className="mr-2" /> Back</button>
                    <button onClick={handleAnalyze} disabled={!data.problem.trim() || aiLoading} className="btn-primary">
                        {aiLoading ? 'Breaking Down...' : <><Sparkles size={16} className="mr-2" /> Analyze</>}
                    </button>
                </div>
            </div>
        ),
        // Step 2: Result
        (
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Check className="text-amber-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold">First Principles Breakdown</h2>
                        <p className="text-[var(--muted)] text-sm">Rebuild from fundamentals</p>
                    </div>
                </div>

                <div className="glass-card max-h-[50vh] overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {data.breakdown}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => { setData({ problem: '', assumptions: '', breakdown: '' }); setStep(1); }} className="btn-ghost flex-1">
                        New Problem
                    </button>
                    <button onClick={() => router.push('/tools')} className="btn flex-1">
                        Back to Tools
                    </button>
                </div>
            </div>
        )
    ];

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {steps[step]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
