'use client';
import { useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface Task {
    id: string;
    name: string;
    impact: 'High' | 'Low';
    effort: 'High' | 'Low';
}

export default function LeverageLab() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [impact, setImpact] = useState<'High' | 'Low'>('High');
    const [effort, setEffort] = useState<'High' | 'Low'>('Low');

    const addTask = () => {
        if (!newTask.trim()) return;
        const task: Task = {
            id: Math.random().toString(36).substr(2, 9),
            name: newTask,
            impact,
            effort
        };
        setTasks([...tasks, task]);
        setNewTask('');
    };

    const removeTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const getQuadrant = (i: string, e: string) => {
        if (i === 'High' && e === 'Low') return 'DO (Quick Wins)';
        if (i === 'High' && e === 'High') return 'DEFER (Projects)';
        if (i === 'Low' && e === 'Low') return 'DELEGATE (Tasks)';
        if (i === 'Low' && e === 'High') return 'DELETE (Time Wasters)';
    };

    const Quadrant = ({ i, e, color }: { i: string, e: string, color: string }) => {
        const title = getQuadrant(i, e);
        const qTasks = tasks.filter(t => t.impact === i && t.effort === e);

        return (
            <div className={`card h-full min-h-[200px] border-t-4`} style={{ borderTopColor: color }}>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4 opacity-70">{title}</h3>
                <ul className="space-y-2">
                    {qTasks.map(t => (
                        <li key={t.id} className="flex justify-between items-start group text-sm">
                            <span>{t.name}</span>
                            <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-500">
                                <Trash2 size={14} />
                            </button>
                        </li>
                    ))}
                    {qTasks.length === 0 && <li className="text-[var(--muted)] text-xs italic">Empty</li>}
                </ul>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif">The Leverage Lab</h1>
                <p className="text-[var(--muted)]">Input thoughts, define physics, get strategy.</p>
            </div>

            {/* Input Section */}
            <div className="card bg-[var(--surface)] flex gap-4 items-end">
                <div className="flex-1">
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2">Task</label>
                    <input
                        className="w-full p-2"
                        placeholder="What needs doing?"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2">Impact</label>
                    <select className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" value={impact} onChange={(e: any) => setImpact(e.target.value)}>
                        <option>High</option>
                        <option>Low</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider block mb-2">Effort</label>
                    <select className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded" value={effort} onChange={(e: any) => setEffort(e.target.value)}>
                        <option>High</option>
                        <option>Low</option>
                    </select>
                </div>
                <button onClick={addTask} className="btn h-[42px]"><Plus size={18} /> Add</button>
            </div>

            {/* The Matrix */}
            <div className="grid grid-cols-2 gap-6 h-[500px]">
                <Quadrant i="High" e="Low" color="#22c55e" />     {/* Green - DO */}
                <Quadrant i="High" e="High" color="#3b82f6" />    {/* Blue - DEFER */}
                <Quadrant i="Low" e="Low" color="#eab308" />     {/* Yellow - DELEGATE */}
                <Quadrant i="Low" e="High" color="#ef4444" />    {/* Red - DELETE */}
            </div>
        </div>
    );
}
