import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('vercel.json redirects old hosts to minnyagents.com', () => {
    const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const redirects = cfg.redirects as { source: string; destination: string; permanent: boolean; has?: { type: string; value: string }[] }[];
    expect(redirects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: '/',
        destination: 'https://minnyagents.com/',
        permanent: true,
        has: [{ type: 'host', value: 'northern-bytes.vercel.app' }],
      }),
      expect.objectContaining({
        source: '/:path*',
        destination: 'https://minnyagents.com/:path*',
        permanent: true,
        has: [{ type: 'host', value: 'northern-bytes.vercel.app' }],
      }),
      expect.objectContaining({
        source: '/',
        destination: 'https://minnyagents.com/',
        permanent: true,
        has: [{ type: 'host', value: 'www.minnyagents.com' }],
      }),
      expect.objectContaining({
        source: '/:path*',
        destination: 'https://minnyagents.com/:path*',
        permanent: true,
        has: [{ type: 'host', value: 'www.minnyagents.com' }],
      }),
    ]));
  });

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
    await expect(page.locator('body')).not.toContainText('Not a real business');
    await expect(page.locator('body')).not.toContainText('Northern Bytes');
    await expect(page.getByText('C01')).toHaveCount(0);
    await expect(page.locator('.scene .aurora')).toHaveCount(1);
    await expect(page.locator('.hero .contours')).toHaveCount(1);
    await expect(page.locator('#contact .contours')).toHaveCount(1);
    await expect(page.locator('.scene .contours')).toHaveCount(0);

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

  test('contact form and mailto are present', async ({ page }) => {
    await page.goto('/');

    const emailLinks = page.locator('a[href="mailto:connor@minnyagents.com"]');
    expect(await emailLinks.count()).toBeGreaterThan(0);
    await expect(emailLinks.first()).toBeVisible();

    const contactCtas = await page.locator('a[href="#contact"], a[href="/#contact"]').all();
    expect(contactCtas.length).toBeGreaterThan(0);
    await expect(page.getByText('Contact details coming soon.')).toHaveCount(0);

    await expect(page.locator('#contact form')).toBeVisible();
    await expect(page.locator('#contact input[name="name"]')).toBeVisible();
    await expect(page.locator('#contact input[name="email"]')).toBeVisible();
    await expect(page.locator('#contact input[name="business"]')).toBeVisible();
    await expect(page.locator('#contact textarea[name="message"]')).toBeVisible();
    const honeypot = page.locator('#contact input[name="website"]');
    await expect(honeypot).toBeAttached();
    await expect(honeypot).toBeHidden();
  });

  test('contact and inbound APIs reject bad input safely', async ({ request }) => {
    const missing = await request.post('/api/contact', { data: { name: 'Ada' } });
    expect(missing.status()).toBe(400);

    const badEmail = await request.post('/api/contact', {
      data: { name: 'Ada', email: 'not-an-email', business: 'Cafe', message: 'Need a missed-call agent.' },
    });
    expect(badEmail.status()).toBe(400);

    const honeypot = await request.post('/api/contact', {
      data: { name: 'Ada', email: 'ada@example.com', business: 'Cafe', message: 'Need a missed-call agent.', website: 'http://spam.test' },
    });
    expect(honeypot.status()).toBe(200);
    expect(await honeypot.json()).toEqual({ ok: true });

    const inbound = await request.post('/api/inbound', { data: { type: 'email.received' } });
    expect([400, 503]).toContain(inbound.status());
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
    expect(title).toMatch(/Minneapolis/i);
    expect(title).not.toContain('Northern Bytes');

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description).toContain('AI agents');
    expect(description).toMatch(/Twin Cities|Minneapolis/i);
  });

  test('FAQ section renders', async ({ page }) => {
    await page.goto('/');

    // Check FAQ section exists
    await expect(page.getByText('Frequently asked questions')).toBeVisible();

    await expect(page.getByRole('heading', { level: 3, name: 'How does an engagement work?' })).toBeVisible();
    await expect(page.getByText(/We start with a one-week working first version/)).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Where are you based?' })).toBeVisible();
    await expect(page.getByText(/Minneapolis, MN\. We work with businesses across the Twin Cities/)).toBeVisible();
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
      '/llms-full.txt',
    ];

    for (const file of seoFiles) {
      const response = await page.goto(file);
      expect(response?.status(), `${file} should return 200`).toBe(200);
      const body = await response!.text();
      expect(body, `${file} should name the production host`).toContain('https://minnyagents.com');
      expect(body, `${file} must not name the old Vercel alias`).not.toContain('northern-bytes.vercel.app');
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
    
    const typesOf = (item: { '@type': string | string[] }) =>
      Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
    const types = jsonLd['@graph'].flatMap(typesOf);
    expect(types).toContain('Organization');
    expect(types).toContain('ProfessionalService');
    expect(types).toContain('LocalBusiness');
    expect(types).toContain('FAQPage');
    expect(types).toContain('WebSite');

    const org = jsonLd['@graph'].find((item: { '@type': string | string[] }) => typesOf(item).includes('Organization'));
    expect(org.name).toBe('Minny Agents');
    expect(org.url).toBe('https://minnyagents.com');
    expect(org.founder).toBeDefined();
    expect(org.founder.name).toBe('Connor Barrett');
    expect(org.telephone).toBeUndefined();
    expect(org.email).toBe('connor@minnyagents.com');

    const biz = jsonLd['@graph'].find((item: { '@type': string | string[] }) => typesOf(item).includes('LocalBusiness'));
    const served = JSON.stringify(biz.areaServed);
    expect(served).toContain('Minneapolis');
    expect(served).toContain('Saint Paul');
    expect(served).toContain('United States');
    expect(biz.telephone).toBeUndefined();
    expect(biz.aggregateRating).toBeUndefined();

    const faq = jsonLd['@graph'].find((item: { '@type': string | string[] }) => typesOf(item).includes('FAQPage'));
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(5);
    for (const q of faq.mainEntity) {
      expect(q['@type']).toBe('Question');
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
      await expect(page.getByRole('heading', { level: 3, name: q.name })).toBeVisible();
    }

    expect(JSON.stringify(jsonLd)).not.toContain('northern-bytes.vercel.app');
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

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(ogUrl).toMatch(/^https:\/\/minnyagents\.com\/?$/);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/^https:\/\/minnyagents\.com\/?$/);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    expect(ogImage).toContain('minnyagents.com');
    expect(ogImage).toContain('/opengraph-image');
    expect(ogImage).not.toContain('northern-bytes.vercel.app');

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
      await expect(kicker).toHaveText(/^Example$/i);
      const kickerBox = await kicker.boundingBox();
      const cardBox = await page.locator('.example-card').boundingBox();
      expect(kickerBox, `kicker box at ${width}`).toBeTruthy();
      expect(cardBox, `card box at ${width}`).toBeTruthy();
      expect(kickerBox!.height, `kicker wrapped at ${width}`).toBeLessThan(22);
      expect(kickerBox!.x + kickerBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
      await page.locator('section').first().screenshot({ path: `test-results/hero-${width}.png` });
    }
  });

  test('lake contours are quiet texture clipped to hero and contact', async ({ page, request }) => {
    const res = await request.get('/lake-contours.svg');
    expect(res.status()).toBe(200);
    const svg = await res.text();
    expect(svg).not.toMatch(/#9B8CFF|#9b8cff/);
    const widths = [...svg.matchAll(/stroke-width="([0-9.]+)"/g)].map((m) => Number(m[1]));
    expect(widths.length).toBeGreaterThan(0);
    expect(Math.max(...widths)).toBe(1);
    expect((svg.match(/<path/g) || []).length).toBe(8);

    await page.goto('/');
    for (const sel of ['.hero .contours', '#contact .contours']) {
      const knob = await page.locator(sel).evaluate((el) => {
        el.style.animation = 'none';
        const style = getComputedStyle(el);
        return {
          var: style.getPropertyValue('--contour-opacity').trim(),
          opacity: Number(style.opacity),
        };
      });
      expect(Number(knob.var), sel).toBeCloseTo(0.12, 2);
      expect(knob.opacity, sel).toBeCloseTo(0.12, 2);
    }
    await expect(page.locator('.hero .contours svg path')).toHaveCount(8);
    await expect(page.locator('#contact .contours svg path')).toHaveCount(7);
    const inlineStroke = await page.locator('.hero .contours svg g').getAttribute('stroke-width');
    expect(inlineStroke).toBe('1');

    const nested = await page.locator('.hero .contours').evaluate((root) => {
      const cx = 1080;
      const cy = 700;
      const paths = [...root.querySelectorAll('path')];
      for (let t = 0; t < 1; t += 0.05) {
        let prev = 0;
        for (const p of paths) {
          const pt = p.getPointAtLength(t * p.getTotalLength());
          const r = Math.hypot(pt.x - cx, pt.y - cy);
          if (r <= prev - 0.75) return false;
          prev = r;
        }
      }
      return true;
    });
    expect(nested, 'hero rings must not intersect').toBe(true);

    function box(locator: ReturnType<typeof page.locator>) {
      return locator.boundingBox();
    }
    const heroBox = await box(page.locator('section.hero'));
    const heroContours = await box(page.locator('.hero .contours'));
    expect(heroContours!.y + heroContours!.height).toBeLessThanOrEqual(heroBox!.y + heroBox!.height + 1);
    const contactBox = await box(page.locator('#contact'));
    const contactContours = await box(page.locator('#contact .contours'));
    expect(contactContours!.y).toBeGreaterThanOrEqual(contactBox!.y - 1);
    expect(contactContours!.y + contactContours!.height).toBeLessThanOrEqual(contactBox!.y + contactBox!.height + 1);

    for (const size of [
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      await page.goto('/');
      await page.locator('.contours').evaluateAll((els) => {
        for (const el of els) el.style.animation = 'none';
      });
      await page.locator('section.hero').screenshot({ path: `test-results/hero-${size.width}.png` });
      await page.locator('#contact').scrollIntoViewIfNeeded();
      await page.locator('#contact').screenshot({ path: `test-results/contact-${size.width}.png` });
    }
  });

  test('robots.txt allows AI crawlers and sitemap lists industry pages', async ({ page }) => {
    const robots = await (await page.goto('/robots.txt'))!.text();
    for (const bot of ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended']) {
      expect(robots, `robots.txt should allow ${bot}`).toContain(bot);
    }
    expect(robots).toContain('https://minnyagents.com/sitemap.xml');

    const sitemap = await (await page.goto('/sitemap.xml'))!.text();
    for (const path of ['https://minnyagents.com', 'https://minnyagents.com/restaurants', 'https://minnyagents.com/home-services', 'https://minnyagents.com/clinics']) {
      expect(sitemap).toContain(`<loc>${path}</loc>`);
    }
    expect(sitemap).toContain('<lastmod>');
  });

  test('industry pages are honest local-intent landings', async ({ page }) => {
    const pages = [
      { path: '/restaurants', heading: /AI agents for Minneapolis restaurants/i, title: /Restaurants/i },
      { path: '/home-services', heading: /AI agents for Twin Cities home-service/i, title: /Home Services/i },
      { path: '/clinics', heading: /AI agents for Twin Cities clinics/i, title: /Clinics/i },
    ];
    for (const item of pages) {
      const response = await page.goto(item.path);
      expect(response?.status(), item.path).toBe(200);
      await expect(page.locator('h1')).toHaveText(item.heading);
      expect(await page.title()).toMatch(item.title);
      expect(await page.title()).toContain('Minny Agents');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(`https://minnyagents.com${item.path}`);
      await expect(page.locator('body')).not.toContainText('Northern Bytes');
      await expect(page.locator('body')).not.toContainText(/trusted by/i);
      expect(await page.locator('a[href^="mailto:"]').count()).toBe(0);
      expect(await page.locator('a[href^="tel:"]').count()).toBe(0);
    }
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
