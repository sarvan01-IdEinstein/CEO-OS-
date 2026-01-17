import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Server-side AI endpoint to keep API keys secure
export async function POST(request: NextRequest) {
    try {
        // Get request body
        const body = await request.json();
        const { messages, model = 'gpt-4o' } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Get API key from environment variable (secure)
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Try Ollama as fallback if no OpenAI key
            const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
            const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

            try {
                const ollamaResponse = await fetch(`${ollamaEndpoint}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: ollamaModel,
                        messages,
                        stream: false
                    })
                });

                if (ollamaResponse.ok) {
                    const data = await ollamaResponse.json();
                    return NextResponse.json({
                        content: data.message?.content || '',
                        provider: 'ollama',
                        model: ollamaModel
                    });
                }
            } catch (ollamaError) {
                console.error('Ollama fallback failed:', ollamaError);
            }

            return NextResponse.json(
                { error: 'No AI provider configured. Set OPENAI_API_KEY or ensure Ollama is running.' },
                { status: 500 }
            );
        }

        // Call OpenAI API (server-side with secure key)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API error:', errorData);
            return NextResponse.json(
                { error: errorData.error?.message || 'AI request failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        return NextResponse.json({
            content,
            provider: 'openai',
            model,
            usage: data.usage
        });

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
