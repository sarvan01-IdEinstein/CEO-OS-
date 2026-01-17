'use client';
import { useState, useEffect } from 'react';
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
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [history, setHistory] = useState<any[]>([]);

    // Wizard State
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        decision: '',
        selectedRazor: null as null | typeof razors[0],
        analysis: '',
        verdict: ''
    });
    const [aiLoading, setAiLoading] = useState(false);

    // Load History on mount
    useEffect(() => {
        import('@/lib/persistence').then(mod => {
            mod.getDecisions().then(setHistory);
        });
    }, [activeTab]);

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
            const analysisText = result.choices?.[0]?.message?.content || "Analysis failed.";

            // Extract verdict slightly better
            const verdictMatch = analysisText.match(/\*\*Verdict:\*\*\s*(.*)/);
            const verdict = verdictMatch ? verdictMatch[1] : "See Analysis";

            const newData = { ...data, analysis: analysisText, verdict };
            setData(newData);

            // SAVE TO DB
            const { saveDecision } = await import('@/lib/persistence');
            await saveDecision({
                razor: data.selectedRazor.name,
                decision: data.decision,
                analysis: analysisText,
                verdict: verdict
            });

            setStep(3);
        } catch (e) {
            console.error(e);
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
                <div className="flex justify-center gap-4">
                    <button onClick={() => setStep(1)} className="btn-primary text-lg px-8 py-4">
                        Start Analysis <ArrowRight className="ml-2" size={18} />
                    </button>
                </div>
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
                        {aiLoading ? 'Analyzing...' : <><Sparkles size={16} className="mr-2" /> Analyze & Save</>}
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
                        <h2 className="text-2xl font-serif font-bold">Analysis Saved</h2>
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
                    <button onClick={() => setActiveTab('history')} className="btn flex-1">
                        View History
                    </button>
                </div>
            </div>
        )
    ];

    return (
        <div className="min-h-[80vh] flex flex-col p-6 animate-fade-in relative">
            {/* Tabs */}
            <div className="flex justify-center mb-8 gap-4">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`pb-2 border-b-2 transition-colors ${activeTab === 'new' ? 'border-[var(--accent)] text-[var(--fg)]' : 'border-transparent text-[var(--muted)]'}`}
                >
                    New Analysis
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-[var(--accent)] text-[var(--fg)]' : 'border-transparent text-[var(--muted)]'}`}
                >
                    Decision History
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="flex-1 flex items-center justify-center">
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
            ) : (
                <div className="max-w-3xl mx-auto w-full space-y-4">
                    <h2 className="text-2xl font-serif font-bold mb-6">Strategic Record</h2>
                    {history.length === 0 && <p className="text-[var(--muted)] text-center py-10">No decisions recorded yet.</p>}

                    {history.map((item) => (
                        <div key={item.id} className="glass-card p-6 hover:border-[var(--accent)]/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{item.decision}</h3>
                                    <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">{item.razor} • {new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.verdict?.includes('Yes') ? 'bg-green-500/20 text-green-400' :
                                    item.verdict?.includes('No') ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {item.verdict}
                                </div>
                            </div>
                            <div className="prose prose-sm dark:prose-invert opacity-80 h-24 overflow-hidden relative">
                                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-[var(--surface)] to-transparent"></div>
                                {item.analysis}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
