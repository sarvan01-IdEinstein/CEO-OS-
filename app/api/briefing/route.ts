import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force dynamic to ensure we get fresh data
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Fetch Context
        // A. OKRs
        const { data: okrs } = await supabase.from('okrs').select('*').eq('status', 'on_track').limit(5);

        // B. Critical Tasks
        const { data: tasks } = await supabase.from('tasks').select('*').eq('status', 'todo').limit(5);

        // C. Recent Decisions
        const { data: decisions } = await supabase.from('decisions').select('*').limit(3).order('created_at', { ascending: false });

        // D. Yesterday's Journal (did they finish?)
        // Fetch last journal entry
        const { data: logs } = await supabase.from('journal_entries').select('*').order('date', { ascending: false }).limit(1);
        const lastLog = logs?.[0];

        // 2. prompt Engineering
        const context = `
        USER CONTEXT:
        - Active Objectives: ${JSON.stringify(okrs?.map(o => o.title))}
        - Pending Tasks: ${JSON.stringify(tasks?.map(t => t.title))}
        - Recent Strategy: ${JSON.stringify(decisions?.map(d => d.decision))}
        - Last Log: ${lastLog ? JSON.stringify(lastLog) : "No logs yet."}
        `;

        const systemPrompt = `You are a high-performance Chief of Staff for a standard Fortune 500 CEO.
        Your goal is to prepare a "Morning Briefing" that is concise, brutal, and actionable.
        
        Structure:
        1. 🚨 **The Red Line**: What is off-track or urgent? (Tasks/OKRs)
        2. 🧠 **Strategic Continuity**: Remind them of recent decisions or unclosed loops.
        3. 🎯 **The One Thing**: Based on the context, suggest ONE major focus for today.
        
        Tone: Professional, direct, no fluff. Use bullet points.`;

        // 3. Call OpenAI
        // Note: in a real app, we'd use the user's key or a managed one. 
        // For this demo, we assume env var or client-side passing. 
        // STARTING SIMPLE: We will just return the gathered data to the client 
        // and let the CLIENT call OpenAI so we don't leak server keys or need generic env vars.

        // 3. Calculate Priority
        let priority = 'low';
        if (tasks && tasks.length > 0) priority = 'high'; // pending critical tasks
        if (!okrs || okrs.length === 0) priority = 'high'; // no strategy set
        if (!lastLog) priority = 'high'; // inconsistent journaling

        return NextResponse.json({
            priority,
            context: {
                okrs,
                tasks,
                decisions,
                lastLog
            }
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
