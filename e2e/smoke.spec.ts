import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page loads and renders key content', async ({ page }) => {
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to home
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Check hero text
    await expect(page.locator('h1')).toContainText('Forward-deployed engineers for the agent era');

    // Check all navigation sections render
    await expect(page.getByText('Northern Bytes')).toBeVisible();
    await expect(page.getByRole('link', { name: /Approach/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Capabilities/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Contact/i })).toBeVisible();

    // Check main sections exist
    await expect(page.getByText('Not a consultancy')).toBeVisible();
    await expect(page.getByText('How we engage')).toBeVisible();
    await expect(page.getByText('What we build')).toBeVisible();

    // Check footer
    await expect(page.getByText(/© 2026 Northern Bytes/)).toBeVisible();

    // No console errors
    expect(consoleErrors).toEqual([]);
  });

  test('favicon exists', async ({ page }) => {
    const response = await page.goto('/favicon.ico');
    expect(response?.status()).toBe(200);
  });

  test('all internal anchor links resolve', async ({ page }) => {
    await page.goto('/');

    // Get all internal anchor links
    const anchorLinks = await page.locator('a[href^="#"]').all();
    
    for (const link of anchorLinks) {
      const href = await link.getAttribute('href');
      if (!href) continue;

      const targetId = href.substring(1); // Remove #
      if (!targetId) continue; // Skip href="#" (logo link)

      const target = page.locator(`[id="${targetId}"]`);
      await expect(target, `Target #${targetId} should exist`).toBeAttached();
    }
  });

  test('contact links are correct', async ({ page }) => {
    await page.goto('/');

    // Check email links
    const emailLinks = await page.locator('a[href^="mailto:hello@northernbytes.co"]').all();
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  test('no broken internal links', async ({ page }) => {
    await page.goto('/');

    // Get all links
    const links = await page.locator('a[href]').all();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href) continue;
      
      // Skip external links and mailto
      if (href.startsWith('http') || href.startsWith('mailto:')) continue;
      
      // For internal links, check they either start with # or are relative paths
      expect(
        href.startsWith('#') || href.startsWith('/'),
        `Link ${href} should be anchor or absolute path`
      ).toBe(true);
    }
  });

  test('basic metadata is present', async ({ page }) => {
    await page.goto('/');

    // Check title and description
    const title = await page.title();
    expect(title).toContain('Northern Bytes');

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description).toContain('production AI systems');
  });
});
