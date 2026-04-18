# SEO & GEO Action Plan — intimacy.ma
> Goal: Page 1 Google Morocco + cited by ChatGPT / Perplexity / Claude  
> Last updated: April 2026 | All on-page technical SEO is complete ✅

---

## CODE CHANGES APPLIED (this session)

| File | Change |
|---|---|
| `src/app/product/[slug]/page.tsx` | Keyword-rich title/description fallbacks with brand, price, Morocco context; OG type `article` → `website`; French category labels in breadcrumb JSON-LD |
| `src/app/shop/page.tsx` | Keyword-rich metadata (préservatifs, lubrifiants, COD); fixed `ItemList` JSON-LD to use `getProductSlug()` |
| `src/app/faq/page.tsx` | 2 stub questions → 12 full keyword-rich Q&A (covers: discrete delivery, cities, payment, authenticity, returns, account-free orders) |
| `src/app/guide/[slug]/page.tsx` | Added `publishedTime`, `modifiedTime`, `authors` to OG metadata for fresher signal |
| `src/app/robots.ts` | Added `OAI-SearchBot`, `cohere-ai`, `AI2Bot`, `Applebot-Extended`, `Googlebot-News` to AI allowlist |
| `src/app/sitemap.ts` | Added `/legal/privacy`, `/legal/terms`, `/legal/returns` to sitemap |
| `src/app/layout.tsx` | Default description now includes product categories and COD keyword |

---

## IMMEDIATE ACTIONS (Do today — free, high impact)

### 1. Verify & Deploy
- [ ] Make sure Railway is pulling from `main` branch (just updated)
- [ ] Trigger manual deploy if needed
- [ ] Confirm `https://intimacy.ma/sitemap.xml` is live and loads

### 2. Google Search Console
- [ ] Go to https://search.google.com/search-console
- [ ] Add property → Domain → `intimacy.ma`
- [ ] Verify ownership (DNS TXT record — ask your domain registrar)
- [ ] Submit sitemap: `https://intimacy.ma/sitemap.xml`
- [ ] Request indexing manually on these 10 pages:
  - `https://intimacy.ma`
  - `https://intimacy.ma/shop`
  - `https://intimacy.ma/faq`
  - `https://intimacy.ma/education`
  - `https://intimacy.ma/about`
  - Top 5 product pages (your bestsellers)

### 3. Bing Webmaster Tools
- [ ] Go to https://www.bing.com/webmasters
- [ ] Import from Google Search Console (one click)
- [ ] Bing feeds **Copilot** search results — this is your LLM gateway

### 4. Google Business Profile
- [ ] Create profile at https://business.google.com
- [ ] Category: "Online retailer" + "Health & wellness store"
- [ ] Add: website, WhatsApp, photos of products, description with keywords
- [ ] This alone can get you on page 1 for local Morocco searches

---

## WEEK 1–2: LLM Discovery

LLMs cite sources that are referenced on other authoritative pages. You need mentions.

### Submit to AI Crawlers
- [ ] Perplexity: Go to https://www.perplexity.ai and search `intimacy.ma` — first step to get indexed
- [ ] CommonCrawl: Ensure your site is crawlable (robots.ts now allows CCBot ✅)
- [ ] Your `llms.txt` is already at `https://intimacy.ma/llms.txt` — Perplexity reads this ✅

### Get Brand Mentions (= LLM citations)
LLMs learn from web pages. The more authoritative sites mention "intimacy.ma" with context, the more LLMs will cite you.

**Priority targets:**
| Platform | Action | Effort |
|---|---|---|
| Reddit r/maroc | Answer questions about bien-être intime, link naturally | Low |
| Quora (French) | Answer "où acheter des préservatifs au Maroc" | Low |
| Wikipedia | If possible, add intimacy.ma as a reference on relevant articles | Medium |
| Moroccan forums (Marocshop, etc.) | Create a brand presence thread | Low |

---

## MONTH 1: Content Strategy (Biggest Google Lever)

Google ranks **pages**, not sites. Each guide = one more chance to rank for a keyword.

### Target Keywords (French — high Morocco intent)
| Keyword | Monthly searches (est.) | Target page |
|---|---|---|
| `préservatif en ligne maroc` | 500–1000 | `/shop` or new landing page |
| `lubrifiant intime maroc` | 300–600 | `/shop?category=Lubricant` or guide |
| `achat préservatif discret maroc` | 200–400 | `/faq` or `/shop` |
| `durex prix maroc` | 400–800 | Product page for Durex |
| `manix maroc` | 300–500 | Product page or brand page |
| `hygiène intime femme maroc` | 200–400 | New solution page |
| `livraison discrete maroc` | 150–300 | Homepage / FAQ |
| `comment utiliser un lubrifiant` | 200–500 | New guide article |

### Content Calendar (2 guides/month minimum)
Each guide should be:
- 800–1500 words
- H1 = exact keyword
- H2 = subtopics (What is it? How to use it? Which products? FAQ)
- Internal links to 2–3 product pages
- JSON-LD Article schema (already auto-added ✅)

**Suggested upcoming guides:**
1. "Quel préservatif choisir au Maroc ? Guide complet 2026"
2. "Lubrifiant intime : comment choisir et comment l'utiliser"
3. "Hygiène intime féminine : les erreurs à éviter"
4. "Durex vs Manix : comparatif au Maroc"
5. "Livraison discrète au Maroc : comment ça fonctionne ?"
6. "Paiement à la livraison (COD) au Maroc : mode d'emploi"

---

## MONTH 1–3: Backlinks (Off-Page SEO)

Backlinks are the #1 Google ranking factor. You need **quality Moroccan sites** linking to you.

### Priority link targets
| Target | How | Priority |
|---|---|---|
| **Manix / Durex Morocco distributor pages** | Ask to be listed as authorized Moroccan reseller | 🔴 High |
| **Moroccan health/lifestyle blogs** | Sponsored review or product sample | 🔴 High |
| **TelQuel, Medias24, H24info** | Press release: "premier e-commerce bien-être intime au Maroc" | 🔴 High |
| **Jumia.ma / Avito.ma** | List products as seller, add website link | 🟡 Medium |
| **YouTube Maroc influencers** | Send free products for unboxing, ask for link in bio | 🟡 Medium |
| **Pharmacie blogs** | Guest post about intimate health | 🟡 Medium |
| **Directories** | yellowpages.ma, annuaire.ma, etc. | 🟢 Low |

### How to get press coverage
Template email to send to journalists:
```
Objet: [Exclusivité] La première boutique bien-être intime 100% discrète au Maroc

Bonjour,

intimacy.ma est la première boutique en ligne spécialisée dans le bien-être 
intime au Maroc, avec livraison 100% discrète en 24-48h et paiement à la livraison.

Nous serions ravis de vous offrir un accès exclusif à notre catalogue...
```

---

## ONGOING: Monitoring & Iteration

### Weekly (15 min)
- [ ] Check Google Search Console → Coverage → fix any crawl errors
- [ ] Note top 10 queries bringing traffic → double down on those topics

### Monthly (30 min)
- [ ] Search Console → Core Web Vitals → ensure green
- [ ] Search Console → Performance → compare impressions month-over-month
- [ ] Check if any product pages have `seo_title` / `seo_description` still empty in Supabase → fill them

### Fill SEO fields in your Supabase products table
The product page code now generates good automatic fallbacks, but **manually written** `seo_title` and `seo_description` always win. For each bestseller:

**seo_title formula**: `{Product Name} {Brand} — Achat Maroc | Intimacy`  
Example: `Durex Performax Intense — Livraison Discrète Maroc | Intimacy`

**seo_description formula** (max 155 chars):  
`Achetez {Product} de {Brand} à {Price} MAD. {Key benefit}. Livraison discrète 24-48h au Maroc. Paiement à la livraison.`

### seo_slug format
Ensure every product has an `seo_slug` in Supabase:
- Use lowercase kebab-case: `durex-performax-intense-preservatif-12`
- Include brand + product type + key feature
- Avoid UUIDs in URLs (code already handles redirect ✅)

---

## ADVANCED (Month 3+)

### hreflang for Arabic SEO
Currently blocked by the dual i18n system (see TECH_DEBT.md item #4).  
Once i18n is migrated to `next-intl`:
- Add `hreflang` links: `fr-MA`, `ar-MA`, `en`
- Arabic keyword research — huge untapped market in Morocco

### AggregateRating Schema
Once you have reviews:
- Add review system to product pages
- Add `AggregateRating` to product JSON-LD
- This shows **star ratings in Google search results** → massive CTR boost

### Performance (CWV)
- Lighthouse score should stay > 90 on mobile
- Monitor LCP (Largest Contentful Paint) — hero image on homepage
- Consider adding `sizes` prop to all `<Image>` components

---

## KPIs to Track

| Metric | Current (baseline) | Target (3 months) |
|---|---|---|
| Google impressions/month | unknown | 5,000+ |
| Indexed pages | unknown | 200+ |
| Avg position for brand keywords | unknown | < 5 |
| Organic clicks/month | unknown | 500+ |
| LLM citations (search "intimacy.ma" in Perplexity/ChatGPT) | 0 | 5+ |

Set baseline today by checking Search Console after verification.
