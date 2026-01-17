'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Editor from '../../components/Editor';
import { format } from 'date-fns';
import { PanelRightClose, PanelRightOpen, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

function NewReview() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'daily';

    const [content, setContent] = useState('');
    const [contextContent, setContextContent] = useState('');
    const [contextTitle, setContextTitle] = useState('');
    const [showContext, setShowContext] = useState(true);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        // 1. Fetch Template
        fetch(`/api/files?type=file&path=reviews/${type}/template.md`)
            .then(res => res.json())
            .then(data => {
                if (data.content) {
                    const dateStr = format(new Date(), 'yyyy-MM-dd');
                    let hydrated = data.content.replace('{{DATE}}', dateStr);
                    setContent(hydrated);
                }
            });

        // 2. Determine Context File
        let contextPath = '';
        let title = '';

        if (type === 'daily') {
            contextPath = 'goals/1_year.md';
            title = 'Annual Goals & Strategy';
        } else if (type === 'weekly') {
            contextPath = 'frameworks/life_map.md';
            title = 'Life Map Definition';
        } else if (type === 'quarterly') {
            contextPath = 'north_star.md';
            title = 'North Star Mission';
        } else {
            contextPath = 'principles.md';
            title = 'Core Principles';
        }

        setContextTitle(title);

        // 3. Fetch Context
        fetch(`/api/files?type=file&path=${contextPath}`)
            .then(res => res.json())
            .then(data => {
                if (data.content) setContextContent(data.content);
                setLoading(false);
            });

    }, [type]);

    const handleSave = async (newContent: string) => {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const path = `reviews/${type}/${dateStr}.md`;

        const res = await fetch('/api/files', {
            method: 'POST',
            body: JSON.stringify({ path, content: newContent })
        });

        if (!res.ok) {
            const err = await res.json();
            alert('Failed to save entry: ' + (err.error || 'Unknown error'));
            return;
        }

        router.push('/reviews');
    };

    const handleMagicDraft = async () => {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            alert("Please configure API Key in System Settings first.");
            return;
        }

        setAiLoading(true);
        const prompt = `You are a high-performance executive coach.
      Write a draft for a ${type} review based on general best practices for a CEO.
      Keep it bulleted, honest, and strategic.
      Format it in Markdown using the headers provided in the template.`;

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const data = await res.json();
            const draft = data.choices?.[0]?.message?.content;
            if (draft) setContent(prev => prev + "\n\n" + draft);
        } catch (e) {
            alert("AI Connection Failed");
        }
        setAiLoading(false);
    };

    if (loading) return <div className="p-12 text-center text-[var(--muted)]">Loading context engine...</div>;

    return (
        <div className="h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className="min-h-14 sm:h-16 border-b border-[var(--glass-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-4 sm:px-6 py-2 sm:py-0 bg-[var(--glass-surface)] backdrop-blur-md sticky top-0 z-10 transition-all">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/" className="text-[var(--muted)] hover:text-[var(--fg)]"><ArrowLeft size={18} /></Link>
                    <div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[var(--muted)]">{type} Review</span>
                        <h1 className="text-base sm:text-lg font-serif font-bold">Today's Entry</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleMagicDraft}
                        disabled={aiLoading}
                        className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all border border-[var(--accent)] disabled:opacity-50"
                    >
                        {aiLoading ? <span className="animate-spin">⏳</span> : <Sparkles size={14} />}
                        <span className="hidden sm:inline">{aiLoading ? 'Drafting...' : 'Magic Draft'}</span>
                    </button>
                    <button
                        onClick={() => setShowContext(!showContext)}
                        className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                    >
                        {showContext ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                        <span className="hidden sm:inline">{showContext ? 'Hide Context' : 'Show Context'}</span>
                    </button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                {/* Editor Pane */}
                <div className={`flex-1 overflow-y-auto ${showContext ? 'sm:border-r border-[var(--glass-border)]' : ''}`}>
                    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-4 sm:px-8 h-full">
                        <Editor initialContent={content} onSave={handleSave} />
                    </div>
                </div>

                {/* Context Pane - hidden on mobile unless explicitly toggled */}
                {showContext && (
                    <div className="hidden sm:block w-[40%] bg-[var(--glass-surface)] overflow-y-auto border-l border-[var(--glass-border)] backdrop-blur-md">
                        <div className="p-8">
                            <div className="mb-6 pb-4 border-b border-[var(--glass-border)]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Aligned Context</span>
                                <h2 className="font-serif font-bold text-xl mt-1">{contextTitle}</h2>
                            </div>
                            <div className="prose prose-sm prose-stone dark:prose-invert opacity-80 whitespace-pre-wrap font-serif">
                                {contextContent}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NewReviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewReview />
        </Suspense>
    )
}
