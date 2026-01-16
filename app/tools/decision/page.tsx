'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const razors = [
    { name: "Occam's Razor", desc: "The simplest explanation is usually correct.", question: "What's the simplest path forward?" },
    { name: "Hanlon's Razor", desc: "Don't assume malice when stupidity explains it.", question: "Is this incompetence, not conspiracy?" },
    { name: "Regret Minimization", desc: "Choose what you won't regret at 80.", question: "Will you regret NOT doing this?" },
    { name: "Reversibility Test", desc: "Prefer reversible decisions; move fast.", question: "Can you undo this if wrong?" },
    { name: "10/10/10 Rule", desc: "How will you feel in 10 min, 10 months, 10 years?", question: "What's the long-term view?" },
    { name: "Skin in the Game", desc: "Trust those who bear the consequences.", question: "Who has the most to lose here?" }
];

export default function DecisionWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        decision: '',
        selectedRazor: null as null | typeof razors[0],
        analysis: '',
        verdict: ''
    });
    const [aiLoading, setAiLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!data.selectedRazor) return;

        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            alert("Please configure API Key in Settings first.");
            return;
        }

        setAiLoading(true);

        const prompt = `You are a strategic advisor. The user is making a decision using ${data.selectedRazor.name}.

DECISION: "${data.decision}"

RAZOR: ${data.selectedRazor.name} - ${data.selectedRazor.desc}
KEY QUESTION: ${data.selectedRazor.question}

Analyze this decision through the lens of this razor. Be:
1. Direct and concise (3-4 bullet points max)
2. Provide a clear Yes/No/Conditional recommendation
3. End with ONE clarifying question if needed

Format:
**Analysis:**
- [point 1]
- [point 2]
- [point 3]

**Verdict:** [Yes/No/Conditional] — [one sentence reason]`;

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
            setData({ ...data, analysis });
            setStep(3);
        } catch (e) {
            alert("AI connection failed.");
        }
        setAiLoading(false);
    };

    const steps = [
        // Step 0: Intro
        (
            <div className="text-center space-y-8 max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
                    <Target className="text-blue-500" size={40} />
                </div>
                <h1 className="text-4xl font-serif font-bold">Decision Razor</h1>
                <p className="text-[var(--muted)]">
                    Use proven mental models to cut through decision paralysis.
                    We'll guide you through the right framework for your situation.
                </p>
                <button onClick={() => setStep(1)} className="btn-primary text-lg px-8 py-4">
                    Start Analysis <ArrowRight className="ml-2" size={18} />
                </button>
            </div>
        ),
        // Step 1: Define Decision
        (
            <div className="max-w-xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif font-bold">What decision are you facing?</h2>
                <p className="text-[var(--muted)]">Be specific. The clearer the input, the sharper the output.</p>

                <textarea
                    autoFocus
                    value={data.decision}
                    onChange={e => setData({ ...data, decision: e.target.value })}
                    placeholder="e.g., Should I hire a COO now or wait until we hit $5M ARR?"
                    className="w-full p-4 h-32 bg-[var(--bg-app)] border border-[var(--glass-border)] rounded-xl outline-none focus:border-[var(--accent)] resize-none"
                />

                <div className="flex justify-between">
                    <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft size={16} className="mr-2" /> Back</button>
                    <button onClick={() => setStep(2)} disabled={!data.decision.trim()} className="btn-primary">
                        Choose Razor <ArrowRight size={16} className="ml-2" />
                    </button>
                </div>
            </div>
        ),
        // Step 2: Choose Razor
        (
            <div className="max-w-2xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif font-bold">Pick your razor</h2>
                <p className="text-[var(--muted)]">Which mental model fits this decision?</p>

                <div className="grid grid-cols-2 gap-4">
                    {razors.map(razor => (
                        <button
                            key={razor.name}
                            onClick={() => setData({ ...data, selectedRazor: razor })}
                            className={`text-left p-4 rounded-xl border transition-all ${data.selectedRazor?.name === razor.name
                                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                                    : 'border-[var(--glass-border)] hover:border-[var(--accent)]/50'
                                }`}
                        >
                            <h4 className="font-bold mb-1">{razor.name}</h4>
                            <p className="text-sm text-[var(--muted)]">{razor.desc}</p>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="btn-ghost"><ArrowLeft size={16} className="mr-2" /> Back</button>
                    <button onClick={handleAnalyze} disabled={!data.selectedRazor || aiLoading} className="btn-primary">
                        {aiLoading ? 'Analyzing...' : <><Sparkles size={16} className="mr-2" /> Analyze</>}
                    </button>
                </div>
            </div>
        ),
        // Step 3: Result
        (
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Check className="text-emerald-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold">Analysis Complete</h2>
                        <p className="text-[var(--muted)] text-sm">Using: {data.selectedRazor?.name}</p>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {data.analysis}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => { setData({ decision: '', selectedRazor: null, analysis: '', verdict: '' }); setStep(1); }} className="btn-ghost flex-1">
                        New Decision
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
