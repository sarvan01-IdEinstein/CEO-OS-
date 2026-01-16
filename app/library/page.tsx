import Link from 'next/link';
import { Folder } from 'lucide-react';

export default function LibraryPage() {
    const folders = [
        { name: 'Principles', path: 'principles.md' },
        { name: 'North Star', path: 'north_star.md' },
        { name: 'System Memory', path: 'memory.md' },
        { name: 'Frameworks', path: 'frameworks' },
        { name: 'Goals', path: 'goals' },
        { name: 'Interviews', path: 'interviews' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-serif mb-8">System Library</h1>
            <div className="grid grid-cols-3 gap-4">
                {folders.map(f => {
                    const isFile = f.path.endsWith('.md');
                    const href = isFile ? `/library/file?path=${f.path}` : `/library/folder?path=${f.path}`;
                    return (
                        <Link key={f.name} href={href} className="card flex items-center gap-4 hover:border-[var(--accent)] group">
                            <div className="bg-[var(--bg)] p-3 rounded text-[var(--muted)] group-hover:text-[var(--accent)]">
                                <Folder />
                            </div>
                            <span className="font-medium text-lg">{f.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}
