'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, CheckCircle, Volume2, VolumeX, Maximize2, X, Settings, Zap, CloudRain, Brain, Timer, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

type SoundMode = 'off' | 'gamma' | 'alpha' | 'rain' | 'brown';
type TimerMode = 'flow' | 'pomodoro';

export default function DeepWorkFlow() {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [objective, setObjective] = useState('');
    const [distractions, setDistractions] = useState<string[]>([]);
    const [distractionInput, setDistractionInput] = useState('');

    // Pomodoro State
    const [timerMode, setTimerMode] = useState<TimerMode>('flow');
    const [isBreak, setIsBreak] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const POMODORO_WORK = 25 * 60; // 25 minutes
    const POMODORO_BREAK = 5 * 60; // 5 minutes
    const POMODORO_LONG_BREAK = 15 * 60; // 15 minutes after 4 pomodoros

    // Audio State
    const [soundMode, setSoundMode] = useState<SoundMode>('off');
    const [volume, setVolume] = useState(0.5);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const oscillatorsRef = useRef<AudioNode[]>([]);

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

        // Timer completed - handle Pomodoro transitions
        if (isActive && timeLeft === 0 && timerMode === 'pomodoro') {
            // Play completion sound
            playCompletionSound();

            if (isBreak) {
                // Break is over, start new work session
                setIsBreak(false);
                setTimeLeft(POMODORO_WORK);
            } else {
                // Work session completed
                const newCount = pomodoroCount + 1;
                setPomodoroCount(newCount);
                setIsBreak(true);
                // Long break every 4 pomodoros
                setTimeLeft(newCount % 4 === 0 ? POMODORO_LONG_BREAK : POMODORO_BREAK);
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, timerMode, isBreak, pomodoroCount]);

    // Play completion sound
    const playCompletionSound = () => {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not available');
        }
    };

    // --- AUDIO ENGINE ---
    useEffect(() => {
        if (soundMode === 'off') {
            stopAudio();
            return;
        }

        // Init Context if needed
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const gain = audioCtxRef.current.createGain();
            gain.connect(audioCtxRef.current.destination);
            gainNodeRef.current = gain;
        }

        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        // Update Volume
        if (gainNodeRef.current) gainNodeRef.current.gain.value = volume;

        // Stop previous sounds
        stopAudio(false);

        // Start new sound
        if (soundMode === 'gamma' || soundMode === 'alpha') {
            playBinaural(soundMode);
        } else if (soundMode === 'rain') {
            playPinkNoise();
        } else if (soundMode === 'brown') {
            playBrownNoise();
        }

        return () => stopAudio(true); // Cleanup on unmount
    }, [soundMode]);

    // Volume Effect
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current?.currentTime || 0, 0.1);
        }
    }, [volume]);

    const stopAudio = (closeCtx = false) => {
        oscillatorsRef.current.forEach(osc => {
            try { (osc as any).stop(); } catch (e) { }
            osc.disconnect();
        });
        oscillatorsRef.current = [];
        if (closeCtx && audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
    };

    const playBinaural = (mode: 'gamma' | 'alpha') => {
        if (!audioCtxRef.current || !gainNodeRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;

        // Base Frequency (Carrier)
        const carrier = 200;
        const diff = mode === 'gamma' ? 40 : 10; // 40Hz Gamma (Focus), 10Hz Alpha (Creative)

        // Left Ear
        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(carrier, now);
        const panL = ctx.createStereoPanner();
        panL.pan.setValueAtTime(-1, now);

        // Right Ear
        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(carrier + diff, now);
        const panR = ctx.createStereoPanner();
        panR.pan.setValueAtTime(1, now);

        oscL.connect(panL).connect(gainNodeRef.current);
        oscR.connect(panR).connect(gainNodeRef.current);

        oscL.start();
        oscR.start();

        oscillatorsRef.current.push(oscL, oscR, panL, panR);
    };

    const playPinkNoise = () => {
        if (!audioCtxRef.current || !gainNodeRef.current) return;
        const ctx = audioCtxRef.current;
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Pink Noise Algorithm
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        noise.connect(gainNodeRef.current);
        noise.start();
        oscillatorsRef.current.push(noise);
    };

    const playBrownNoise = () => {
        if (!audioCtxRef.current || !gainNodeRef.current) return;
        const ctx = audioCtxRef.current;
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Brown Noise Algorithm (1/f^2)
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Gain compensation
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        noise.connect(gainNodeRef.current);
        noise.start();
        oscillatorsRef.current.push(noise);
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
            <div className={`absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-black opacity-50 z-0 pointer-events-none transition-all duration-1000 ${soundMode === 'gamma' ? 'bg-indigo-900/20' : soundMode === 'alpha' ? 'bg-emerald-900/20' : ''}`}></div>

            {/* Exit Button */}
            <button
                onClick={() => window.location.href = '/'}
                className="absolute top-6 right-6 sm:top-10 sm:right-10 z-[110] text-white/30 hover:text-white transition-colors flex items-center gap-2 group"
            >
                <div className="p-3 border border-white/20 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                    <X size={18} />
                </div>
            </button>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 flex flex-col h-full overflow-y-auto lg:overflow-visible">

                {/* Main Timer Section - Centered */}
                <div className="flex-1 flex flex-col justify-center items-center text-center py-8 lg:py-16">

                    {/* Objective Input */}
                    <div className="w-full max-w-3xl mb-8">
                        <input
                            value={objective}
                            onChange={e => setObjective(e.target.value)}
                            placeholder="What is the One Thing?"
                            className="text-2xl sm:text-4xl lg:text-6xl font-serif text-center bg-transparent outline-none placeholder:opacity-20 w-full tracking-tight"
                        />
                    </div>

                    {/* Pomodoro Mode Indicator */}
                    {timerMode === 'pomodoro' && (
                        <div className={`mb-6 px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-3 ${isBreak ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                            {isBreak ? <Coffee size={18} /> : <Timer size={18} />}
                            {isBreak ? 'Break Time — Recharge' : `Focus Session ${pomodoroCount + 1}`}
                        </div>
                    )}

                    {/* Giant Timer */}
                    <div className="text-7xl sm:text-9xl lg:text-[14rem] leading-none font-mono font-bold tracking-tighter tabular-nums text-white/90 mb-10">
                        {formatTime(timeLeft)}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="bg-white text-black rounded-full px-10 py-5 font-bold text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl shadow-white/10"
                        >
                            {isActive ? <Pause size={24} /> : <Play size={24} />}
                            {isActive ? 'PAUSE' : 'ENGAGE'}
                        </button>
                        <button
                            onClick={() => {
                                setIsActive(false);
                                setIsBreak(false);
                                setTimeLeft(timerMode === 'pomodoro' ? POMODORO_WORK : 60 * 60);
                            }}
                            className="px-6 py-5 rounded-full border-2 border-white/20 hover:bg-white/10 transition-all"
                        >
                            <Square size={22} />
                        </button>
                    </div>

                    {/* Timer Mode Toggle */}
                    <div className="flex gap-1 bg-white/5 rounded-full p-1.5 border border-white/10">
                        <button
                            onClick={() => { setTimerMode('flow'); setTimeLeft(60 * 60); setPomodoroCount(0); setIsBreak(false); setIsActive(false); }}
                            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${timerMode === 'flow' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            Flow (60min)
                        </button>
                        <button
                            onClick={() => { setTimerMode('pomodoro'); setTimeLeft(POMODORO_WORK); setPomodoroCount(0); setIsBreak(false); setIsActive(false); }}
                            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${timerMode === 'pomodoro' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                        >
                            <Timer size={16} /> Pomodoro
                        </button>
                    </div>

                    {timerMode === 'pomodoro' && pomodoroCount > 0 && (
                        <div className="mt-6 text-white/50 text-base font-medium">🍅 {pomodoroCount} pomodoro{pomodoroCount > 1 ? 's' : ''} completed</div>
                    )}

                    {/* Audio & Distraction - Side by Side */}
                    <div className="mt-10 flex flex-col lg:flex-row gap-6 w-full max-w-4xl">

                        {/* Audio Controls */}
                        <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4 flex items-center gap-2">
                                <Volume2 size={14} /> Neuro-Audio
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setSoundMode('gamma')} className={`text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center gap-3 ${soundMode === 'gamma' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'}`}>
                                    <Zap size={16} /> Deep Focus
                                </button>
                                <button onClick={() => setSoundMode('alpha')} className={`text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center gap-3 ${soundMode === 'alpha' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'}`}>
                                    <Brain size={16} /> Creative
                                </button>
                                <button onClick={() => setSoundMode('rain')} className={`text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center gap-3 ${soundMode === 'rain' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'}`}>
                                    <CloudRain size={16} /> Pink Noise
                                </button>
                                <button onClick={() => setSoundMode('brown')} className={`text-left px-4 py-3 text-sm rounded-xl transition-all flex items-center gap-3 ${soundMode === 'brown' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'}`}>
                                    <Zap size={16} className="rotate-180" /> Brown
                                </button>
                            </div>

                            {soundMode !== 'off' && (
                                <div className="pt-4 flex items-center gap-4">
                                    <button onClick={() => setSoundMode('off')} className="text-xs text-white/40 hover:text-white uppercase tracking-wider font-medium">Off</button>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                                        className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Distraction Trap - Matching Style */}
                        <div className="flex-1 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm flex flex-col">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4 flex items-center gap-2">
                                <CheckCircle size={14} /> Distraction Trap
                            </h3>

                            <div className="flex-1 space-y-2 mb-4 min-h-[80px]">
                                {distractions.slice(0, 3).map((d, i) => (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={i} className="text-sm p-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5">
                                        <CheckCircle size={14} className="text-emerald-500/70 shrink-0" />
                                        <span className="opacity-70 line-through decoration-white/30 truncate">{d}</span>
                                    </motion.div>
                                ))}
                                {distractions.length === 0 && (
                                    <p className="text-sm italic opacity-30 p-3">Offload stray thoughts here...</p>
                                )}
                                {distractions.length > 3 && (
                                    <p className="text-xs text-white/40">+{distractions.length - 3} more</p>
                                )}
                            </div>

                            <input
                                value={distractionInput}
                                onChange={e => setDistractionInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addDistraction()}
                                placeholder="Catch a thought..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-sm placeholder:opacity-40 focus:border-white/30 transition-colors"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
