'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, ArrowRight, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PreMortemWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        project: '',
        risks: '',
        mitigations: ''
    });
    const [aiLoading, setAiLoading] = useState(false);

    const handleAnalyze = async () => {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            alert("Please configure API Key in Settings first.");
            return;
        }

        setAiLoading(true);

        const prompt = `You are a strategic risk analyst. The user is doing a Pre-Mortem analysis.

PROJECT/DECISION: "${data.project}"

A Pre-Mortem imagines the project has FAILED and works backward to identify why.

Generate:
1. **5 Most Likely Failure Modes** - What could go wrong? Be specific and realistic.
2. **Hidden Risks** - 2-3 risks the user might not have considered.
3. **Mitigation Actions** - For each major risk, suggest a preventive action.

Format clearly with headers and bullet points. Be direct and actionable.`;

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
            setData({ ...data, mitigations: analysis });
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
                <div className="w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto">
                    <Skull className="text-rose-500" size={40} />
                </div>
                <h1 className="text-4xl font-serif font-bold">Pre-Mortem</h1>
                <p className="text-[var(--muted)]">
                    Imagine your project has failed. Now, figure out why.
                    This exercise surfaces risks you might otherwise miss.
                </p>
                <button onClick={() => setStep(1)} className="btn-primary text-lg px-8 py-4">
                    Begin Analysis <ArrowRight className="ml-2" size={18} />
                </button>
            </div>
        ),
        // Step 1: Define Project
        (
            <div className="max-w-xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif font-bold">What's the project or decision?</h2>
                <p className="text-[var(--muted)]">Describe the initiative you're about to launch or commit to.</p>

                <textarea
                    autoFocus
                    value={data.project}
                    onChange={e => setData({ ...data, project: e.target.value })}
                    placeholder="e.g., Launching a new product line in Q2, targeting enterprise customers..."
                    className="w-full p-4 h-32 bg-[var(--bg-app)] border border-[var(--glass-border)] rounded-xl outline-none focus:border-[var(--accent)] resize-none"
                />

                <div className="flex justify-between">
                    <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft size={16} className="mr-2" /> Back</button>
                    <button onClick={handleAnalyze} disabled={!data.project.trim() || aiLoading} className="btn-primary">
                        {aiLoading ? 'Analyzing Failure Modes...' : <><Sparkles size={16} className="mr-2" /> Generate Risks</>}
                    </button>
                </div>
            </div>
        ),
        // Step 2: Result
        (
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                        <AlertTriangle className="text-rose-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold">Risk Analysis Complete</h2>
                        <p className="text-[var(--muted)] text-sm">Review and address before proceeding</p>
                    </div>
                </div>

                <div className="glass-card max-h-[50vh] overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {data.mitigations}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => { setData({ project: '', risks: '', mitigations: '' }); setStep(1); }} className="btn-ghost flex-1">
                        New Analysis
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
