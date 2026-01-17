/**
 * Secure AI Client
 * Calls the server-side AI endpoint instead of exposing API keys client-side
 */

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIResponse {
    content: string;
    provider: 'openai' | 'ollama';
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Call AI through the secure server-side endpoint
 * This keeps API keys secure on the server
 */
export async function callAISecure(
    messages: AIMessage[],
    model: string = 'gpt-4o'
): Promise<AIResponse> {
    const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, model }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'AI request failed');
    }

    return response.json();
}

/**
 * Quick helper for single-message AI calls
 */
export async function askAI(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: AIMessage[] = [];

    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await callAISecure(messages);
    return response.content;
}
