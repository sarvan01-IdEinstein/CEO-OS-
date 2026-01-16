'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function ReviewsIndex() {
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        // Fetch all types
        Promise.all([
            fetch('/api/files?type=list&path=reviews/daily').then(r => r.json()),
            fetch('/api/files?type=list&path=reviews/weekly').then(r => r.json()),
            fetch('/api/files?type=list&path=reviews/quarterly').then(r => r.json())
        ]).then(([daily, weekly, quarterly]) => {
            const all = [...(daily || []), ...(weekly || []), ...(quarterly || [])]
                .filter((f: any) => !f.name.includes('template')) // Filter templates
                .sort((a: any, b: any) => b.name.localeCompare(a.name));
            setFiles(all);
        });
    }, []);

    const handleDelete = async (path: string) => {
        if (!confirm("Are you sure you want to delete this log?")) return;

        const res = await fetch(`/api/files?path=${path}`, { method: 'DELETE' });
        if (res.ok) {
            setFiles(files.filter(f => f.path !== path));
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif">Reviews Log</h1>
                <div className="space-x-4">
                    <Link href="/reviews/new?type=daily" className="btn">New Daily</Link>
                    <Link href="/reviews/new?type=weekly" className="btn bg-[var(--surface)] text-[var(--fg)] border border-[var(--glass-border)]">New Weekly</Link>
                </div>
            </div>

            <div className="glass-card">
                <div className="grid grid-cols-12 border-b border-[var(--border)] p-4 text-xs font-bold uppercase text-[var(--muted)] opacity-70">
                    <span className="col-span-5">Date/Name</span>
                    <span className="col-span-3">Type</span>
                    <span className="col-span-2">Energy</span>
                    <span className="col-span-2 text-right">Action</span>
                </div>
                {files.map(file => {
                    const type = file.path.includes('daily') ? 'Daily' : file.path.includes('weekly') ? 'Weekly' : 'Quarterly';
                    return (
                        <div key={file.path} className="grid grid-cols-12 p-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]/5 transition-colors text-sm items-center group">
                            <span className="col-span-5 font-mono opacity-90">{file.name.replace('.md', '')}</span>
                            <span className="col-span-3 opacity-70 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${type === 'Daily' ? 'bg-blue-400' : type === 'Weekly' ? 'bg-purple-400' : 'bg-orange-400'}`}></span>
                                {type}
                            </span>
                            <span className="col-span-2 font-mono opacity-60">{file.energyLevel || '-'}</span>
                            <div className="col-span-2 flex justify-end gap-3 items-center">
                                <Link href={`/library/file?path=${encodeURIComponent(file.path)}`} className="text-[var(--accent)] hover:underline font-bold text-xs uppercase tracking-wider">
                                    View
                                </Link>
                                <button
                                    onClick={() => handleDelete(file.path)}
                                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    )
                })}
                {files.length === 0 && <div className="p-8 text-center text-[var(--muted)] italic">No logs found. Start your first cycle.</div>}
            </div>
        </div>
    );
}
