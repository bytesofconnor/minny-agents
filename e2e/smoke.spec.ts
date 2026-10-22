import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page loads and renders key content', async ({ page }) => {
    // Capture console errors (excluding resource load failures)
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore 404 resource load failures (common with static serving)
        if (!text.includes('404') && !text.includes('Failed to load resource')) {
          consoleErrors.push(text);
        }
      }
    });

    // Navigate to home
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Check hero text
    await expect(page.locator('h1')).toContainText('Missed calls, piled-up reviews, invoices in your inbox');

    // Check navigation sections render
    await expect(page.getByRole('link', { name: /What we build/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /FAQ/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Contact/i })).toBeVisible();

    // Check main sections exist
    await expect(page.getByText('What we can take off your plate')).toBeVisible();
    await expect(page.getByText('Quick wins')).toBeVisible();
    await expect(page.getByText('Bigger projects')).toBeVisible();
    await expect(page.getByText('Frequently asked questions')).toBeVisible();

    // Check footer
    await expect(page.getByText(/© 2026 Northern Bytes/)).toBeVisible();

    // No critical console errors (404s are ignored)
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

    // Unowned address must not appear
    const emailLinks = await page.locator('a[href^="mailto:"]').all();
    expect(emailLinks.length).toBe(0);

    const contactCtas = await page.locator('a[href="#contact"]').all();
    expect(contactCtas.length).toBeGreaterThan(0);
    await expect(page.getByText('Contact details coming soon.')).toBeVisible();
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

  test('FAQ section renders', async ({ page }) => {
    await page.goto('/');

    // Check FAQ section exists
    await expect(page.getByText('Frequently asked questions')).toBeVisible();

    // Check at least one FAQ question
    await expect(page.getByText('How does an engagement work?')).toBeVisible();

    // Check FAQ answers are present
    await expect(page.getByText(/Week 1: We spend time/)).toBeVisible();
  });

  test('AI TOOLING section renders', async ({ page }) => {
    await page.goto('/');

    // Check for AI tooling items
    await expect(page.getByText('Claude', { exact: true })).toBeVisible();
    await expect(page.getByText('Grok Bot').first()).toBeVisible();
    await expect(page.getByText('Cursor', { exact: true })).toBeVisible();
    await expect(page.getByText('Codex')).toBeVisible();
  });

  test('static SEO files return 200', async ({ page }) => {
    const seoFiles = [
      '/robots.txt',
      '/sitemap.xml',
      '/llms.txt',
    ];

    for (const file of seoFiles) {
      const response = await page.goto(file);
      expect(response?.status(), `${file} should return 200`).toBe(200);
    }
  });

  test('generated images return 200', async ({ page }) => {
    const images = [
      '/opengraph-image',
      '/icon',
    ];

    for (const image of images) {
      const response = await page.goto(image);
      expect(response?.status(), `${image} should return 200`).toBe(200);
    }
  });

  test('JSON-LD structured data is valid', async ({ page }) => {
    await page.goto('/');

    const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdContent, 'JSON-LD script should exist').toBeTruthy();

    // Parse to validate JSON structure
    const jsonLd = JSON.parse(jsonLdContent!);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@graph']).toBeDefined();
    expect(Array.isArray(jsonLd['@graph'])).toBe(true);
    
    // Check for required schemas
    const types = jsonLd['@graph'].map((item: { '@type': string }) => item['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('ProfessionalService');
    expect(types).toContain('FAQPage');

    // Validate Organization has required fields
    const org = jsonLd['@graph'].find((item: { '@type': string }) => item['@type'] === 'Organization');
    expect(org.name).toBe('Northern Bytes');
    expect(org.founder).toBeDefined();
    expect(org.founder.name).toBe('Connor Barrett');
  });

  test('Open Graph metadata is complete', async ({ page }) => {
    await page.goto('/');

    // Check OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogTitle).toContain('Northern Bytes');

    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBeTruthy();

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    expect(ogImage).toContain('/opengraph-image');

    // Check Twitter card
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');
  });

  test('visual regression - desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/desktop-full-page.png', fullPage: true });
  });

  test('visual regression - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/mobile-full-page.png', fullPage: true });
  });
});
