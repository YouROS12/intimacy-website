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

// ═══════════════════════════════════════════════════════════════
// 13. EDUCATION PAGE — content + structured data
// ═══════════════════════════════════════════════════════════════

test.describe('Education Page', () => {
  test('loads with heading hierarchy H1 → H2', async ({ page }) => {
    await page.goto('/education');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const h2 = page.locator('h2');
    expect(await h2.count()).toBeGreaterThan(0);
  });

  test('has CollectionPage + BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/education');
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      const parsed = JSON.parse(content!);
      types.push(parsed['@type']);
    }
    expect(types).toContain('CollectionPage');
    expect(types).toContain('BreadcrumbList');
  });

  test('has full OG metadata', async ({ page }) => {
    await page.goto('/education');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveAttribute('content', 'fr_MA');
  });
});

// ═══════════════════════════════════════════════════════════════
// 14. PRODUCT PAGE — SEO structured data
// ═══════════════════════════════════════════════════════════════

test.describe('Product Page SEO', () => {
  test('product page has Product + BreadcrumbList JSON-LD', async ({ page }) => {
    // Go to shop, find first product link
    await page.goto('/shop');
    await page.waitForTimeout(2000);
    const productLink = page.locator('a[href^="/product/"]').first();
    if (await productLink.isVisible()) {
      const href = await productLink.getAttribute('href');
      await page.goto(href!);

      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();
      expect(count).toBeGreaterThanOrEqual(2);

      const types: string[] = [];
      for (let i = 0; i < count; i++) {
        const content = await jsonLdScripts.nth(i).textContent();
        const parsed = JSON.parse(content!);
        types.push(parsed['@type']);
      }
      expect(types).toContain('Product');
      expect(types).toContain('BreadcrumbList');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 15. SOLUTION PAGE — loads and has structured data
// ═══════════════════════════════════════════════════════════════

test.describe('Solution Page', () => {
  test('solution pages are accessible from education', async ({ page }) => {
    await page.goto('/education');
    await page.waitForTimeout(2000);
    const solutionLink = page.locator('a[href^="/guide/"]').first();
    if (await solutionLink.isVisible()) {
      await solutionLink.click();
      await page.waitForTimeout(2000);
      // Should have Article JSON-LD
      const jsonLd = page.locator('script[type="application/ld+json"]');
      expect(await jsonLd.count()).toBeGreaterThanOrEqual(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 16. CART — add to cart flow
// ═══════════════════════════════════════════════════════════════

test.describe('Cart Interaction', () => {
  test('cart drawer can be toggled', async ({ page }) => {
    await page.goto('/');
    // Look for the cart/bag icon button in navbar
    const cartButton = page.locator('button').filter({ has: page.locator('[class*="ShoppingBag"], svg') }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await page.waitForTimeout(500);
      // Cart drawer or empty state should appear
      const body = await page.textContent('body');
      const hasCartUI = body?.includes('panier') || body?.includes('cart') || body?.includes('vide') || body?.includes('empty');
      expect(hasCartUI).toBeTruthy();
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 17. SEO META — canonical + hreflang on key pages
// ═══════════════════════════════════════════════════════════════

test.describe('SEO Meta Tags', () => {
  const pagesWithCanonicals = [
    { path: '/', name: 'Home' },
    { path: '/shop', name: 'Shop' },
    { path: '/about', name: 'About' },
    { path: '/faq', name: 'FAQ' },
    { path: '/education', name: 'Education' },
  ];

  for (const { path, name } of pagesWithCanonicals) {
    test(`${name} page has canonical URL`, async ({ page }) => {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', /intimacy\.ma/);
    });
  }

  test('robots meta allows indexing on public pages', async ({ page }) => {
    await page.goto('/');
    // Should NOT have noindex
    const robotsMeta = page.locator('meta[name="robots"]');
    if (await robotsMeta.count() > 0) {
      const content = await robotsMeta.getAttribute('content');
      expect(content).not.toContain('noindex');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 18. HOMEPAGE — JSON-LD completeness
// ═══════════════════════════════════════════════════════════════

test.describe('Homepage Schema Completeness', () => {
  test('has Organization + OnlineStore + WebSite schemas', async ({ page }) => {
    await page.goto('/');
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      const parsed = JSON.parse(content!);
      types.push(parsed['@type']);
    }
    expect(types).toContain('Organization');
    expect(types).toContain('OnlineStore');
    expect(types).toContain('WebSite');
  });

  test('Organization has sameAs social links', async ({ page }) => {
    await page.goto('/');
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();

    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      const parsed = JSON.parse(content!);
      if (parsed['@type'] === 'Organization') {
        expect(parsed.sameAs).toBeDefined();
        expect(parsed.sameAs.length).toBeGreaterThanOrEqual(1);
        expect(parsed.contactPoint).toBeDefined();
        expect(parsed.address).toBeDefined();
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 19. 404 PAGE — not found handling
// ═══════════════════════════════════════════════════════════════

test.describe('404 Page', () => {
  test('returns 404 for non-existent page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    expect(response?.status()).toBe(404);
  });

  test('returns 404 for non-existent product', async ({ page }) => {
    const response = await page.goto('/product/non-existent-product-slug-xyz');
    expect(response?.status()).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════
// 20. SHOP PAGE — filters & ItemList JSON-LD
// ═══════════════════════════════════════════════════════════════

test.describe('Shop Page Details', () => {
  test('has ItemList JSON-LD', async ({ page }) => {
    await page.goto('/shop');
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    let hasItemList = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      const parsed = JSON.parse(content!);
      if (parsed['@type'] === 'ItemList') {
        hasItemList = true;
        expect(parsed.itemListElement.length).toBeGreaterThan(0);
      }
    }
    expect(hasItemList).toBeTruthy();
  });

  test('has H1 heading', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(2000);
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('has OG metadata', async ({ page }) => {
    await page.goto('/shop');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogSiteName = page.locator('meta[property="og:site_name"]');
    await expect(ogSiteName).toHaveAttribute('content', /Intimacy/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 21. FAQ PAGE — structured data validation
// ═══════════════════════════════════════════════════════════════

test.describe('FAQ Page Details', () => {
  test('has FAQPage + BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/faq');
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      const parsed = JSON.parse(content!);
      types.push(parsed['@type']);
    }
    expect(types).toContain('FAQPage');
    expect(types).toContain('BreadcrumbList');
  });

  test('has proper heading hierarchy (H1 then H2)', async ({ page }) => {
    await page.goto('/faq');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const h2s = page.locator('h2');
    expect(await h2s.count()).toBeGreaterThan(0);
  });

  test('has OG + Twitter metadata', async ({ page }) => {
    await page.goto('/faq');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });
});

// ═══════════════════════════════════════════════════════════════
// 22. ABOUT PAGE — metadata from layout.tsx
// ═══════════════════════════════════════════════════════════════

test.describe('About Page SEO', () => {
  test('has full OG + Twitter metadata', async ({ page }) => {
    await page.goto('/about');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveAttribute('content', 'fr_MA');
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/about');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /intimacy\.ma\/about/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 23. FOOTER — links work
// ═══════════════════════════════════════════════════════════════

test.describe('Footer', () => {
  test('footer is visible with legal links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Should contain links to legal pages
    const privacyLink = footer.locator('a[href="/legal/privacy"]');
    await expect(privacyLink).toBeVisible();
    const termsLink = footer.locator('a[href="/legal/terms"]');
    await expect(termsLink).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 24. LEGAL PAGES — all legal pages load
// ═══════════════════════════════════════════════════════════════

test.describe('Legal Pages', () => {
  const legalPages = [
    { path: '/legal/privacy', name: 'Privacy' },
    { path: '/legal/terms', name: 'Terms' },
    { path: '/legal/returns', name: 'Returns' },
  ];

  for (const { path, name } of legalPages) {
    test(`${name} page loads with content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      const body = await page.textContent('body');
      expect(body!.length).toBeGreaterThan(200);
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// 25. CONSOLE ERRORS — check more pages
// ═══════════════════════════════════════════════════════════════

test.describe('Console Errors', () => {
  const pagesToCheck = [
    { path: '/shop', name: 'Shop' },
    { path: '/faq', name: 'FAQ' },
    { path: '/education', name: 'Education' },
  ];

  for (const { path, name } of pagesToCheck) {
    test(`no console errors on ${name} page`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(path);
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
  }
});

// ═══════════════════════════════════════════════════════════════
// 26. SITEMAP & ROBOTS — accessible
// ═══════════════════════════════════════════════════════════════

test.describe('Sitemap & Robots', () => {
  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('urlset');
    expect(content).toContain('intimacy.ma');
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('User-agent');
    expect(content).toContain('Sitemap');
  });

  test('llms.txt is accessible', async ({ page }) => {
    const response = await page.goto('/llms.txt');
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('Intimacy');
  });
});
