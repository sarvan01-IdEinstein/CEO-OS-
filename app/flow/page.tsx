'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, CheckCircle, Volume2, VolumeX, Maximize2, X, Settings, Zap, CloudRain, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

type SoundMode = 'off' | 'gamma' | 'alpha' | 'rain' | 'brown';

export default function DeepWorkFlow() {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [objective, setObjective] = useState('');
    const [distractions, setDistractions] = useState<string[]>([]);
    const [distractionInput, setDistractionInput] = useState('');

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
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

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
            <div className={`absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-black opacity-50 z-0 pointer-events-none transition-all duration-1000 ${soundMode === 'gamma' ? 'bg-indigo-900/20' : soundMode === 'alpha' ? 'bg-emerald-900/20' : ''}`}></div>

            {/* Exit Button */}
            <button
                onClick={() => window.location.href = '/'}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[110] text-white/30 hover:text-white transition-colors flex items-center gap-2 group"
            >
                <div className="p-2 border border-white/20 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                    <X size={16} />
                </div>
            </button>

            <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 py-8 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 h-full overflow-y-auto">

                {/* Center: The Focus */}
                <div className="lg:col-span-8 flex flex-col justify-center text-center space-y-8 sm:space-y-12 py-8 lg:py-0">
                    <div>
                        <input
                            value={objective}
                            onChange={e => setObjective(e.target.value)}
                            placeholder="What is the One Thing?"
                            className="text-xl sm:text-3xl md:text-5xl font-serif text-center bg-transparent outline-none placeholder:opacity-20 w-full"
                        />
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-6xl sm:text-8xl lg:text-[12rem] leading-none font-mono font-bold tracking-tighter tabular-nums opacity-90">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex gap-4 mt-6 sm:mt-8">
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className="bg-white text-black rounded-full px-6 sm:px-8 py-3 sm:py-4 font-bold text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                {isActive ? <Pause /> : <Play />}
                                {isActive ? 'PAUSE' : 'ENGAGE'}
                            </button>
                            <button
                                onClick={() => setTimeLeft(60 * 60)}
                                className="px-4 sm:px-6 py-3 sm:py-4 rounded-full border border-white/20 hover:bg-white/10 transition-all font-mono"
                            >
                                <Square size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Environment & Distractions - moves to bottom on mobile */}
                <div className="lg:col-span-4 lg:border-l border-white/10 lg:pl-8 flex flex-col pb-8 lg:pb-0 lg:h-full justify-center">

                    {/* Audio Controls */}
                    <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                            <Volume2 size={12} /> Neuro-Audio
                        </h3>

                        <div className="space-y-2">
                            <button onClick={() => setSoundMode('gamma')} className={`w-full text-left px-3 py-2 text-sm rounded transition-all flex items-center gap-3 ${soundMode === 'gamma' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                <Zap size={14} /> Deep Focus (40Hz)
                            </button>
                            <button onClick={() => setSoundMode('alpha')} className={`w-full text-left px-3 py-2 text-sm rounded transition-all flex items-center gap-3 ${soundMode === 'alpha' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                <Brain size={14} /> Creative Flow (10Hz)
                            </button>
                            <button onClick={() => setSoundMode('rain')} className={`w-full text-left px-3 py-2 text-sm rounded transition-all flex items-center gap-3 ${soundMode === 'rain' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                <CloudRain size={14} /> Pink Noise
                            </button>
                            <button onClick={() => setSoundMode('brown')} className={`w-full text-left px-3 py-2 text-sm rounded transition-all flex items-center gap-3 ${soundMode === 'brown' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                <Zap size={14} className="rotate-180" /> Brown Noise
                            </button>

                            {soundMode !== 'off' && (
                                <div className="pt-2 flex items-center gap-2">
                                    <button onClick={() => setSoundMode('off')} className="text-xs text-white/40 hover:text-white uppercase tracking-wider">Turn Off</button>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 bg-white/5 rounded-2xl p-6 flex flex-col min-h-0">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Distraction Trap</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
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
