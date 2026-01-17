'use client';
import { useState, useRef, useEffect } from 'react';
import { User, Send, X, Sparkles, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { callAI, getAISettings } from '@/lib/ai';

const ADVISORS = [
    {
        id: 'stoic',
        name: 'Marcus Aurelius',
        role: 'The Stoic',
        avatar: '🏛️',
        color: 'bg-stone-500',
        description: 'Ancient wisdom for modern problems',
        systemPrompt: `You are Marcus Aurelius, the Stoic philosopher-emperor. You speak with calm authority and ancient wisdom.

Your style:
- Ask about what is within the user's control vs. outside it
- Remind them that emotions are choices
- Reference Stoic principles (memento mori, amor fati, premeditatio malorum)
- Be brief, contemplative, and profound
- Occasionally quote yourself or other Stoics

Start by asking what weighs on their mind today.`
    },
    {
        id: 'visionary',
        name: 'The Visionary',
        role: 'Growth Advisor',
        avatar: '🚀',
        color: 'bg-fuchsia-500',
        description: '10x thinking and moonshot goals',
        systemPrompt: `You are a visionary advisor in the style of Elon Musk, Peter Thiel, and Jeff Bezos combined.

Your style:
- Challenge incrementalism - ask "why not 10x instead of 10%?"
- Compress timelines aggressively - "why 5 years when 6 months is possible?"
- First principles thinking - break down to fundamentals
- Be bold, provocative, and action-oriented
- Push back on limiting beliefs

Start by asking what bold goal they're working toward.`
    },
    {
        id: 'operator',
        name: 'The Operator',
        role: 'Execution Expert',
        avatar: '⚙️',
        color: 'bg-blue-500',
        description: 'Ruthless focus on execution and risk',
        systemPrompt: `You are a world-class COO/operator. You've scaled companies from $0 to $1B.

Your style:
- Focus on single points of failure
- Ask about cash flow, runway, unit economics
- Demand clear accountability ("who exactly owns this?")
- Identify what must STOP to make room for new priorities
- Be direct, practical, no-nonsense

Start by asking what operational challenge they're facing.`
    },
    {
        id: 'devil',
        name: "Devil's Advocate",
        role: 'Critical Thinker',
        avatar: '😈',
        color: 'bg-red-500',
        description: 'Challenges every assumption',
        systemPrompt: `You are the Devil's Advocate. Your job is to find the flaws in any plan.

Your style:
- Challenge every assumption
- Ask "what if you're wrong about X?"
- Point out blind spots and biases
- Stress-test ideas to destruction
- Be intellectually aggressive but not hostile

Start by asking what decision or plan they want you to attack.`
    }
];

type Message = { role: 'user' | 'assistant'; content: string };

export default function BoardRoom() {
    const [selected, setSelected] = useState<typeof ADVISORS[0] | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    }, [messages]);

    const openAdvisor = (advisor: typeof ADVISORS[0]) => {
        setSelected(advisor);
        setMessages([{ role: 'assistant', content: getGreeting(advisor) }]);
    };

    const getGreeting = (advisor: typeof ADVISORS[0]) => {
        switch (advisor.id) {
            case 'stoic': return "Welcome. What weighs on your mind today? Remember: the obstacle is the way.";
            case 'visionary': return "Let's think big. What's the most audacious goal you're working toward right now?";
            case 'operator': return "Let's get tactical. What operational challenge needs solving?";
            case 'devil': return "I'm here to break your plan. Tell me what you're considering, and I'll find the holes.";
            default: return "How can I help you today?";
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !selected) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await callAI(
                [
                    { role: 'system', content: selected.systemPrompt },
                    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                    { role: 'user', content: userMsg }
                ],
                {
                    onFallbackPrompt: async () => {
                        return window.confirm(
                            '⚠️ Local AI is unavailable.\n\nSwitch to OpenAI (cloud) for this request?\n\nThis will use your API credits.'
                        );
                    }
                }
            );

            const providerNote = response.fallbackUsed
                ? `\n\n---\n*[Used OpenAI as fallback]*`
                : '';
            setMessages(prev => [...prev, { role: 'assistant', content: response.content + providerNote }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: error.message || 'Connection failed. Check Settings.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="h-[85vh] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 px-4">
                <h1 className="text-2xl sm:text-4xl font-serif font-bold mb-2">The Board Room</h1>
                <p className="text-[var(--muted)] text-sm sm:text-base">Your AI-powered advisory board. Each advisor has a distinct perspective.</p>
            </div>

            {/* Advisor Selection */}
            {!selected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto px-4">
                    {ADVISORS.map(advisor => (
                        <button
                            key={advisor.id}
                            onClick={() => openAdvisor(advisor)}
                            className="glass-card p-4 sm:p-6 text-center hover:border-[var(--accent)] transition-all group"
                        >
                            <div className={clsx("w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-2xl sm:text-3xl", advisor.color)}>
                                {advisor.avatar}
                            </div>
                            <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-[var(--accent)]">{advisor.name}</h3>
                            <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">{advisor.role}</p>
                            <p className="text-xs sm:text-sm text-[var(--muted)]">{advisor.description}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Chat Interface */}
            {selected && (
                <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
                    {/* Advisor Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-4 glass-card">
                        <div className="flex items-center gap-4">
                            <div className={clsx("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl", selected.color)}>
                                {selected.avatar}
                            </div>
                            <div>
                                <h2 className="font-bold text-sm sm:text-base">{selected.name}</h2>
                                <p className="text-xs text-[var(--muted)]">{selected.role}</p>
                            </div>
                        </div>
                        <button onClick={() => { setSelected(null); setMessages([]); }} className="btn-ghost text-sm">
                            <X size={18} /> <span className="hidden sm:inline">Change Advisor</span>
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 glass-card">
                        {messages.map((m, i) => (
                            <div key={i} className={clsx("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={clsx(
                                    "max-w-[80%] p-4 rounded-2xl",
                                    m.role === 'user'
                                        ? 'bg-[var(--accent)] text-white'
                                        : 'bg-[var(--bg-app)]'
                                )}>
                                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--bg-app)] p-4 rounded-2xl">
                                    <p className="text-sm text-[var(--muted)] animate-pulse">Thinking...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="flex gap-3">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={`Ask ${selected.name}...`}
                            className="flex-1 px-5 py-3 rounded-full bg-[var(--bg-app)] border border-[var(--glass-border)] outline-none focus:border-[var(--accent)]"
                        />
                        <button onClick={handleSend} disabled={loading} className="btn-primary px-6">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
