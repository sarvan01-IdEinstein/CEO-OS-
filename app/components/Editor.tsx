'use client';
import { useState, useEffect } from 'react';

export default function Editor({ initialContent, onSave }: { initialContent: string, onSave: (c: string) => void }) {
    const [content, setContent] = useState(initialContent);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            onSave(content);
        }
    };

    return (
        <div className="relative h-full flex flex-col">
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)] mb-4">
                <span className="text-xs font-mono text-[var(--muted)]">MARKDOWN MODE</span>
                <button onClick={() => onSave(content)} className="btn text-sm">Save Changes (Cmd+S)</button>
            </div>
            <textarea
                className="w-full flex-1 bg-transparent border-none text-[var(--fg)] text-lg resize-none focus:outline-none leading-relaxed font-serif"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
            />
        </div>
    );
}
