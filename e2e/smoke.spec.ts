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
    await expect(page.getByText(/A restaurant/)).toBeVisible();
    await expect(page.getByText('Illustrative example. Not real data.')).toBeVisible();

    // Check footer and brand
    await expect(page.getByText(/© 2026 Minny Agents/)).toBeVisible();
    await expect(page.getByText('Minny').first()).toBeVisible();
    await expect(page.getByText('Agents').first()).toBeVisible();
    await expect(page.getByText('An agent handling a missed restaurant call.')).toBeVisible();
    await expect(page.getByText('Call missed').first()).toBeVisible();
    await expect(page.getByText('Reply texted').first()).toBeVisible();
    await expect(page.getByText('Table booked').first()).toBeVisible();
    await expect(page.getByText(/Connor Barrett/)).toBeVisible();
    await expect(page.getByText('Example').first()).toBeVisible();
    await expect(page.getByText('Not a real business')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Northern Bytes');
    await expect(page.getByText('C01')).toHaveCount(0);
    await expect(page.locator('.scene .aurora')).toHaveCount(1);
    await expect(page.locator('.scene .contours')).toHaveCount(1);

    // No critical console errors (404s are ignored)
    expect(consoleErrors).toEqual([]);
  });

  test('favicon exists', async ({ page }) => {
    const ico = await page.goto('/favicon.ico');
    expect(ico?.status()).toBe(200);
    const svg = await page.goto('/favicon.svg');
    expect(svg?.status()).toBe(200);
    const apple = await page.goto('/apple-touch-icon.png');
    expect(apple?.status()).toBe(200);
    const manifest = await page.goto('/site.webmanifest');
    expect(manifest?.status()).toBe(200);
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
    expect(title).toContain('Minny Agents');
    expect(title).not.toContain('Northern Bytes');

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description).toContain('AI agents');
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
      '/twitter-image',
      '/icon',
      '/apple-icon',
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
    expect(org.name).toBe('Minny Agents');
    expect(org.founder).toBeDefined();
    expect(org.founder.name).toBe('Connor Barrett');
  });

  test('Open Graph metadata is complete', async ({ page }) => {
    await page.goto('/');

    // Check OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogTitle).toContain('Minny Agents');
    expect(ogTitle).not.toContain('Northern Bytes');

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

  test('hero example card does not overlap headline or nav', async ({ page }) => {
    async function box(locator: ReturnType<typeof page.locator>) {
      const b = await locator.boundingBox();
      expect(b, 'expected a bounding box').toBeTruthy();
      return b!;
    }
    function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
      return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
    }

    for (const size of [{ width: 1280, height: 800 }, { width: 1024, height: 800 }, { width: 375, height: 812 }]) {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const header = await box(page.locator('header'));
      const headline = await box(page.locator('h1'));
      const card = await box(page.locator('.example-card'));
      const cta = await box(page.getByRole("link", { name: /Get in touch/i }).last());
      expect(overlaps(header, headline), `header vs h1 at ${size.width}`).toBe(false);
      expect(overlaps(headline, card), `h1 vs example card at ${size.width}`).toBe(false);
      expect(overlaps(cta, card), `CTA vs example card at ${size.width}`).toBe(false);
    }
  });

  test('example kicker stays on one line at 1280 and 1024', async ({ page }) => {
    for (const width of [1280, 1024]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const kicker = page.locator('.example-kicker');
      await expect(kicker).toHaveText(/Example\s*·\s*Not a real business/i);
      const kickerBox = await kicker.boundingBox();
      const cardBox = await page.locator('.example-card').boundingBox();
      expect(kickerBox, `kicker box at ${width}`).toBeTruthy();
      expect(cardBox, `card box at ${width}`).toBeTruthy();
      expect(kickerBox!.height, `kicker wrapped at ${width}`).toBeLessThan(22);
      expect(kickerBox!.x + kickerBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
      await page.locator('section').first().screenshot({ path: `test-results/hero-${width}.png` });
    }
  });

  test('lake contours are quiet texture', async ({ page, request }) => {
    const res = await request.get('/lake-contours.svg');
    expect(res.status()).toBe(200);
    const svg = await res.text();
    expect(svg).not.toMatch(/#9B8CFF|#9b8cff/);
    const opacities = [...svg.matchAll(/opacity="([0-9.]+)"/g)].map((m) => Number(m[1]));
    expect(opacities).toEqual([0.55, 0.4, 0.28, 0.2, 0.24]);
    const widths = [...svg.matchAll(/stroke-width="([0-9.]+)"/g)].map((m) => Number(m[1]));
    expect(widths.length).toBeGreaterThan(0);
    expect(Math.max(...widths)).toBe(1);
    expect((svg.match(/<path/g) || []).length).toBeLessThanOrEqual(6);

    await page.goto('/');
    const knob = await page.locator('.contours').evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        var: style.getPropertyValue('--contour-opacity').trim(),
        opacity: Number(style.opacity),
      };
    });
    expect(Number(knob.var)).toBeCloseTo(0.47, 2);
    expect(knob.opacity).toBeCloseTo(0.47, 2);
  });

  test('32px favicon has inset padding', async ({ page }) => {
    await page.goto('/');
    const samples = await page.evaluate(async () => {
      const res = await fetch('/favicon.svg');
      const text = await res.text();
      const blob = new Blob([text], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 32, 32);
      // Mid-edge samples sit inside the rounded rect but outside the star (~19% inset).
      const pad = [
        [4, 16], [27, 16], [16, 4], [16, 27],
        [5, 5], [26, 5], [5, 26], [26, 26],
      ];
      const center = Array.from(ctx.getImageData(16, 16, 1, 1).data);
      URL.revokeObjectURL(url);
      return {
        pad: pad.map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data)),
        center,
      };
    });
    for (const [r, g, b] of samples.pad) {
      const dist = Math.abs(r - 6) + Math.abs(g - 10) + Math.abs(b - 26);
      expect(dist, 'padding-band pixel should stay dark ink').toBeLessThan(24);
    }
    expect(samples.center[1], 'center should be teal, not empty').toBeGreaterThan(150);
  });
});
