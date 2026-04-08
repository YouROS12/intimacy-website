# SEO & GEO Optimization Roadmap — intimacy.ma

> **Goal**: Optimize for Google rankings + AI-discovery (ChatGPT, Perplexity, Claude)  
> **Stack**: Next.js 16 App Router, Supabase, Tailwind  
> **Market**: Morocco (.ma TLD, MAD currency, fr/en/ar)

---

## Phase 1: JSON-LD Structured Data (Critical)

### 1.1 — Fix Missing JSON-LD on Solution Pages
- **File**: `src/app/solution/[slug]/page.tsx`
- **Add**: `Article` + `BreadcrumbList` schema with dynamic data
- **Status**: ✅ Done — Article + BreadcrumbList JSON-LD added

### 1.2 — Add `ItemList` JSON-LD to Shop Page
- **File**: `src/app/shop/page.tsx`
- **Add**: `ItemList` schema listing products with position, name, URL
- **Status**: ✅ Done

### 1.3 — Add `CollectionPage` JSON-LD to Education Page
- **File**: `src/app/education/page.tsx`
- **Add**: `CollectionPage` + `ItemList` for guides/posts
- **Status**: ✅ Done

### 1.4 — Enhance Homepage Organization Schema
- **File**: `src/app/page.tsx`
- **Add**: `sameAs` (social links), `address` (Morocco), `LocalBusiness`/`OnlineStore` type
- **Status**: ✅ Done — Organization + OnlineStore + WebSite schemas added

### 1.5 — Add `BreadcrumbList` to FAQ, Education, Guide Pages
- **Files**: `faq/page.tsx`, `education/page.tsx`, `guide/[slug]/page.tsx`
- **Status**: ✅ Done — All three pages now have BreadcrumbList JSON-LD

---

## Phase 2: GEO-Friendly Metadata (OpenGraph + Twitter)

### 2.1 — Fix About Page Metadata (Critical)
- **File**: `src/app/about/page.tsx` — currently `'use client'`, can't export metadata
- **Fix**: Create `src/app/about/layout.tsx` with metadata OR convert to server component
- **Status**: ✅ Done — layout.tsx created with full OG + Twitter metadata

### 2.2 — Enrich Shop, Education, FAQ OG/Twitter Tags
- **Files**: `shop/page.tsx`, `education/page.tsx`, `faq/page.tsx`
- **Add**: Full OG (image, url, locale, siteName) + Twitter card
- **Emphasis**: "Livraison Discrète au Maroc" + "Expertise Locale Marocaine"
- **Status**: ✅ Done — All three pages have full OG + Twitter

### 2.3 — Complete Guide Page OG/Twitter
- **File**: `src/app/guide/[slug]/page.tsx`
- **Add**: Twitter card, OG locale, OG siteName, article:author, article:published_time
- **Status**: ✅ Done — Full OG (locale, siteName, type:article) + Twitter card

### 2.4 — Add Full OG/Twitter to Solution Pages
- **File**: `src/app/solution/[slug]/page.tsx`
- **Add**: Complete OG + Twitter metadata
- **Status**: ✅ Done — Full OG + Twitter with dynamic content

---

## Phase 3: llms.txt Optimization (AI Discovery)

### 3.1 — Rewrite llms.txt for LLM Ingestion
- **File**: `public/llms.txt`
- **Improvements**:
  - Fix `/blog` → `/guide/` route reference
  - Add `/solution/` pages section
  - Add product count and price ranges
  - Add return policy, payment methods (COD, CashPlus)
  - Structure with clear Markdown headers for AI parsing
  - Add FAQ highlights inline
- **Status**: ✅ Done — Fully rewritten with all sections

---

## Phase 4: Semantic HTML & Heading Hierarchy

### 4.1 — Fix FAQ Heading Hierarchy (H1 → H3 skip)
- **File**: `src/app/faq/page.tsx`
- **Fix**: Add H2 wrapper or change question headings from H3 → H2
- **Status**: ✅ Done — Questions now use H2

### 4.2 — Fix About Page Heading Hierarchy (H1 → H3 skip)
- **File**: `src/app/about/page.tsx`
- **Fix**: Add H2 level between hero H1 and feature H3s
- **Status**: ✅ Done — 3 pillars use H2, process steps changed H4 → H3

### 4.3 — Fix Shop H1 DOM Order
- **File**: Client component rendering H1 after H2/H3 in DOM order
- **Fix**: Ensure H1 renders first in the document flow
- **Status**: ✅ OK — H1 renders first; mobile filter H2/H3 are conditionally rendered

### 4.4 — Fix Education Page Missing H2
- **File**: `src/components/EducationClient.tsx`
- **Fix**: Add H2 section titles before H3 article cards
- **Status**: ✅ Done — H2 "Articles & Guides" added before grid

---

## Phase 5: Technical SEO Hardening

### 5.1 — Add Solution Pages to Sitemap
- **File**: `src/app/sitemap.ts`
- **Add**: All `/solution/[slug]` pages with proper priority/frequency
- **Status**: ✅ Done — pseoPages mapped with priority 0.7

### 5.2 — Add `PerplexityBot` to AI Bot Rules
- **File**: `src/app/robots.ts`
- **Add**: `PerplexityBot` to the AI crawler allowlist
- **Status**: ✅ Done

### 5.3 — Fix robots.ts Inconsistency
- **File**: `src/app/robots.ts`
- **Fix**: Align disallow rules between general and AI-specific user-agents
- **Status**: ✅ Done — Consistent disallow rules across both rule sets

---

## Execution Order

| Step | Task | Impact | Status |
|------|------|--------|--------|
| 1 | 2.1 — About page metadata | 🔴 Critical | ✅ Done |
| 2 | 1.1 — Solution JSON-LD | 🔴 Critical | ✅ Done |
| 3 | 5.1 — Solution pages in sitemap | 🔴 Critical | ✅ Done |
| 4 | 1.4 — Homepage LocalBusiness schema | 🟡 High | ✅ Done |
| 5 | 2.2 — Shop/Education/FAQ OG enrichment | 🟡 High | ✅ Done |
| 6 | 1.2 — Shop ItemList JSON-LD | 🟡 High | ✅ Done |
| 7 | 1.3 — Education CollectionPage JSON-LD | 🟡 Medium | ✅ Done |
| 8 | 2.3–2.4 — Guide/Solution OG completion | 🟡 Medium | ✅ Done |
| 9 | 1.5 — Breadcrumbs on more pages | 🟡 Medium | ✅ Done |
| 10 | 3.1 — llms.txt rewrite | 🟡 Medium | ✅ Done |
| 11 | 4.1–4.4 — Heading hierarchy fixes | 🟢 Nice | ✅ Done |
| 12 | 5.2–5.3 — robots.ts cleanup | 🟢 Nice | ✅ Done |

---

## What We're NOT Doing (Out of Scope)

- ❌ Server-side i18n migration (too large — separate project)
- ❌ hreflang tags (depends on SSR i18n)
- ❌ AggregateRating (no review system exists yet)
- ❌ Dynamic image sitemap (static one is sufficient for now)
- ❌ Security headers (separate concern)
