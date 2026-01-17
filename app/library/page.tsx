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
            <h1 className="text-2xl sm:text-3xl font-serif mb-6 sm:mb-8">System Library</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {folders.map(f => {
                    const isFile = f.path.endsWith('.md');
                    const href = isFile ? `/library/file?path=${f.path}` : `/library/folder?path=${f.path}`;
                    return (
                        <Link key={f.name} href={href} className="card flex flex-col sm:flex-row items-center gap-2 sm:gap-4 hover:border-[var(--accent)] group p-4">
                            <div className="bg-[var(--bg)] p-2 sm:p-3 rounded text-[var(--muted)] group-hover:text-[var(--accent)]">
                                <Folder size={20} />
                            </div>
                            <span className="font-medium text-sm sm:text-lg text-center sm:text-left">{f.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}
