'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, ArrowRight, ArrowLeft, Sparkles, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Task = { id: number; text: string; quadrant?: string };

export default function EisenhowerWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [matrix, setMatrix] = useState<{ q1: Task[], q2: Task[], q3: Task[], q4: Task[] }>({ q1: [], q2: [], q3: [], q4: [] });

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask }]);
        setNewTask('');
    };

    const removeTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleCategorize = async () => {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            alert("Please configure API Key in Settings first.");
            return;
        }

        setAiLoading(true);

        const taskList = tasks.map(t => t.text).join('\n- ');

        const prompt = `You are a productivity expert. Categorize these tasks into the Eisenhower Matrix.

TASKS:
- ${taskList}

Respond ONLY with valid JSON in this exact format:
{
  "q1": ["task text 1", "task text 2"],
  "q2": ["task text 3"],
  "q3": ["task text 4"],
  "q4": ["task text 5"]
}

Where:
- q1 = Urgent + Important (DO FIRST)
- q2 = Not Urgent + Important (SCHEDULE)
- q3 = Urgent + Not Important (DELEGATE)
- q4 = Not Urgent + Not Important (ELIMINATE)

Each task should appear exactly once.`;

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const result = await res.json();
            const content = result.choices?.[0]?.message?.content || "{}";

            // Parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setMatrix({
                    q1: (parsed.q1 || []).map((t: string, i: number) => ({ id: i, text: t })),
                    q2: (parsed.q2 || []).map((t: string, i: number) => ({ id: i + 100, text: t })),
                    q3: (parsed.q3 || []).map((t: string, i: number) => ({ id: i + 200, text: t })),
                    q4: (parsed.q4 || []).map((t: string, i: number) => ({ id: i + 300, text: t }))
                });
                setStep(2);
            }
        } catch (e) {
            alert("AI connection failed.");
        }
        setAiLoading(false);
    };

    const quadrantStyles = {
        q1: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'DO FIRST', sublabel: 'Urgent + Important' },
        q2: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'SCHEDULE', sublabel: 'Important, Not Urgent' },
        q3: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'DELEGATE', sublabel: 'Urgent, Not Important' },
        q4: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: 'ELIMINATE', sublabel: 'Neither' }
    };

    const steps = [
        // Step 0: Intro
        (
            <div className="text-center space-y-8 max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <Grid3X3 className="text-emerald-500" size={40} />
                </div>
                <h1 className="text-4xl font-serif font-bold">Eisenhower Matrix</h1>
                <p className="text-[var(--muted)]">
                    Separate the urgent from the important. List your tasks and we'll categorize them into the four quadrants.
                </p>
                <button onClick={() => setStep(1)} className="btn-primary text-lg px-8 py-4">
                    Add Tasks <ArrowRight className="ml-2" size={18} />
                </button>
            </div>
        ),
        // Step 1: Add Tasks
        (
            <div className="max-w-xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif font-bold">List your tasks</h2>
                <p className="text-[var(--muted)]">Add all the tasks on your mind. We'll sort them.</p>

                <div className="flex gap-2">
                    <input
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                        placeholder="Add a task..."
                        className="flex-1 px-4 py-3 bg-[var(--bg-app)] border border-[var(--glass-border)] rounded-xl outline-none focus:border-[var(--accent)]"
                    />
                    <button onClick={addTask} className="btn-primary px-4"><Plus size={18} /></button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-[var(--bg-app)] rounded-lg group">
                            <span className="text-sm">{task.text}</span>
                            <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 transition-opacity">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {tasks.length === 0 && <p className="text-center text-[var(--muted)] text-sm py-8">No tasks yet. Add some above.</p>}
                </div>

                <div className="flex justify-between">
                    <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft size={16} className="mr-2" /> Back</button>
                    <button onClick={handleCategorize} disabled={tasks.length < 2 || aiLoading} className="btn-primary">
                        {aiLoading ? 'Categorizing...' : <><Sparkles size={16} className="mr-2" /> Categorize</>}
                    </button>
                </div>
            </div>
        ),
        // Step 2: Matrix Result
        (
            <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-3xl font-serif font-bold text-center">Your Prioritized Matrix</h2>

                <div className="grid grid-cols-2 gap-4">
                    {(['q1', 'q2', 'q3', 'q4'] as const).map(q => (
                        <div key={q} className={`p-4 rounded-xl border ${quadrantStyles[q].bg} ${quadrantStyles[q].border}`}>
                            <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{quadrantStyles[q].label}</h3>
                            <p className="text-xs text-[var(--muted)] mb-3">{quadrantStyles[q].sublabel}</p>
                            <ul className="space-y-2">
                                {matrix[q].map(task => (
                                    <li key={task.id} className="text-sm p-2 bg-white/50 dark:bg-black/20 rounded">{task.text}</li>
                                ))}
                                {matrix[q].length === 0 && <li className="text-xs text-[var(--muted)] italic">None</li>}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button onClick={() => { setTasks([]); setMatrix({ q1: [], q2: [], q3: [], q4: [] }); setStep(1); }} className="btn-ghost flex-1">
                        New Matrix
                    </button>
                    <button onClick={() => router.push('/tools')} className="btn flex-1">
                        Back to Tools
                    </button>
                </div>
            </div>
        )
    ];

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {steps[step]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
