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

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Please configure your OpenAI API Key in Settings first." }]);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: "You are the Chief of Staff for a high-performance CEO. Be concise, strategic, and ruthless about prioritization. Use the tone of Marcus Aurelius meets Steve Jobs." },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMsg }
                    ]
                })
            });
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "Connection failed.";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to neural link." }]);
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
                        className="fixed bottom-24 right-8 w-96 h-[500px] glass-card flex flex-col p-0 z-50 shadow-2xl border-t border-[var(--glass-border)]"
                    >
                        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]/50 backdrop-blur rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Bot className="text-[var(--accent)]" />
                                <h3 className="font-bold text-sm">Chief of Staff</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:text-[var(--accent)]"><X size={18} /></button>
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
                                />
                                <button onClick={handleSend} className="absolute right-2 top-2 p-1.5 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white rounded-full transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--fg)] text-[var(--bg-app)] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border border-[var(--glass-border)]"
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} className="group-hover:animate-spin-slow" />}
            </button>
        </>
    );
}
