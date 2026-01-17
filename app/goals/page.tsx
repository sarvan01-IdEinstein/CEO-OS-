import { getFile } from '@/lib/api';
import Editor from '@/app/components/Editor'; // We might use a read-only view or just text

export default async function GoalsPage() {
    const y1 = await getFile('goals/1_year.md');
    const y3 = await getFile('goals/3_year.md');
    const y10 = await getFile('goals/10_year.md');

    return (
        <div className="space-y-12">
            <h1 className="text-3xl font-serif">Strategy Deck</h1>

            <div className="grid grid-cols-3 gap-8">
                <GoalCard title="1 Year Execution" file={y1} />
                <GoalCard title="3 Year Vision" file={y3} />
                <GoalCard title="10 Year Direction" file={y10} />
            </div>
        </div>
    );
}

function GoalCard({ title, file }: any) {
    if (!file) return null;
    // Simple content preview
    const preview = file.content.slice(0, 300) + '...';

    return (
        <div className="card h-[400px] flex flex-col hover:border-[var(--accent)] transition-colors">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="flex-1 overflow-hidden relative">
                <p className="whitespace-pre-wrap text-sm text-[var(--muted)] font-mono leading-relaxed">
                    {preview}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[var(--surface)] to-transparent"></div>
            </div>
            <a href={`/library/file?path=${encodeURIComponent(file.path)}`} className="mt-4 btn-ghost w-full text-center py-2 text-sm">Open File</a>
        </div>
    )
}
