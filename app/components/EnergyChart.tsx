'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function EnergyChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-[var(--muted)] text-xs">No data</div>;

    return (
        <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={100}>
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        dot={{ r: 2, fill: 'var(--accent)', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
