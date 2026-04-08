# Technical Debt & Remaining Work

> Last updated: 2026-04-07
> Build status: ✅ Passing (exit code 0)
> Last commit: `5e0e3fb` on `develop`

---

## Context: What Was Already Done

Four rounds of fixes have been completed:

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

### Round 3 — Complete SEO & GEO Roadmap (12/12 tasks)
- JSON-LD: Solution pages (Article + BreadcrumbList), Shop (ItemList), Education (CollectionPage + BreadcrumbList), FAQ (FAQPage + BreadcrumbList), Guide (Article + BreadcrumbList)
- Homepage: Organization + OnlineStore + WebSite schemas with sameAs, address, SearchAction
- OG/Twitter: Full metadata on About (via layout.tsx), Shop, Education, FAQ, Guide, Solution pages
- llms.txt: Complete rewrite with all sections, correct routes, FAQ highlights
- Heading hierarchy: FAQ H3→H2, About H4→H3, Education added H2 before cards
- Sitemap: Solution pages added with priority 0.7
- robots.ts: PerplexityBot added, disallow rules aligned

### Round 4 — Tech Debt Cleanup
- Home Page SSR: Converted to server component, `getFeaturedProducts()` server-side, JSON-LD server-rendered, hardcoded strings → `t()` keys from `messages/fr.json`
- Admin Monolith: Split into `OverviewTab`, `OrdersTab`, `InventoryTab`, `SeoTab` with `dynamic()` imports
- `Intimate Gel` translation: Added to all 3 locale files (fr/en/ar)
- `<img>` → `<Image>`: All remaining instances migrated (0 `<img>` tags in src/)
- About `dangerouslySetInnerHTML`: Removed from hero title
- `@ts-ignore`: All instances eliminated from source files

---

## Remaining Items (by priority)

### 1. ✅ DONE — Home Page SSR Refactor
**Status**: Completed in Round 4. Server component with server-side data fetching.

---

### 2. ✅ DONE — Missing Translation: `Intimate Gel` Category
**Status**: Completed. Present in all 3 locale files.

---

### 3. ✅ DONE — Admin Page Monolith
**Status**: Completed in Round 4. Split into 4 tab components with dynamic imports.

---

### 4. 🟡 Dual i18n System
**Files**: `src/contexts/I18nContext.tsx`, `middleware.ts`, `src/i18n/request.ts`
**Impact**: MEDIUM — Architectural confusion, blocks SSR i18n

**Current state**:
- `next-intl` is installed and configured (middleware, `i18n/request.ts`, `next.config.mjs`)
- But **no component uses it**. Every component uses the custom `I18nContext` with `useI18n()`
- `I18nContext` is client-only (React Context), so server components can't use `t()`
- The home page works around this with a local `t()` helper reading `messages/fr.json` directly

**Options**:
1. **Migrate to `next-intl` fully** — Replace all `useI18n()` with `useTranslations()` (client) and `getTranslations()` (server). Remove custom context.
2. **Remove `next-intl`** — If you don't need server-side translations or locale routing, remove `next-intl` and keep the custom context. Simpler but blocks SSR i18n.

**Recommendation**: Option 1 for full SSR i18n. Option 2 for simplicity. This is a deliberate architectural decision — not a bug.

---

### 5. ✅ DONE — `<img>` → `<Image>` Migration
**Status**: Completed. Zero `<img>` tags remain in src/.

---

### 6. ✅ DONE — About Page `dangerouslySetInnerHTML`
**Status**: Completed. Hero title no longer uses `dangerouslySetInnerHTML`.

---

## Architecture Notes for Context

- **Supabase**: Browser client (`supabase.ts`) is for public reads only. Server ops use `supabase-server.ts` (per-request).
- **Forced Light Mode**: `color-scheme: light` in `globals.css`. All `dark:` classes have been removed.
- **Fonts**: `--font-inter` (body), `--font-lora` (serif/headings). The old `--font-playfair` variable has been renamed.
- **Images**: Product images go through `getProductImage()` which rewrites Supabase URLs to `/cdn/products/` via Next.js rewrites in `next.config.mjs`.
- **Env secrets**: All managed via Railway. `.env.local` has the same keys for local dev.
