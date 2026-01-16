'use client';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { LifeMapScores } from '@/lib/types';

export default function LifeMapRadar({ scores }: { scores: LifeMapScores }) {
    const data = [
        { subject: 'Career', A: scores.career, fullMark: 10 },
        { subject: 'Health', A: scores.health, fullMark: 10 },
        { subject: 'Finances', A: scores.finances, fullMark: 10 },
        { subject: 'Fun', A: scores.fun, fullMark: 10 },
        { subject: 'Relationships', A: scores.relationships, fullMark: 10 },
        { subject: 'Meaning', A: scores.meaning, fullMark: 10 },
    ];

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                        name="Life Map"
                        dataKey="A"
                        stroke="var(--fg)"
                        strokeWidth={2}
                        fill="var(--accent)"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
