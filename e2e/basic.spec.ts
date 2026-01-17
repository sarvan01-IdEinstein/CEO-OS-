import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
    test('shows hamburger menu on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Hamburger menu should be visible on mobile
        const hamburger = page.locator('button[aria-label="Open menu"]');
        await expect(hamburger).toBeVisible();
    });

    test('sidebar opens when hamburger is clicked', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Click hamburger
        await page.click('button[aria-label="Open menu"]');

        // Sidebar should be visible
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();

        // Close button should appear
        const closeButton = page.locator('button[aria-label="Close menu"]');
        await expect(closeButton).toBeVisible();
    });

    test('sidebar is visible by default on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/');

        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();

        // Hamburger should NOT be visible on desktop
        const hamburger = page.locator('button[aria-label="Open menu"]');
        await expect(hamburger).not.toBeVisible();
    });
});

test.describe('Login Page', () => {
    test('shows login form', async ({ page }) => {
        await page.goto('/login');

        // Should have email input
        await expect(page.locator('input[type="email"]')).toBeVisible();

        // Should have submit button
        await expect(page.locator('button[type="submit"]')).toContainText('Magic Link');
    });
});
