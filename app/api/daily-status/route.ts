import { NextResponse } from 'next/server';
import { getFile } from '@/lib/api';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    const today = format(new Date(), 'yyyy-MM-dd');

    // 1. Check Today FIRST
    const file = await getFile(`reviews/daily/${today}.md`);
    console.log(`[DailyStatus] Checking: reviews/daily/${today}.md`);
    console.log(`[DailyStatus] File Found:`, file ? 'YES' : 'NO');

    // If Today exists, we determine status based on content (Active vs Complete)
    if (file) {
        if (file.content) console.log(`[DailyStatus] Content Preview:`, file.content.substring(0, 50));

        // Parse content for priority
        const priorityMatch = file.content.match(/Single Major Priority.*:\s*\n\s*-\s*(.*)/i);
        const priority = priorityMatch ? priorityMatch[1].trim() : "Goal Not Set";

        // Check if shutdown is complete
        const isShutdown = file.content.includes('Evening Shutdown') || file.content.includes('PM Energy Log');

        if (isShutdown) {
            return NextResponse.json({ status: 'complete', priority });
        }
        return NextResponse.json({ status: 'active', priority });
    }

    // 2. If Today is MISSING, check Yesterday to manage Streak/Warning
    const { getYesterdayLog } = await import('@/lib/api');
    const yesterday = await getYesterdayLog();

    if (!yesterday) {
        return NextResponse.json({
            status: 'morning',
            message: 'No review logged yesterday - Streak Reset',
            streak: 0
        });
    }

    // Default Morning State (Yesterday Exists, Today Missing)
    return NextResponse.json({ status: 'morning', priority: null });
}
