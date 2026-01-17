import { getCurrentQuarter, getQuarterProgress, getTimeBasedGreeting } from '@/lib/utils/date';

describe('Date Utilities', () => {
    describe('getCurrentQuarter', () => {
        it('returns a string in format "Q# YYYY"', () => {
            const quarter = getCurrentQuarter();
            expect(quarter).toMatch(/^Q[1-4] \d{4}$/);
        });

        it('returns correct quarter based on current date', () => {
            const quarter = getCurrentQuarter();
            const now = new Date();
            const expectedQuarter = Math.floor(now.getMonth() / 3) + 1;
            expect(quarter).toContain(`Q${expectedQuarter}`);
        });
    });

    describe('getQuarterProgress', () => {
        it('returns a number between 0 and 100', () => {
            const progress = getQuarterProgress();
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(100);
        });

        it('returns an integer', () => {
            const progress = getQuarterProgress();
            expect(Number.isInteger(progress)).toBe(true);
        });
    });

    describe('getTimeBasedGreeting', () => {
        it('returns a greeting string', () => {
            const greeting = getTimeBasedGreeting();
            expect(['Good Morning', 'Good Afternoon', 'Good Evening']).toContain(greeting);
        });
    });
});
