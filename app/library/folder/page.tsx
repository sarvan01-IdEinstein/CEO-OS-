'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

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
        <div>
            <h1 className="text-2xl font-bold mb-8 capitalize">{path}</h1>
            <div className="grid grid-cols-4 gap-4">
                {files.map(f => (
                    <Link key={f.name} href={`/library/file?path=${f.path}`} className="card hover:bg-[var(--surface)] transition-colors">
                        <div className="flex flex-col items-center text-center gap-4">
                            <FileText size={32} className="text-[var(--muted)]" />
                            <span className="font-medium">{f.name}</span>
                        </div>
                    </Link>
                ))}
                {files.length === 0 && <p>No files found.</p>}
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
