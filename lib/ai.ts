/**
 * Unified AI Provider Helper
 * Supports: Ollama (local), OpenAI (cloud fallback)
 * 
 * Settings stored in localStorage:
 * - ai_provider: 'ollama' | 'openai'
 * - ai_model: string (e.g., 'llama3.2', 'gpt-4o')
 * - ollama_endpoint: string (default: http://localhost:11434)
 * - openai_api_key: string
 */

export type AIProvider = 'ollama' | 'openai';

export interface AISettings {
    provider: AIProvider;
    model: string;
    ollamaEndpoint: string;
    openaiApiKey: string;
}

export function getAISettings(): AISettings {
    if (typeof window === 'undefined') {
        return {
            provider: 'ollama',
            model: 'llama3.2',
            ollamaEndpoint: 'http://localhost:11434',
            openaiApiKey: ''
        };
    }

    return {
        provider: (localStorage.getItem('ai_provider') as AIProvider) || 'ollama',
        model: localStorage.getItem('ai_model') || 'llama3.2',
        ollamaEndpoint: localStorage.getItem('ollama_endpoint') || 'http://localhost:11434',
        openaiApiKey: localStorage.getItem('openai_api_key') || ''
    };
}

export function saveAISettings(settings: Partial<AISettings>) {
    if (settings.provider) localStorage.setItem('ai_provider', settings.provider);
    if (settings.model) localStorage.setItem('ai_model', settings.model);
    if (settings.ollamaEndpoint) localStorage.setItem('ollama_endpoint', settings.ollamaEndpoint);
    if (settings.openaiApiKey) localStorage.setItem('openai_api_key', settings.openaiApiKey);
}

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIResponse {
    content: string;
    provider: AIProvider;
    model: string;
    fallbackUsed: boolean;
}

/**
 * Main AI call function
 * Tries local first, prompts before falling back to cloud
 */
export async function callAI(
    messages: Message[],
    options?: {
        model?: string;
        onFallbackPrompt?: () => Promise<boolean>; // Return true to allow fallback
    }
): Promise<AIResponse> {
    const settings = getAISettings();
    const model = options?.model || settings.model;

    // Try primary provider first
    if (settings.provider === 'ollama') {
        try {
            const response = await callOllama(messages, model, settings.ollamaEndpoint);
            return { content: response, provider: 'ollama', model, fallbackUsed: false };
        } catch (error) {
            console.warn('Ollama failed, checking for fallback...', error);

            // Check if we have OpenAI as fallback
            if (settings.openaiApiKey) {
                // Ask user before falling back
                if (options?.onFallbackPrompt) {
                    const allowed = await options.onFallbackPrompt();
                    if (!allowed) {
                        throw new Error('Local AI unavailable. Fallback declined.');
                    }
                }

                const response = await callOpenAI(messages, 'gpt-4o', settings.openaiApiKey);
                return { content: response, provider: 'openai', model: 'gpt-4o', fallbackUsed: true };
            }

            throw new Error('Local AI unavailable and no fallback configured.');
        }
    } else {
        // OpenAI primary
        if (!settings.openaiApiKey) {
            throw new Error('OpenAI API key not configured.');
        }
        const response = await callOpenAI(messages, model, settings.openaiApiKey);
        return { content: response, provider: 'openai', model, fallbackUsed: false };
    }
}

async function callOllama(messages: Message[], model: string, endpoint: string): Promise<string> {
    const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages,
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || '';
}

async function callOpenAI(messages: Message[], model: string, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Fetch available models from Ollama
 */
export async function getOllamaModels(endpoint?: string): Promise<string[]> {
    const url = endpoint || getAISettings().ollamaEndpoint;
    try {
        const response = await fetch(`${url}/api/tags`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.models?.map((m: any) => m.name) || [];
    } catch {
        return [];
    }
}
