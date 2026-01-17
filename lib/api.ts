
import { createClient } from '@/lib/supabase-server';
import { ReviewFile, LifeMapScores } from './types';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';

const CONTENT_DIR = path.join(process.cwd(), 'data');

// Helper to read local file
function getLocalFile(subpath: string): ReviewFile | null {
    try {
        const fullPath = path.join(CONTENT_DIR, subpath);
        if (!fs.existsSync(fullPath)) return null;

        const content = fs.readFileSync(fullPath, 'utf8');
        const { data, content: mdContent } = matter(content);

        return {
            name: path.basename(subpath),
            path: subpath,
            slug: path.basename(subpath).replace('.md', ''),
            content: mdContent,
            frontmatter: data
        };
    } catch (e) {
        return null;
    }
}

// SaaS Version of API

// Connects to Supabase Database instead of local file system

export async function listFiles(subdir: string): Promise<ReviewFile[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Map 'reviews/daily' to journal_entries
    if (subdir === 'reviews/daily') {
        const { data } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        return (data || []).map(entry => ({
            name: `${entry.date}.md`,
            path: `reviews/daily/${entry.date}.md`,
            slug: entry.date,
            content: entry.content || '',
            frontmatter: { energyLevel: entry.energy_level },
            energyLevel: entry.energy_level
        }));
    }

    // For other folders (Goals, Frameworks, Interviews, etc.), list local templates
    // These define the "Schema" of files available to the user.
    // getFile will handle fetching the DB content vs local content.
    try {
        const fullPath = path.join(CONTENT_DIR, subdir);
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md') && !f.includes('template'));
            // Note: We filter OUT 'template.md' for lists usually, but distinct files like '1_year.md' ARE templates in a way.
            // Actually, for goals, '1_year.md' IS the file.
            // For reviews/weekly, 'template.md' is the only thing there until we have DB entries? 
            // Wait, reviews/weekly are date-based too? 
            // The user asked to "copy frameworks, goals, interviews template back to library". 
            // These are singular files per type usually.

            return files.map(file => ({
                name: file,
                path: `${subdir}/${file}`,
                slug: file.replace('.md', ''),
                content: '', // List doesn't need full content
                frontmatter: {}
            }));
        }
    } catch (e) {
        console.error("Error listing local files:", e);
    }

    return [];
}

export async function getFile(subpath: string): Promise<ReviewFile | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Templates always come from File System (Guidance)
    if (subpath.includes('template.md')) {
        return getLocalFile(subpath);
    }

    if (!user) return getLocalFile(subpath); // Fallback for unauth users to see static content

    // 2. Handle Daily Review (Journal Entry)
    // Path format: reviews/daily/YYYY-MM-DD.md
    const dailyMatch = subpath.match(/reviews\/daily\/(\d{4}-\d{2}-\d{2})\.md/);
    if (dailyMatch) {
        const date = dailyMatch[1];
        const { data } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', date)
            .single();

        if (data) {
            return {
                name: `${date}.md`,
                path: subpath,
                slug: date,
                content: data.content || '',
                frontmatter: { energyLevel: data.energy_level },
                energyLevel: data.energy_level
            };
        }
        return null; // Don't fallback for daily entries, they strictly exist or don't.
    }

    // 3. Handle Goals (Hybrid: DB -> FS Fallback)
    // Path format: goals/1_year.md
    if (subpath.startsWith('goals/')) {
        const type = subpath.replace('goals/', '').replace('.md', '');
        const { data } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', type)
            .single();

        if (data && data.content) {
            return {
                name: path.basename(subpath),
                path: subpath,
                slug: type,
                content: data.content,
                frontmatter: {}
            };
        }
        // Fallback to local template if user hasn't created one yet
        return getLocalFile(subpath);
    }

    // 4. Handle Frameworks (Hybrid: DB -> FS Fallback)
    if (subpath.startsWith('frameworks/') || ['principles.md', 'north_star.md', 'memory.md'].includes(subpath)) {
        let type = subpath.replace('frameworks/', '').replace('.md', '');
        // Handle root files
        if (subpath === 'principles.md') type = 'principles';
        if (subpath === 'north_star.md') type = 'north_star';
        if (subpath === 'memory.md') type = 'memory';

        const { data } = await supabase
            .from('frameworks')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', type)
            .single();

        if (data && data.content) {
            return {
                name: path.basename(subpath),
                path: subpath,
                slug: type,
                content: data.content,
                frontmatter: data.data || {}
            };
        }
        // Fallback to local template
        return getLocalFile(subpath);
    }

    return null;
}

export async function saveFile(subpath: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    console.log(`Saving file: ${subpath}`); // Debug log

    // 1. Daily Review
    const dailyMatch = subpath.match(/reviews\/daily\/(\d{4}-\d{2}-\d{2})\.md/);
    if (dailyMatch) {
        const date = dailyMatch[1];
        const energyMatch = content.match(/Energy Level.*:\D*(\d+)/i);
        const energyLevel = energyMatch ? parseInt(energyMatch[1]) : null;

        let { error } = await supabase.from('journal_entries').upsert({
            user_id: user.id,
            date: date,
            content: content,
            energy_level: energyLevel,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, date' });

        // Self-Heal: If Profile missing (FK Violation), create it and retry
        if (error && error.code === '23503') {
            console.log("Missing Profile detected. Self-healing...");
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                updated_at: new Date().toISOString()
            });

            if (!profileError) {
                // Retry Journal Save
                const retry = await supabase.from('journal_entries').upsert({
                    user_id: user.id,
                    date: date,
                    content: content,
                    energy_level: energyLevel,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, date' });
                error = retry.error;
            }
        }

        if (error) {
            console.error("Supabase Save Error (Journal):", error);
            throw new Error(error.message);
        }
        return;
    }

    // 2. Goals
    if (subpath.startsWith('goals/')) {
        const type = subpath.replace('goals/', '').replace('.md', '');

        // Check existing to decide insert vs update (since unique constraint might be missing in schema for some versions)
        // We'll trust upsert if we added the constraint, but let's be safe and check error.
        // Actually, for goals, we used a manual check in previous code. Let's simplify with upsert but throw error.

        // First try to find it
        const { data: existing } = await supabase.from('goals').select('id').eq('user_id', user.id).eq('type', type).single();

        let error;
        if (existing) {
            const res = await supabase.from('goals').update({ content }).eq('id', existing.id);
            error = res.error;
        } else {
            const res = await supabase.from('goals').insert({ user_id: user.id, type, content });
            error = res.error;
        }

        if (error) {
            console.error("Supabase Save Error (Goals):", error);
            throw new Error(error.message);
        }
        return;
    }

    // 3. Frameworks
    if (subpath.startsWith('frameworks/') || ['principles.md', 'north_star.md', 'memory.md'].includes(subpath)) {
        let type = subpath.replace('frameworks/', '').replace('.md', '');
        if (subpath === 'principles.md') type = 'principles';
        if (subpath === 'north_star.md') type = 'north_star';
        if (subpath === 'memory.md') type = 'memory';

        const { error } = await supabase.from('frameworks').upsert({
            user_id: user.id,
            type: type,
            content: content,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, type' });

        if (error) {
            console.error("Supabase Save Error (Frameworks):", error);
            throw new Error(error.message);
        }
        return;
    }
}

// ... Additional helper functions (analytics, lifemap) need similar refactoring ...
// For MVP SaaS transition, we focus on the core read/writes first.


export async function getYesterdayLog(): Promise<ReviewFile | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    // Get the most recent entry that is BEFORE today
    const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .lt('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .single();

    if (!data) return null;

    return {
        name: `${data.date}.md`,
        path: `reviews/daily/${data.date}.md`,
        slug: data.date,
        content: data.content || '',
        frontmatter: { energyLevel: data.energy_level },
        energyLevel: data.energy_level
    };
}

export async function deleteFile(subpath: string): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 1. Daily Review
    const dailyMatch = subpath.match(/reviews\/daily\/(\d{4}-\d{2}-\d{2})\.md/);
    if (dailyMatch) {
        const date = dailyMatch[1];
        const { error } = await supabase.from('journal_entries').delete().eq('user_id', user.id).eq('date', date);
        return !error;
    }

    // Impl others if needed
    return false;
}

export async function getAnalyticsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { dates: [], streak: 0, energyTrend: [] };

    const { data } = await supabase
        .from('journal_entries')
        .select('date, energy_level')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    const entries = data || [];

    // 1. Heatmap Data
    const dates = entries.map(e => ({
        date: e.date,
        energy: e.energy_level || 0
    }));

    // 2. Calculate Streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedDates = dates.map(d => d.date); //.sort is already desc from DB

    if (sortedDates.length > 0) {
        let currentDate = new Date();
        const hasToday = sortedDates.includes(today);

        // Very basic consecutive check
        // If we have today, start at 1. Else start at 0.
        // Then look for yesterday, etc.
        // For MVP, just checking if we have recent entries.
        streak = hasToday ? 1 : 0;
    }

    // 3. Energy Trend (Last 14)
    const energyTrend = [...dates]
        .sort((a, b) => a.date.localeCompare(b.date)) // older first for chart
        .slice(-14);

    return { dates, streak, energyTrend };
}

export async function getRandomWisdom() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Login to see your wisdom.";

    // Fetch Principles & Memory
    const { data } = await supabase
        .from('frameworks')
        .select('type, content')
        .eq('user_id', user.id)
        .in('type', ['principles', 'memory']);

    if (!data || data.length === 0) return "Add your principles to see them here.";

    const candidates: string[] = [];

    data.forEach(file => {
        if (file.type === 'principles') {
            const sections = (file.content || '').split('##').slice(1);
            sections.forEach((s: string) => {
                const lines = s.trim().split('\n');
                const title = lines[0].trim();
                const body = lines.slice(1).join(' ').trim().slice(0, 150);
                if (title && body) candidates.push(`**${title}**: ${body}...`);
            });
        } else if (file.type === 'memory') {
            const bullets = (file.content || '').match(/- \w.+/g);
            if (bullets) candidates.push(...bullets);
        }
    });

    if (candidates.length === 0) return "Add your principles to see them here.";
    return candidates[Math.floor(Math.random() * candidates.length)];
}

export async function getLifeMapScores(): Promise<LifeMapScores> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { career: 0, relationships: 0, health: 0, finances: 0, meaning: 0, fun: 0 };

    const { data } = await supabase
        .from('frameworks')
        .select('content')
        .eq('user_id', user.id)
        .eq('type', 'lifemap')
        .single();

    if (!data || !data.content) return { career: 0, relationships: 0, health: 0, finances: 0, meaning: 0, fun: 0 };

    // Parse simple regex from markdown content (migrating logic from old api.ts)
    const scores: any = {};
    const mapMap: Record<string, string> = {
        'Career/Work': 'career',
        'Relationships': 'relationships',
        'Health': 'health',
        'Finances': 'finances',
        'Meaning/Spirituality': 'meaning',
        'Fun/Play': 'fun'
    };

    const lines = data.content.split('\n');
    let currentCategory = '';

    for (const line of lines) {
        const headerMatch = line.match(/### \d\.\s+(.*)/);
        if (headerMatch) currentCategory = headerMatch[1].trim();

        const scoreMatch = line.match(/Current Satisfaction \(1-10\):\s*(\d+)/);
        if (scoreMatch && currentCategory) {
            for (const k in mapMap) {
                if (currentCategory.includes(k.split('/')[0])) {
                    scores[mapMap[k]] = parseInt(scoreMatch[1]);
                }
            }
        }
    }

    return {
        career: scores.career || 5,
        relationships: scores.relationships || 5,
        health: scores.health || 5,
        finances: scores.finances || 5,
        meaning: scores.meaning || 5,
        fun: scores.fun || 5
    };
}

