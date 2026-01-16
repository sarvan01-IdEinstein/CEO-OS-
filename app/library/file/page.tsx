'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useRef } from 'react';
import Editor from '@/app/components/Editor';
import { Sparkles, Send, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function FilePageContent() {
    const searchParams = useSearchParams();
    const path = searchParams.get('path');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    // AI Chat State
    const [showAI, setShowAI] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!path) return;
        async function load() {
            const res = await fetch(`/api/files?type=file&path=${encodeURIComponent(path as string)}`);
            const data = await res.json();
            if (data.content) setContent(data.content);
            setLoading(false);
        }
        load();
    }, [path]);

    useEffect(() => {
        chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    }, [messages]);

    const handleSave = async (newContent: string) => {
        if (!path) return;
        const res = await fetch('/api/files', {
            method: 'POST',
            body: JSON.stringify({ path, content: newContent })
        });
        if (res.ok) alert('Saved!');
    };

    const handleAISubmit = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setAiLoading(true);

        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Please configure your OpenAI API Key in Settings first." }]);
            setAiLoading(false);
            return;
        }

        try {
            const systemPrompt = `You are an expert executive coach and strategist. The user is viewing a knowledge document. Help them apply its principles to their specific situation.

DOCUMENT CONTEXT:
---
${content.slice(0, 3000)}
---

Be concise, actionable, and Socratic. Ask clarifying questions if needed.`;

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMsg }
                    ]
                })
            });
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "I couldn't process that.";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again." }]);
        }
        setAiLoading(false);
    };

    if (loading) return <div className="p-12 text-center text-[var(--muted)]">Loading...</div>;

    return (
        <div className="h-[85vh] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--glass-border)]">
                <div className="flex items-center gap-4">
                    <Link href="/library" className="text-[var(--muted)] hover:text-[var(--fg)]"><ArrowLeft size={18} /></Link>
                    <h1 className="text-lg font-mono opacity-70">{path}</h1>
                </div>
                <button
                    onClick={() => { setShowAI(!showAI); if (!showAI && messages.length === 0) setMessages([{ role: 'assistant', content: "How can I help you apply this framework?" }]); }}
                    className={`btn-primary flex items-center gap-2 ${showAI ? 'bg-rose-500' : ''}`}
                >
                    {showAI ? <X size={16} /> : <Sparkles size={16} />}
                    {showAI ? 'Close AI' : 'Apply with AI'}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Editor Pane */}
                <div className={`flex-1 overflow-y-auto ${showAI ? 'w-3/5' : 'w-full'}`}>
                    <Editor initialContent={content} onSave={handleSave} />
                </div>

                {/* AI Panel */}
                {showAI && (
                    <div className="w-2/5 glass-card flex flex-col p-0 overflow-hidden">
                        <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--accent)]/10">
                            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={14} className="text-[var(--accent)]" /> Knowledge Engine
                            </h3>
                        </div>

                        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`inline-block max-w-[90%] p-3 rounded-xl ${m.role === 'user' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-app)]'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {aiLoading && <div className="text-sm text-[var(--muted)] animate-pulse">Thinking...</div>}
                        </div>

                        <div className="p-4 border-t border-[var(--glass-border)]">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAISubmit()}
                                    placeholder="Ask how to apply this..."
                                    className="flex-1 px-4 py-2 rounded-full bg-[var(--bg-app)] border border-[var(--glass-border)] outline-none focus:border-[var(--accent)] text-sm"
                                />
                                <button onClick={handleAISubmit} disabled={aiLoading} className="btn-primary px-4">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FilePageContent />
        </Suspense>
    );
}
