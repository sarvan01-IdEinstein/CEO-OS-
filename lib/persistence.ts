import { createClient } from '@/lib/supabase';

export type Decision = {
    id: string;
    razor: string;
    decision: string;
    analysis: string;
    verdict: string;
    created_at: string;
};

// --- DECISIONS ---

export async function saveDecision(decision: Omit<Decision, 'id' | 'created_at'>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase.from('decisions').insert({
        user_id: user.id,
        ...decision
    });

    if (error) throw error;
}

export async function getDecisions() {
    const supabase = createClient();
    const { data } = await supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false });

    return (data || []) as Decision[];
}

// --- TASKS (Leverage Lab) ---

export type Task = {
    id: string;
    title: string;
    impact: 'High' | 'Low';
    effort: 'High' | 'Low';
    status: 'todo' | 'done' | 'delegated';
    assignee?: string;
};

export async function saveTask(task: Omit<Task, 'id'>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id,
        ...task
    }).select().single();

    if (error) throw error;
    return data;
}

export async function deleteTask(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
}

export async function getTasks() {
    const supabase = createClient();
    const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    return (data || []) as Task[];
}


// --- OKRs (Objectives & Key Results) ---

export type OKR = {
    id: string;
    title: string;
    type: 'OBJECTIVE' | 'KEY_RESULT';
    parent_id?: string;
    current_value: number;
    target_value: number;
    unit: string;
    status: 'on_track' | 'at_risk' | 'off_track';
    quarter?: string;
};

export async function saveOKR(okr: Omit<OKR, 'id'>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase.from('okrs').insert({
        user_id: user.id,
        ...okr
    }).select().single();

    if (error) throw error;
    return data;
}

export async function getOKRs() {
    const supabase = createClient();
    const { data } = await supabase
        .from('okrs')
        .select('*')
        .order('created_at', { ascending: false });

    return (data || []) as OKR[];
}
