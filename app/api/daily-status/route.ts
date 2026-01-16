import { NextResponse } from 'next/server';
import { getFile } from '@/lib/api';
import { format } from 'date-fns';

export async function GET() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const file = getFile(`reviews/daily/${today}.md`);

    if (!file) {
        return NextResponse.json({ status: 'morning', priority: null });
    }

    // Parse content for priority
    // Robust regex to catch various headers
    const priorityMatch = file.content.match(/Single Major Priority.*:\s*\n\s*-\s*(.*)/i);
    const priority = priorityMatch ? priorityMatch[1].trim() : "Goal Not Set";

    // Check if shutdown is complete (Look for Evening strings)
    const isShutdown = file.content.includes('Evening Shutdown') || file.content.includes('PM Energy Log');

    if (isShutdown) {
        return NextResponse.json({ status: 'complete', priority });
    }

    return NextResponse.json({ status: 'active', priority });
}
