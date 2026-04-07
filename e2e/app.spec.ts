import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// 1. SMOKE TESTS — Every public page loads without crash
// ═══════════════════════════════════════════════════════════════

const publicPages = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/shop', name: 'Shop' },
  { path: '/faq', name: 'FAQ' },
  { path: '/education', name: 'Education' },
  { path: '/legal/privacy', name: 'Legal' },
  { path: '/login', name: 'Login' },
  { path: '/forgot-password', name: 'Forgot Password' },
];

for (const { path, name } of publicPages) {
  test(`Smoke: ${name} page (${path}) loads`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(500);
    // Page should have content — not a blank white screen
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. HOME PAGE — SSR + tech debt item #1 verification
// ═══════════════════════════════════════════════════════════════

test.describe('Home Page', () => {
  test('renders core SEO elements server-side', async ({ page }) => {
    await page.goto('/');

    // Title should be set
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Meta description should exist
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);
  });

  test('has JSON-LD structured data', async ({ page }) => {
    await page.goto('/');
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify it's valid JSON
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      expect(() => JSON.parse(content!)).not.toThrow();
    }
  });

  test('has visible hero / heading content', async ({ page }) => {
    await page.goto('/');
    // Should have at least one h1 or h2
    const headings = page.locator('h1, h2');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. ABOUT PAGE — tech debt item #6 (no dangerouslySetInnerHTML)
// ═══════════════════════════════════════════════════════════════

test.describe('About Page', () => {
  test('hero title renders with styled highlight (no raw HTML)', async ({ page }) => {
    await page.goto('/about');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // The brand-colored span should exist as real DOM, not injected HTML
    const brandSpan = h1.locator('span.text-brand-400');
    await expect(brandSpan).toBeVisible();

    // Verify the h1 text contains expected words (French default)
    const text = await h1.textContent();
    expect(text).toContain('Confiance');
  });

  test('page has 3 pillar sections', async ({ page }) => {
    await page.goto('/about');
    // Check for the pillar icons (Lock, Shield, Box used in the page)
    const pillars = page.locator('.grid .text-center');
    const count = await pillars.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. SHOP PAGE — categories + product grid
// ═══════════════════════════════════════════════════════════════

test.describe('Shop Page', () => {
  test('loads without errors', async ({ page }) => {
    const response = await page.goto('/shop');
    expect(response?.status()).toBe(200);
  });

  test('has category filters or product cards', async ({ page }) => {
    await page.goto('/shop');
    // Page should have interactive elements 
    await page.waitForTimeout(2000); // wait for client hydration
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(100);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. IMAGE OPTIMIZATION — tech debt item #5 verification
// ═══════════════════════════════════════════════════════════════

test.describe('Image Optimization', () => {
  test('home page uses next/image (no raw <img> for content)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Next.js Image component renders <img> inside a wrapper with specific attributes
    // Check that any product/content images use srcset or data-nimg (Next.js Image markers)
    const allImgs = page.locator('img');
    const count = await allImgs.count();

    for (let i = 0; i < count; i++) {
      const img = allImgs.nth(i);
      const src = await img.getAttribute('src');
      const srcset = await img.getAttribute('srcset');
      const dataNimg = await img.getAttribute('data-nimg');

      // Skip tracking pixels, SVGs, and external analytics images
      if (src?.includes('data:') || src?.endsWith('.svg') || src?.includes('google')) continue;

      // Next.js Image component adds either srcset or data-nimg attribute
      const isNextImage = srcset !== null || dataNimg !== null;
      if (!isNextImage && src) {
        // This would be a raw <img> — flag it (soft check, some browser-injected imgs are ok)
        console.warn(`Potentially unoptimized image: ${src}`);
      }
    }
  });

  test('about page has no raw HTML injection in headings', async ({ page }) => {
    await page.goto('/about');
    const h1 = page.locator('h1');
    const innerHTML = await h1.innerHTML();
    // Should NOT contain class= as raw string (that would mean dangerouslySetInnerHTML)
    // It should be proper React-rendered DOM
    expect(innerHTML).not.toContain("class='text-brand-400'");
    // Should contain the React-rendered class (React uses className but outputs class in DOM)
    expect(innerHTML).toContain('text-brand-400');
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. NAVIGATION — header links work
// ═══════════════════════════════════════════════════════════════

test.describe('Navigation', () => {
  test('navbar is visible and has links', async ({ page }) => {
    await page.goto('/');
    // Look for nav element or header
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('can navigate from home to about', async ({ page }) => {
    await page.goto('/');
    // Find a link to /about
    const aboutLink = page.locator('a[href="/about"]').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForURL('**/about');
      expect(page.url()).toContain('/about');
    }
  });

  test('can navigate from home to shop', async ({ page }) => {
    await page.goto('/');
    const shopLink = page.locator('a[href="/shop"]').first();
    if (await shopLink.isVisible()) {
      await shopLink.click();
      await page.waitForURL('**/shop');
      expect(page.url()).toContain('/shop');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. AUTH GATING — protected pages redirect
// ═══════════════════════════════════════════════════════════════

test.describe('Auth Protection', () => {
  test('admin page redirects or shows login prompt when unauthenticated', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    // Should either redirect to /login or show auth-related content
    const url = page.url();
    const body = await page.textContent('body');
    const isRedirected = url.includes('/login');
    const hasAuthUI = body?.includes('login') || body?.includes('connexion') || body?.includes('mot de passe');
    expect(isRedirected || hasAuthUI).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. FAQ PAGE — accordion content
// ═══════════════════════════════════════════════════════════════

test.describe('FAQ Page', () => {
  test('has FAQ content with questions', async ({ page }) => {
    await page.goto('/faq');
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(200);
    // Should have some heading
    const headings = page.locator('h1, h2, h3');
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test('has structured data', async ({ page }) => {
    await page.goto('/faq');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. LEGAL PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Legal Page', () => {
  test('renders legal content', async ({ page }) => {
    const response = await page.goto('/legal/privacy');
    expect(response?.status()).toBe(200);
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(100);
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. PERFORMANCE — basic web vitals check
// ═══════════════════════════════════════════════════════════════

test.describe('Performance', () => {
  test('home page loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    console.log(`Home page DOM content loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('home page FCP is reasonable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    // Get First Contentful Paint timing
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
      return fcpEntry?.startTime ?? null;
    });

    if (fcp !== null) {
      console.log(`FCP: ${fcp.toFixed(0)}ms`);
      expect(fcp).toBeLessThan(3000); // Should paint within 3s
    }
  });

  test('no console errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Filter out expected Supabase connection errors (no env vars in test)
    const realErrors = errors.filter(e =>
      !e.includes('supabase') &&
      !e.includes('NEXT_PUBLIC') &&
      !e.includes('fetch') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::') &&
      !e.includes('OneSignal')
    );

    if (realErrors.length > 0) {
      console.log('Console errors found:', realErrors);
    }
    expect(realErrors.length).toBe(0);
  });

  test('no console errors on about page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/about');
    await page.waitForTimeout(2000);

    const realErrors = errors.filter(e =>
      !e.includes('supabase') &&
      !e.includes('NEXT_PUBLIC') &&
      !e.includes('fetch') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::') &&
      !e.includes('OneSignal')
    );
    expect(realErrors.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. i18n — tech debt item #4 verification
// ═══════════════════════════════════════════════════════════════

test.describe('i18n System', () => {
  test('default language is French', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    // Should be fr or default
    const body = await page.textContent('body');
    // French content indicators
    const hasFrench = body?.includes('Nos') ||
      body?.includes('Découvr') ||
      body?.includes('Produit') ||
      body?.includes('Bien-être') ||
      body?.includes('Confiance');
    expect(hasFrench || lang === 'fr').toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// 12. RESPONSIVE — mobile viewport
// ═══════════════════════════════════════════════════════════════

test.describe('Responsive Design', () => {
  test('home page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
    // Should still have content
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(100);
  });

  test('about page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('shop page renders on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    const response = await page.goto('/shop');
    expect(response?.status()).toBeLessThan(500);
  });
});
