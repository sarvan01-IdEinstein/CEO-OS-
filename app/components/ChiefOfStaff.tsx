'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChiefOfStaff() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "I am ready, Chief. What is on your mind?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages, isOpen]);

    // Proactive Check
    useEffect(() => {
        const checkPriority = async () => {
            try {
                const res = await fetch('/api/briefing', { method: 'POST' });
                const data = await res.json();
                if (data.priority === 'high') {
                    setIsOpen(true);
                    setMessages(prev => [...prev, { role: 'assistant', content: "🚨 **Attention, CEO.**\n\nI have detected critical items requiring your immediate review. Shall I proceed with the Morning Briefing?" }]);
                }
            } catch (e) {
                console.error("Proactive check failed", e);
            }
        };
        // Small delay to let page load first
        const timer = setTimeout(checkPriority, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const { callAI } = await import('@/lib/ai');
            const response = await callAI([
                { role: 'system', content: "You are the Chief of Staff. Be concise, strategic, and ruthless." },
                ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                { role: 'user', content: userMsg }
            ]);
            setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to neural link. Check settings." }]);
        }
        setLoading(false);
    };

    const handleBriefing = async () => {
        setLoading(true);
        try {
            // 1. Get Context from our internal API
            const contextRes = await fetch('/api/briefing', { method: 'POST' });
            const { context } = await contextRes.json();

            // 2. Ask AI to synthesize
            const prompt = `
            Analyze this data and give me a Morning Briefing.
            
            CONTEXT:
            - OKRs: ${JSON.stringify(context.okrs)}
            - TASKS: ${JSON.stringify(context.tasks)}
            - DECISIONS: ${JSON.stringify(context.decisions)}
            - LAST LOG: ${JSON.stringify(context.lastLog)}
            `;

            const { callAI } = await import('@/lib/ai');
            const response = await callAI([
                { role: 'system', content: "You are the Chief of Staff. Generate a brutal, bulleted Morning Briefing based on the data. Focus on what is falling behind." },
                { role: 'user', content: prompt }
            ]);

            setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'assistant', content: "Briefing failed. ensure AI settings are configured." }]);
        }
        setLoading(false);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 left-4 sm:left-auto w-auto sm:w-96 h-[70vh] sm:h-[500px] max-h-[600px] glass-card flex flex-col p-0 z-50 shadow-2xl border-t border-[var(--glass-border)]"
                        role="dialog"
                        aria-label="Chief of Staff AI assistant"
                    >
                        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]/50 backdrop-blur rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Bot className="text-[var(--accent)]" />
                                <h3 className="font-bold text-sm">Chief of Staff</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleBriefing} className="text-xs bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-white px-2 py-1 rounded transition-colors" title="Generate Morning Briefing">
                                    <Sparkles size={14} /> Brief Me
                                </button>
                                <button onClick={() => setIsOpen(false)} className="hover:text-[var(--accent)]" aria-label="Close chat"><X size={18} /></button>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                        ? 'bg-[var(--fg)] text-[var(--bg-app)] rounded-tr-sm'
                                        : 'bg-[var(--surface)] border border-[var(--border)] rounded-tl-sm shadow-sm'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && <div className="text-xs text-[var(--muted)] animate-pulse ml-2">Thinking...</div>}
                        </div>

                        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]/50 rounded-b-2xl">
                            <div className="relative">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask for strategy..."
                                    className="w-full pl-4 pr-10 py-3 rounded-full bg-[var(--bg-app)]/50 border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none text-sm"
                                    aria-label="Chat message input"
                                />
                                <button onClick={handleSend} className="absolute right-2 top-2 p-1.5 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white rounded-full transition-colors" aria-label="Send message">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--fg)] text-[var(--bg-app)] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border border-[var(--glass-border)]"
                aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
                aria-expanded={isOpen}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} className="group-hover:animate-spin-slow" />}
            </button>
        </>
    );
}
