'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

function FolderPageContent() {
    const searchParams = useSearchParams();
    const path = searchParams.get('path');
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        if (!path) return;
        async function load() {
            const res = await fetch(`/api/files?type=list&path=${encodeURIComponent(path as string)}`);
            const data = await res.json();
            if (Array.isArray(data)) setFiles(data);
        }
        load();
    }, [path]);

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Link href="/library" className="text-[var(--muted)] hover:text-[var(--fg)]">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold capitalize">{path}</h1>
            </div>

            {/* File Grid - responsive columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {files.map(f => (
                    <Link
                        key={f.name}
                        href={`/library/file?path=${f.path}`}
                        className="card hover:bg-[var(--surface)] transition-colors p-4"
                    >
                        <div className="flex flex-col items-center text-center gap-2 sm:gap-4">
                            <FileText size={24} className="text-[var(--muted)] sm:w-8 sm:h-8" />
                            <span className="font-medium text-xs sm:text-sm break-all line-clamp-2">{f.name}</span>
                        </div>
                    </Link>
                ))}
                {files.length === 0 && <p className="col-span-full text-[var(--muted)] italic">No files found.</p>}
            </div>
        </div>
    );
}

export default function FolderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FolderPageContent />
        </Suspense>
    );
}
