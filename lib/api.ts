import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ReviewFile, LifeMapScores } from './types';

const CONTENT_DIR = path.join(process.cwd(), '../ceo-personal-os');

export function getContentPath(subpath: string) {
    return path.join(CONTENT_DIR, subpath);
}

export function listFiles(subdir: string): ReviewFile[] {
    const dir = getContentPath(subdir);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    return files
        .filter(f => f.endsWith('.md'))
        .map(file => {
            const fullPath = path.join(dir, file);
            const content = fs.readFileSync(fullPath, 'utf8');
            const { data, content: mdContent } = matter(content);

            // Try to extract Energy Level date if not in frontmatter
            let energyLevel = data.energyLevel;
            if (!energyLevel) {
                // Match "**Energy Level (1-10):** [8]" or "Energy Level: 8"
                const energyMatch = mdContent.match(/Energy Level.*:\D*(\d+)/i);
                if (energyMatch) energyLevel = parseInt(energyMatch[1]);
            }

            return {
                name: file,
                path: path.join(subdir, file), // Return relative path
                slug: file.replace('.md', ''),
                content: mdContent,
                frontmatter: data,
                energyLevel
            };
        })
        .sort((a, b) => b.name.localeCompare(a.name)); // Newest first
}

export function getFile(subpath: string): ReviewFile | null {
    // Handle absolute paths by stripping content dir if present? 
    // Easier to just expect relative paths.
    // If subpath is absolute, path.join might act weird, but if we ensure we pass relative...
    // Let's assume subpath is relative.
    const fullPath = getContentPath(subpath);
    if (!fs.existsSync(fullPath)) return null;

    const content = fs.readFileSync(fullPath, 'utf8');
    const { data, content: mdContent } = matter(content);

    return {
        name: path.basename(subpath),
        path: subpath, // Return relative path so links work
        slug: path.basename(subpath).replace('.md', ''),
        content: mdContent,
        frontmatter: data
    };
}

export function getYesterdayLog(): ReviewFile | null {
    const contentPath = getContentPath('reviews/daily');
    if (!fs.existsSync(contentPath)) return null;

    const files = fs.readdirSync(contentPath)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse(); // Newest first

    if (files.length === 0) return null;

    // Basic check: is the newest file from today? If so, get the second newest.
    // Ideally we use date-fns to check actual dates, but for now we take the latest
    // assuming the user is starting their day.
    // Actually, let's find the first file that ISN'T today.

    const today = new Date().toISOString().split('T')[0];
    const yesterdayFile = files.find(f => !f.includes(today));

    if (!yesterdayFile) return null;

    return getFile(`reviews/daily/${yesterdayFile}`);
}

export function saveFile(subpath: string, content: string) {
    const fullPath = getContentPath(subpath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content);
}

export function deleteFile(subpath: string) {
    const fullPath = getContentPath(subpath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
    }
    return false;
}

export function getAnalyticsData() {
    const dailyFiles = listFiles('reviews/daily');

    // 1. Heatmap Data (Dates)
    const dates = dailyFiles.map(f => ({
        date: f.name.replace('.md', ''),
        energy: f.energyLevel || 0
    }));

    // 2. Calculate Streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedDates = dates.map(d => d.date).sort((a, b) => b.localeCompare(a)); // Newest first

    if (sortedDates.length > 0) {
        let currentDate = new Date();
        // Check if today or yesterday exists to start streak
        const hasToday = sortedDates.includes(today);

        // Simple iteration to check consecutives
        // (This is a simplified streak logic for the MVP)
        streak = hasToday ? 1 : 0;
    }

    // 3. Energy Trend (Last 14 days)
    const energyTrend = dates
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14);

    return { dates, streak, energyTrend };
}

export function getRandomWisdom() {
    // Sources: Principles, Memory
    const p = getFile('principles.md');
    const m = getFile('memory.md');

    const candidates: string[] = [];

    // Parse Principles: Headers with text
    if (p) {
        const sections = p.content.split(/##\s+/).slice(1); // Skip title
        sections.forEach(s => {
            const lines = s.split('\n');
            const title = lines[0].trim();
            const body = lines.slice(1).join(' ').trim().slice(0, 150);
            if (title && body) candidates.push(`**${title}**: ${body}...`);
        });
    }

    if (m) {
        // Parse bullets
        const bullets = m.content.match(/- \[ENTRY\].*/g); // This matches placeholders, user needs to fill them.
        // Let's try to match actual bullets if user filled them
        const contentBullets = m.content.match(/- \w.+/g);
        if (contentBullets) candidates.push(...contentBullets);
    }

    if (candidates.length === 0) return "Add your principles to principles.md to see them here.";

    return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getLifeMapScores(): LifeMapScores {
    const file = getFile('frameworks/life_map.md');
    if (!file) return { career: 0, relationships: 0, health: 0, finances: 0, meaning: 0, fun: 0 };

    // Parse simple regex
    const scores: any = {};
    const mapMap: Record<string, string> = {
        'Career/Work': 'career',
        'Relationships': 'relationships',
        'Health': 'health',
        'Finances': 'finances',
        'Meaning/Spirituality': 'meaning',
        'Fun/Play': 'fun'
    };

    const lines = file.content.split('\n');
    let currentCategory = '';

    for (const line of lines) {
        // Check for headers like "### 1. Career/Work"
        const headerMatch = line.match(/### \d\.\s+(.*)/);
        if (headerMatch) {
            currentCategory = headerMatch[1].trim();
        }

        // Check for "Current Satisfaction (1-10): X"
        const scoreMatch = line.match(/Current Satisfaction \(1-10\):\s*(\d+)/);
        if (scoreMatch && currentCategory) {
            // Find the key
            for (const k in mapMap) {
                if (currentCategory.includes(k.split('/')[0])) { // fuzzy match
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
