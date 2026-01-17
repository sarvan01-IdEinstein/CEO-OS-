'use client';
import { useState, useEffect } from 'react';
import { Save, Lock, Eye, EyeOff, Server, Cloud, RefreshCw } from 'lucide-react';
import { getAISettings, saveAISettings, getOllamaModels, AIProvider } from '@/lib/ai';

export default function SettingsPage() {
    const [provider, setProvider] = useState<AIProvider>('ollama');
    const [model, setModel] = useState('llama3.2');
    const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    useEffect(() => {
        const settings = getAISettings();
        setProvider(settings.provider);
        setModel(settings.model);
        setOllamaEndpoint(settings.ollamaEndpoint);
        setApiKey(settings.openaiApiKey);

        // Load available models
        refreshModels(settings.ollamaEndpoint);
    }, []);

    const refreshModels = async (endpoint?: string) => {
        setLoadingModels(true);
        const models = await getOllamaModels(endpoint || ollamaEndpoint);
        setAvailableModels(models);
        setLoadingModels(false);
    };

    const handleSave = () => {
        saveAISettings({
            provider,
            model,
            ollamaEndpoint,
            openaiApiKey: apiKey
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto pt-6 sm:pt-12 space-y-6 sm:space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold mb-2 sm:mb-4">System Settings</h1>
                <p className="text-[var(--muted)] text-sm sm:text-base">Configure the neural link.</p>
            </div>

            {/* AI Provider Selection */}
            <div className="glass-card">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-[var(--accent)]" />
                    AI Provider
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <button
                        onClick={() => setProvider('ollama')}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${provider === 'ollama'
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-[var(--glass-border)] hover:border-[var(--accent)]/50'
                            }`}
                    >
                        <Server size={24} className={provider === 'ollama' ? 'text-[var(--accent)]' : ''} />
                        <div className="text-left">
                            <div className="font-bold text-sm sm:text-base">Ollama (Local)</div>
                            <div className="text-xs text-[var(--muted)]">Free, Private, Fast</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setProvider('openai')}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${provider === 'openai'
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-[var(--glass-border)] hover:border-[var(--accent)]/50'
                            }`}
                    >
                        <Cloud size={24} className={provider === 'openai' ? 'text-[var(--accent)]' : ''} />
                        <div className="text-left">
                            <div className="font-bold text-sm sm:text-base">OpenAI (Cloud)</div>
                            <div className="text-xs text-[var(--muted)]">GPT-4o, Paid</div>
                        </div>
                    </button>
                </div>

                {/* Ollama Settings */}
                {provider === 'ollama' && (
                    <div className="space-y-4 p-4 bg-[var(--bg-app)] rounded-xl">
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Ollama Endpoint</label>
                            <input
                                type="text"
                                value={ollamaEndpoint}
                                onChange={e => setOllamaEndpoint(e.target.value)}
                                placeholder="http://localhost:11434"
                                className="input-glass font-mono"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-[var(--muted)]">Model</label>
                                <button
                                    onClick={() => refreshModels()}
                                    className="text-xs text-[var(--accent)] flex items-center gap-1 hover:underline"
                                    disabled={loadingModels}
                                >
                                    <RefreshCw size={12} className={loadingModels ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>
                            <select
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                className="input-glass"
                            >
                                {availableModels.length === 0 && <option value={model}>{model}</option>}
                                {availableModels.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <p className="text-xs text-[var(--muted)] mt-2">
                                Run <code className="bg-black/10 px-1 rounded">ollama pull gemma3:27b</code> to add more models.
                            </p>
                        </div>
                    </div>
                )}

                {/* OpenAI Settings */}
                {provider === 'openai' && (
                    <div className="space-y-4 p-4 bg-[var(--bg-app)] rounded-xl">
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-2">API Key</label>
                            <div className="relative">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="input-glass pr-12 font-mono"
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-3 text-[var(--muted)] hover:text-[var(--fg)]"
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Model</label>
                            <select
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                className="input-glass"
                            >
                                <option value="gpt-4o">GPT-4o (Recommended)</option>
                                <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Fallback Notice */}
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm">
                        <strong>Fallback:</strong> If local AI fails, the system will ask before using OpenAI (requires API key configured).
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="btn gap-2">
                        {saved ? 'Saved!' : 'Save Configuration'}
                        {saved ? <Save size={16} /> : null}
                    </button>
                </div>
            </div>

            <div className="glass-card opacity-50 pointer-events-none">
                <h2 className="text-xl font-bold mb-4">Data Export</h2>
                <p className="text-sm">Coming soon in v2.1</p>
            </div>
        </div>
    );
}
