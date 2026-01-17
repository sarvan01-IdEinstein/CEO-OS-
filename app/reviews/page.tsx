'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Trash2, FileDown } from 'lucide-react';
import { exportReviewToPDF } from '@/lib/export/pdf';

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
            {/* Header - stacks on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-serif">Reviews Log</h1>
                <div className="flex flex-wrap gap-2">
                    <Link href="/reviews/new?type=daily" className="btn text-sm">New Daily</Link>
                    <Link href="/reviews/new?type=weekly" className="btn bg-[var(--surface)] text-[var(--fg)] border border-[var(--glass-border)] text-sm">New Weekly</Link>
                </div>
            </div>

            <div className="glass-card overflow-x-auto">
                {/* Table Header - hide some columns on mobile */}
                <div className="hidden sm:grid grid-cols-12 border-b border-[var(--border)] p-4 text-xs font-bold uppercase text-[var(--muted)] opacity-70 min-w-[400px]">
                    <span className="col-span-5">Date/Name</span>
                    <span className="col-span-3">Type</span>
                    <span className="col-span-2">Energy</span>
                    <span className="col-span-2 text-right">Action</span>
                </div>

                {/* Mobile-friendly card list */}
                {files.map(file => {
                    const type = file.path.includes('daily') ? 'Daily' : file.path.includes('weekly') ? 'Weekly' : 'Quarterly';
                    return (
                        <div key={file.path} className="p-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]/5 transition-colors group">
                            {/* Mobile Layout */}
                            <div className="sm:hidden space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-sm font-medium">{file.name.replace('.md', '')}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${type === 'Daily' ? 'bg-blue-500/20 text-blue-400' : type === 'Weekly' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {type}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted)]">Energy: {file.energyLevel || '-'}</span>
                                    <div className="flex gap-3">
                                        <Link href={`/library/file?path=${encodeURIComponent(file.path)}`} className="text-[var(--accent)] font-bold text-xs uppercase">View</Link>
                                        <button onClick={() => exportReviewToPDF(file.path)} className="text-green-400 p-1" title="Export PDF">
                                            <FileDown size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(file.path)} className="text-red-400 p-1">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden sm:grid grid-cols-12 text-sm items-center">
                                <span className="col-span-5 font-mono opacity-90">{file.name.replace('.md', '')}</span>
                                <span className="col-span-3 opacity-70 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${type === 'Daily' ? 'bg-blue-400' : type === 'Weekly' ? 'bg-purple-400' : 'bg-orange-400'}`}></span>
                                    {type}
                                </span>
                                <span className="col-span-2 font-mono opacity-60">{file.energyLevel || '-'}</span>
                                <div className="col-span-2 flex justify-end gap-2 items-center">
                                    <Link href={`/library/file?path=${encodeURIComponent(file.path)}`} className="text-[var(--accent)] hover:underline font-bold text-xs uppercase tracking-wider">
                                        View
                                    </Link>
                                    <button
                                        onClick={() => exportReviewToPDF(file.path)}
                                        className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-green-500/10 rounded"
                                        title="Export as PDF"
                                    >
                                        <FileDown size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.path)}
                                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {files.length === 0 && <div className="p-8 text-center text-[var(--muted)] italic">No logs found. Start your first cycle.</div>}
            </div>
        </div>
    );
}
