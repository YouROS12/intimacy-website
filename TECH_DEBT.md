# Technical Debt & Remaining Work

> Last updated: 2026-03-31
> Build status: ✅ Passing (exit code 0, 156 static pages)
> Last commit: `5e0e3fb` on `develop`

---

## Context: What Was Already Done

Two rounds of fixes have been completed:

### Round 1 — Security & Code Quality
- XSS: `sanitizeHTML()` applied to all 4 blog renderers (`TextBlock`, `AlertBlock`, `BlogRenderer`, `SafeBlogRenderer`)
- Auth: Created `supabase-server.ts` for per-request server client; debug pages migrated
- Middleware: `/debug-*` routes protected behind auth
- SEO: Fixed canonical domain (`intimacy.ma`), sitemap paths (`/guide/`), removed broken JSON-LD
- i18n: Navbar hardcoded strings → `t()` keys, `UserRole` enum for admin checks
- Cleanup: Deleted dead files (`mockData.ts`, `LoveAtmosphere.tsx`), removed all `dark:` classes, fixed font variables, removed unused imports
- Shared `getCategoryLabel` utility — eliminated 5 `@ts-ignore`

### Round 2 — Product Page SEO
- `generateStaticParams` → 137 product pages now SSG pre-rendered
- JSON-LD: seller, priceValidUntil, shippingDetails added
- OpenGraph type fixed, Facebook product OG meta tags added
- Visible 4-level breadcrumb replacing `router.back()`
- Related products `<img>` → `<Image>` (lazy load, WebP/AVIF)
- Removed ghost `image_sitemap.xml` from robots.ts
- Replaced all `via.placeholder.com` with local SVG fallback

---

## Remaining Items (by priority)

### 1. 🔴 Home Page SSR Refactor
**Files**: `src/app/page.tsx`
**Impact**: HIGH — The home page (`/`) is the most SEO-critical page but is entirely client-rendered (`"use client"`). Google sees an empty product carousel on first crawl.

**What needs to happen**:
- Convert `page.tsx` to a Server Component
- Extract interactive parts (carousel scroll buttons) into a small `HomeClient.tsx`
- Move `getFeaturedProducts()` call from `useEffect` to server-side `await`
- Move JSON-LD scripts to server-rendered output (already there, but currently only rendered after hydration)

**Risks**: This is the highest-risk change. The page uses `useI18n()` (client-only context), so the i18n approach needs to change to `getTranslations()` from `next-intl` or pass translations as props. Test thoroughly.

**Related hardcoded strings** (also in `page.tsx`):
- "Clinical Excellence", "Dermatologist Tested", "Organic Ingredients", "Discreet Shipping"
- "Learn about our process", "Best Sellers", "Curated Selection", "Best Seller" badge
- These should be replaced with `t()` keys from `messages/fr.json` (keys already exist under `home.features.*`)

---

### 2. 🟡 Missing Translation: `Intimate Gel` Category
**File**: `messages/fr.json` → `shop.categories`
**Impact**: LOW — Shows raw English category name in the shop filter UI

**Fix**: Add to `messages/fr.json`:
```json
"categories": {
    "Lubricant": "Lubrifiants",
    "Condoms": "Préservatifs",
    "Delay Spray/Cream": "Spray/Crème Retardant",
    "Wellness Kit": "Kit Bien-être",
    "Intimate Gel": "Gel Intime"   // ← ADD THIS
}
```

Check the database for any other categories not covered. Run `npm run build` and look for `Translation missing:` warnings.

---

### 3. 🟡 Admin Page Monolith
**File**: `src/app/admin/page.tsx` (~60KB, 800+ lines)
**Impact**: MEDIUM — Performance (large JS bundle), maintainability

**What needs to happen**:
- Split into tab-specific components: `OrdersTab`, `ProductsTab`, `AnalyticsTab`, etc.
- Use `React.lazy()` or Next.js dynamic imports for code splitting
- Fix the 15+ `@ts-ignore` directives (most are due to loose `any` types on order/product objects)
- Type the admin data properly instead of using `any`

---

### 4. 🟡 Dual i18n System
**Files**: `src/contexts/I18nContext.tsx`, `middleware.ts`, `src/i18n/request.ts`
**Impact**: MEDIUM — Architectural confusion, blocks SSR i18n

**Current state**:
- `next-intl` is installed and configured (middleware, `i18n/request.ts`, `next.config.mjs`)
- But **no component uses it**. Every component uses the custom `I18nContext` with `useI18n()`
- `I18nContext` is client-only (React Context), so server components can't use `t()`

**Options**:
1. **Migrate to `next-intl` fully** — Replace all `useI18n()` with `useTranslations()` (client) and `getTranslations()` (server). Remove custom context.
2. **Remove `next-intl`** — If you don't need server-side translations or locale routing, remove `next-intl` and keep the custom context. Simpler but blocks SSR i18n.

**Recommendation**: Option 1 if you plan to do the Home Page SSR refactor (item #1). Option 2 if you want to keep things simple and don't mind the home page staying client-rendered.

---

### 5. 🟢 `<img>` → `<Image>` Migration (Remaining)
**Files**:
- `src/app/checkout/page.tsx` (line ~357) — cart item thumbnails
- `src/app/admin/page.tsx` (line ~523) — product thumbnails in admin
- `src/app/profile/page.tsx` (line ~419) — order item images
- `src/app/page.tsx` (line ~236) — home page uses `backgroundImage` CSS

**Impact**: LOW — These are all behind auth or non-SEO-critical pages. The checkout/profile/admin pages are disallowed in robots.txt. The home page one would be fixed as part of the SSR refactor.

---

### 6. 🟢 About Page `dangerouslySetInnerHTML` with i18n
**File**: `src/app/about/page.tsx` (line 21)
**Impact**: LOW — The source is static `messages/fr.json`, not user input. But the hero title uses `dangerouslySetInnerHTML={{ __html: t('hero.title') }}` to render a `<span>` tag embedded in the translation JSON.

**Fix**: Replace with JSX — split the title into parts or use `whitespace-pre-line` CSS instead of `<br>` tags in the JSON.

---

## Architecture Notes for Context

- **Supabase**: Browser client (`supabase.ts`) is for public reads only. Server ops use `supabase-server.ts` (per-request).
- **Forced Light Mode**: `color-scheme: light` in `globals.css`. All `dark:` classes have been removed.
- **Fonts**: `--font-inter` (body), `--font-lora` (serif/headings). The old `--font-playfair` variable has been renamed.
- **Images**: Product images go through `getProductImage()` which rewrites Supabase URLs to `/cdn/products/` via Next.js rewrites in `next.config.mjs`.
- **Env secrets**: All managed via Railway. `.env.local` has the same keys for local dev.
