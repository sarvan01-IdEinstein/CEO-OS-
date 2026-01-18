'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function EnergyChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-[var(--muted)] text-xs">No data</div>;

    return (
        <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={100}>
                <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 10]} hide />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: 'var(--fg)' }}
                        formatter={(value: any) => [value, 'Energy']}
                    />
                    <Area
                        type="monotone"
                        dataKey="energy"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEnergy)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
