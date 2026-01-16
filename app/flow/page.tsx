'use client';
import { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeepWorkFlow() {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [objective, setObjective] = useState('');
    const [distractions, setDistractions] = useState<string[]>([]);
    const [distractionInput, setDistractionInput] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(false);

    useEffect(() => {
        // Smart Objective Fetching
        const fetchObjective = async () => {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // 1. Try Today's File (Morning Prime)
            let res = await fetch(`/api/files?type=file&path=reviews/daily/${today}.md`);
            let data = await res.json();

            // 2. If no today, try Yesterday (Evening Review)
            if (!data.content) {
                res = await fetch(`/api/files?type=file&path=reviews/daily/${yesterday}.md`);
                data = await res.json();
            }

            if (data.content) {
                // Regex to find "Priority for Tomorrow" (Field 4)
                const match = data.content.match(/4\. \*\*.*Priority.*\*\*:\n\s+-\s+(.*)/);
                if (match && match[1]) {
                    setObjective(match[1].trim());
                }
            }
        };

        fetchObjective();

        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleSound = () => {
        // Ideally we play a real audio file here. For now, visual toggle.
        setSoundEnabled(!soundEnabled);
    };

    const addDistraction = () => {
        if (!distractionInput) return;
        setDistractions([...distractions, distractionInput]);
        setDistractionInput('');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-[#000] text-white z-[100] flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-black opacity-50 z-0 pointer-events-none"></div>
            {soundEnabled && <div className="absolute inset-0 z-0 bg-blue-900/10 animate-pulse"></div>}

            <div className="relative z-10 w-full max-w-4xl p-8 grid grid-cols-12 gap-12 h-screen max-h-[800px]">

                {/* Center: The Focus */}
                <div className="col-span-8 flex flex-col justify-center text-center space-y-12">
                    <div>
                        <input
                            value={objective}
                            onChange={e => setObjective(e.target.value)}
                            placeholder="What is the One Thing?"
                            className="text-4xl md:text-5xl font-serif text-center bg-transparent outline-none placeholder:opacity-20 w-full"
                        />
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-[12rem] leading-none font-mono font-bold tracking-tighter tabular-nums opacity-90">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className="bg-white text-black rounded-full px-8 py-4 font-bold text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                {isActive ? <Pause /> : <Play />}
                                {isActive ? 'PAUSE' : 'ENGAGE'}
                            </button>
                            <button
                                onClick={() => setTimeLeft(60 * 60)}
                                className="px-6 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-all font-mono"
                            >
                                <Square size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Distraction Trap */}
                <div className="col-span-4 border-l border-white/10 pl-8 flex flex-col h-full justify-center">
                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Environment</h3>
                        <button onClick={toggleSound} className="flex items-center gap-3 text-sm opacity-70 hover:opacity-100 transition-opacity">
                            {soundEnabled ? <Volume2 size={16} className="text-blue-400" /> : <VolumeX size={16} />}
                            {soundEnabled ? 'Binaural Beats: ON' : 'Silence Mode'}
                        </button>
                    </div>

                    <div className="flex-1 bg-white/5 rounded-2xl p-6 flex flex-col">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Distraction Trap</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                            {distractions.map((d, i) => (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={i} className="text-sm p-2 bg-white/5 rounded flex items-center gap-2">
                                    <CheckCircle size={12} className="opacity-50" />
                                    <span className="opacity-80 line-through decoration-white/30">{d}</span>
                                </motion.div>
                            ))}
                            {distractions.length === 0 && <p className="text-xs italic opacity-30">Offload stray thoughts here...</p>}
                        </div>
                        <div>
                            <input
                                value={distractionInput}
                                onChange={e => setDistractionInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addDistraction()}
                                placeholder="Catch a thought..."
                                className="w-full bg-transparent border-b border-white/20 p-2 outline-none text-sm placeholder:opacity-30 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
