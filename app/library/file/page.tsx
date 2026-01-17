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

        try {
            const systemPrompt = `You are an expert executive coach and strategist. The user is viewing a knowledge document. Help them apply its principles to their specific situation.

DOCUMENT CONTEXT:
---
${content.slice(0, 3000)}
---

Be concise, actionable, and Socratic. Ask clarifying questions if needed.`;

            const { callAI } = await import('@/lib/ai');
            const response = await callAI([
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                { role: 'user', content: userMsg }
            ]);
            setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again." }]);
        }
        setAiLoading(false);
    };

    const handleGenerateOKRs = async () => {
        setAiLoading(true);

        try {
            const { callAI } = await import('@/lib/ai');
            const response = await callAI([
                { role: 'system', content: `Extract minimal, high-impact OKRs from this strategy document. Return ONLY valid JSON array.` },
                {
                    role: 'user', content: `Extract 1-3 Objectives. For each, extract 1-3 Key Results (measurable).
                    
                    Source Text:
                    ${content}

                    Return ONLY valid JSON in this format:
                    [
                      {
                        "title": "Objective Title",
                        "key_results": [
                            { "title": "KR Title", "target": 100, "unit": "%" }
                        ]
                      }
                    ]` }
            ]);

            const jsonStr = response.content.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            const { saveOKR } = await import('@/lib/persistence');

            for (const obj of parsed) {
                // Save Objective
                const savedObj = await saveOKR({
                    title: obj.title,
                    type: 'OBJECTIVE',
                    current_value: 0,
                    target_value: 100,
                    unit: '%',
                    status: 'on_track'
                });

                // Save KRs
                for (const kr of obj.key_results) {
                    await saveOKR({
                        title: kr.title,
                        type: 'KEY_RESULT',
                        parent_id: savedObj.id,
                        current_value: 0,
                        target_value: kr.target || 100,
                        unit: kr.unit || '%',
                        status: 'on_track'
                    });
                }
            }
            alert(`Success! Generated ${parsed.length} Objectives and ${parsed.reduce((acc: any, o: any) => acc + o.key_results.length, 0)} Key Results.`);
            window.location.reload(); // Refresh to show new data if needed

        } catch (e) {
            console.error(e);
            alert("Failed to generate OKRs. Check AI settings or content.");
        }
        setAiLoading(false);
    };

    if (loading) return <div className="p-12 text-center text-[var(--muted)]">Loading...</div>;

    return (
        <div className="h-[85vh] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-4 border-b border-[var(--glass-border)]">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <Link href="/library" className="text-[var(--muted)] hover:text-[var(--fg)] shrink-0"><ArrowLeft size={18} /></Link>
                    <h1 className="text-sm sm:text-lg font-mono opacity-70 truncate">{path}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => { setShowAI(!showAI); if (!showAI && messages.length === 0) setMessages([{ role: 'assistant', content: "How can I help you apply this framework?" }]); }}
                        className={`btn-primary flex items-center gap-2 text-sm ${showAI ? 'bg-rose-500' : ''}`}
                    >
                        {showAI ? 'Close AI' : 'Apply with AI'}
                    </button>
                    {path?.includes('goals/') && (
                        <button
                            onClick={handleGenerateOKRs}
                            disabled={aiLoading}
                            className="btn bg-[var(--accent)] text-white flex items-center gap-2 text-sm"
                        >
                            <Sparkles size={16} /> <span className="hidden sm:inline">Generate</span> OKRs
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Editor Pane */}
                <div className={`flex-1 overflow-y-auto ${showAI ? 'w-3/5' : 'w-full'}`}>
                    <Editor initialContent={content} onSave={handleSave} />
                </div>

                {/* AI Panel - full width on mobile when open */}
                {showAI && (
                    <div className="fixed inset-0 sm:relative sm:inset-auto w-full sm:w-2/5 glass-card flex flex-col p-0 overflow-hidden z-50 sm:z-auto">
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
