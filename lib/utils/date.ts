/**
 * Date utility functions for CEO Personal OS
 */

/**
 * Get the current quarter in "Q1 2026" format
 */
export function getCurrentQuarter(): string {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear();
    return `Q${quarter} ${year}`;
}

/**
 * Get the progress percentage through the current quarter
 * @returns number between 0-100
 */
export function getQuarterProgress(): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

    // Start of current quarter
    const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);

    // Start of next quarter
    const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 1);

    // Calculate progress
    const totalDays = (quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);

    return Math.round((elapsedDays / totalDays) * 100);
}

/**
 * Get greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
