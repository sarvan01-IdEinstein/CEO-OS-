'use client';
import { eachDayOfInterval, subDays, format, isSameDay } from 'date-fns';
import clsx from 'clsx';

export default function Heatmap({ dates }: { dates: { date: string, energy: number }[] }) {
    const today = new Date();
    const days = eachDayOfInterval({
        start: subDays(today, 364), // Last year
        end: today
    });

    // Group by weeks for the grid
    // Simplified: Just show last 4 months (approx 120 days) to fit nicely or a shorter grid.
    // Let's do a flex-wrap grid of small squares.
    const shortDays = days.slice(-120); // Last 4 months

    const getColor = (energy: number) => {
        if (energy >= 8) return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"; // High
        if (energy >= 5) return "bg-amber-400"; // Medium
        if (energy > 0) return "bg-rose-400"; // Low
        return "bg-[var(--border)] opacity-20 hover:opacity-50"; // Empty
    };

    return (
        <div className="flex flex-wrap gap-[3px] w-full justify-end">
            {shortDays.map(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const entry = dates.find(d => d.date === dayStr);
                const energy = entry?.energy || 0;
                const hasEntry = !!entry;

                return (
                    <div
                        key={dayStr}
                        title={`${dayStr} — Energy: ${energy}/10`}
                        className={clsx(
                            "w-2.5 h-2.5 rounded-[2px] transition-all duration-300",
                            getColor(energy),
                            hasEntry && "hover:scale-125 hover:z-10"
                        )}
                        style={{
                            opacity: hasEntry ? 1 : undefined
                        }}
                    />
                )
            })}
        </div>
    );
}
