# Technical SEO Implementation Playbook for Crawlability, Indexability, and Search Performance

**Document purpose (explicit):** A comprehensive, prioritized, and actionable technical SEO implementation guide based primarily on official Google documentation and other authoritative sources. Scope includes site-wide, section-level (product/category/blog), and page-level technical implementation details (templates, code snippets), with testing, monitoring, and deployment plans. citeturn23search8turn33search5

**What is unspecified (explicitly not assumed):**
- Website platform/CMS: **Unspecified** (notes provided for common platforms).
- Site scale (page count / SKU count): **Unspecified** (small vs large-scale guidance included).
- Server environment (shared/VPS/cloud/CDN): **Unspecified** (common environment-dependent notes included).
- Your site URL: **Unspecified** (no live crawling performed; examples are generic).

**Code + templates pack (download):** [Download the ZIP](sandbox:/mnt/data/technical_seo_playbook_assets/technical_seo_code_pack.zip)

## Executive summary and prioritized action plan

Technical SEO improvements that most reliably increase crawlability and indexability are: (1) correct crawl controls (robots.txt + noindex + canonicals + redirects), (2) a clean, finite URL inventory (especially for faceted navigation), (3) accurate sitemaps, (4) stable internal linking architecture, and (5) performant rendering (Core Web Vitals + JavaScript SEO fundamentals). citeturn28search3turn26search2turn28search10turn24view0turn9search2turn18search0turn34view0turn11search4

### Priority definitions used in this report
- **Critical:** Can block crawling or indexing at scale, or cause widespread duplicate/soft-404/redirect waste.
- **High:** Strong impact on discoverability and performance; common root causes of “not indexed” issues.
- **Medium:** Improves richness, efficiency, and resilience; may require coordination.
- **Low:** Nice-to-have, incremental gains, or dependent on later maturity.

### Critical / High actions you can start immediately (platform-agnostic)
- Ensure **robots.txt is valid, reachable, cached correctly, and only controls crawling** (not indexing). citeturn19search1turn35view0turn20search0turn19search11  
- Implement **noindex via meta robots or X‑Robots‑Tag headers** for pages/files that must not appear in Search; never rely on robots.txt for removals. citeturn26search2turn27view0turn19search1  
- Implement consistent **canonicalization** and avoid canonical + redirect conflicts; use permanent redirects where the URL truly changes. citeturn28search10turn6view0turn30view0  
- Control **faceted navigation URL explosion** (disallow crawling of non-indexable facets, or redesign to fragments; return 404 for nonsensical facet combos). citeturn34view0turn24view0  
- Ship accurate **XML sitemaps** (prefer sitemap indexes for scale), keep them updated, and use **lastmod only when truthful**; do not invest effort in changefreq/priority (Google doesn’t use them). citeturn11search4turn22view0turn21search0turn11search8  
- Fix **Core Web Vitals** issues using a “measure → fix → verify” loop; note that **INP replaced FID** in Core Web Vitals. citeturn9search2turn9search0turn9search1turn9search16turn9search5  
- If you rely on client-side rendering, ensure **critical content/links are present without user interaction**; implement lazy-loading so that content loads when visible in the viewport. citeturn18search0turn18search2  

### Example remediation timeline chart (mock template)
![Alt text: Gantt-style chart showing example sequencing of technical SEO tasks by week.](sandbox:/mnt/data/technical_seo_playbook_assets/remediation_timeline_gantt.png)

*Caption: Example Critical/High timeline (8-week template). Replace tasks/durations with your backlog and deployment cadence.*

### Example “issue distribution by category” chart (mock template)
![Alt text: Bar chart showing example counts of technical issues by category such as crawlability, speed, structured data.](sandbox:/mnt/data/technical_seo_playbook_assets/issue_distribution_by_category.png)

*Caption: Example distribution chart for reporting. Populate from your crawl + Search Console + performance audits.*

### Prioritized checklist table (implementation master list)

| Item | Priority | Estimated Effort | Owner | Notes/Links |
|---|---|---:|---|---|
| Validate robots.txt syntax, location, and reachability on every host (www/non-www, subdomains) | Critical | Medium | Developer | Rules must be in root of each host; only supported fields include user-agent/allow/disallow/sitemap; crawl-delay not supported by Google. citeturn35view1turn35view0 |
| Confirm robots.txt behavior + cache refresh using Search Console robots.txt report | Critical | Low | SEO | Robots report shows last crawl + errors; can request recrawl for emergencies. citeturn20search0turn19search11 |
| Define indexability policy (what must be indexed vs excluded) and implement via noindex (meta or X‑Robots‑Tag) | Critical | Medium | SEO + Dev | Noindex is implemented via meta or HTTP header; robots.txt noindex is not supported. citeturn26search2turn27view0turn19search1 |
| Prevent faceted navigation crawl traps (robots disallow patterns, fragments, or constrained indexable facets) | Critical | High | Dev | Facets can create infinite URL spaces; choose prevent-crawl or “indexable facet” best practices. citeturn34view0turn24view0 |
| Fix soft 404s (return true 404/410; don’t show “not found” with 200) | Critical | Medium | Dev | Soft 404 wastes crawl budget; return proper status codes. citeturn7search1turn24view0 |
| Canonicalization rules for parameters/variants/pagination | Critical | High | Dev + SEO | Canonical is a strong hint; redirects are stronger. Use consistent signals. citeturn28search10turn6view0turn34view0 |
| Redirect hygiene (avoid chains/loops; map old→new; keep redirects long enough post-migration) | Critical | Medium | Dev | Long redirect chains harm crawling; keep redirects ~≥1 year for migrations (Google guidance). citeturn24view0turn30view0turn6view0 |
| XML sitemap coverage + correctness (only canonical, indexable 200 URLs; index file for scale) | High | Medium | SEO + Dev | Submitting is a hint; keep up to date; use lastmod only for significant changes; changefreq/priority ignored. citeturn11search4turn22view0turn21search0 |
| Add image/video sitemap extensions where needed + combine extensions correctly | High | Medium | Dev | Google supports sitemap extensions for images, video, news, hreflang; can combine them. citeturn11search1turn11search3turn25search0turn25search14 |
| Product structured data for merchant listings + monitoring in Search Console rich result reports | High | High | Dev + SEO | Merchant listing requires Product + Offer; validate with Rich Results Test and monitor reports. citeturn15view0turn16view0turn17view0 |
| Core Web Vitals (LCP, INP, CLS) measurement + fixes pipeline | High | High | Dev | INP replaced FID; use PSI + Search Console CWV to track. citeturn9search0turn9search2turn9search5turn9search16 |
| JavaScript SEO: ensure crawlable links/content and correct lazy-loading | High | High | Dev | Google processes JS; lazy-loading mistakes can hide content from Google. citeturn18search0turn18search2 |
| Mobile-first indexing parity (content, structured data, meta robots parity on mobile vs desktop) | High | Medium | Dev | Google uses mobile version for indexing/ranking (mobile-first indexing). citeturn8search3turn8search6 |
| HTTPS hardening (avoid mixed content; consider HSTS after stable HTTPS; manage certs) | High | Medium | DevOps | HSTS forces HTTPS; mixed content guidance; plan migration carefully. citeturn8search1turn36search0turn36search1 |
| hreflang for international catalogs (HTML/headers/sitemaps) | Medium | High | Dev + SEO | hreflang methods + pitfalls; locale-adaptive pages may not all be crawled. citeturn10search0turn10search2 |
| Log + Crawl Stats monitoring (server logs + Search Console crawl stats) | Medium | Medium | DevOps + SEO | Crawl Stats report shows crawling history + response codes/availability issues. citeturn29search1turn29search12 |
| Staging vs production SEO safety checklist in CI/CD | Medium | Medium | DevOps | Avoid accidental noindex/robots blocks during releases or migrations. citeturn30view0turn28search3 |
| Automated validation via Search Console APIs (URL Inspection + sitemaps submit) | Medium | Medium | Dev | URL Inspection API and sitemap submit endpoints exist for programmatic checks. citeturn29search3turn29search2turn29search5 |

## Technical SEO foundation: crawling, indexing, URLs, canonicals, and sitemaps

### Crawling vs indexing (baseline mental model)
A robots.txt file is primarily for **crawl control** and load management; it is **not a mechanism for keeping a page out of Google**. For exclusion from Search results, use `noindex` or access controls (for sensitive content). citeturn19search1turn26search2

### robots.txt implementation details (including large-site considerations)

**What Google supports (important constraints):**
- Google supports these robots.txt fields: `user-agent`, `allow`, `disallow`, `sitemap`. Other fields (including `crawl-delay`) are not supported by Google in robots.txt parsing. citeturn35view0turn35view1  
- Google caches robots.txt typically up to ~24 hours (sometimes longer) and cache lifetime can vary; Search Console robots.txt report can request a recrawl to refresh faster. citeturn35view0turn19search11turn20search0

**Template (example)**
```txt
User-agent: *
Disallow:

Disallow: /search
Disallow: /checkout
Disallow: /cart

# Facet parameters (example patterns; adapt to your URL scheme)
Disallow: /*?*filter=
Disallow: /*?*sort=

Sitemap: https://example.com/sitemap_index.xml
```
(Use the included `templates/robots.txt.example` in the ZIP for a more complete starting point.)

**Common pitfalls**
- Blocking a URL in robots.txt but expecting it to deindex quickly (Google may still keep the URL known, and you prevent Google from seeing the noindex tag). citeturn27view0turn19search1turn24view0  
- Allowing robots.txt to grow unbounded on huge sites; Google enforces a robots.txt size limit (content after the max is ignored). citeturn35view0  
- Returning robots.txt 5xx/DNS failures: behavior changes over time (temporary stop crawling, last good cache use, etc.). citeturn35view0

**Large sites (scale-dependent guidance):**
- If your site is **not large/frequently updated**, Google indicates that simply keeping sitemaps updated and monitoring indexing coverage is usually adequate. citeturn24view0  
- For very large sites, robots.txt becomes a primary mechanism to prevent crawl waste (especially facet/parameter traps). citeturn24view0turn34view0

**Testing procedure**
- Check `https://<host>/robots.txt` in an incognito window for 200 OK + correct content. citeturn35view1  
- Use the Search Console robots.txt report to confirm Google can process it, see crawl time, and request recrawl if necessary. citeturn20search0turn19search11

### meta robots and X‑Robots‑Tag (HTML + non-HTML controls)

**Authoritative controls**
- `noindex` can be implemented as either a meta robots tag or an HTTP response header with the same effect. citeturn26search2turn27view0  
- For non-HTML resources (PDFs, images, some media files), Google recommends using `X‑Robots‑Tag`. citeturn27view0

**Examples**
```html
<!-- Block indexing of this HTML page -->
<meta name="robots" content="noindex">
```
citeturn26search2

```http
HTTP/1.1 200 OK
X-Robots-Tag: noindex
```
citeturn27view0

**Server-wide PDFs noindex (official examples)**
```apacheconf
<Files ~ "\.pdf$">
  Header set X-Robots-Tag "noindex, nofollow"
</Files>
```
```nginx
location ~* \.pdf$ {
  add_header X-Robots-Tag "noindex, nofollow";
}
```
citeturn27view0

**Critical rule interaction**
If you disallow crawling of a URL in robots.txt, Google can’t crawl the page to discover meta robots or X‑Robots‑Tag directives (so those directives won’t be applied). citeturn27view0turn24view0

### Canonicalization and duplicate URL consolidation

Google treats canonicalization as a **set of signals**, with some stronger than others. The canonical guide explicitly lists methods “in order of how strongly they can influence canonicalization.” citeturn28search10

**Recommended canonical rules (implement as policy):**
- Use **self-referential canonicals** on canonical pages (to reduce ambiguity during crawling and parameter discovery). citeturn28search10  
- Use canonicals to consolidate “very similar” pages (ex: parameter variants), but use **redirects** when the old URL truly should disappear in favor of a new one. citeturn28search10turn6view0  
- For faceted navigation, if you must allow some facets to be crawled/indexed, canonicalization may reduce crawl volume over time, but robots disallow or fragments are generally more effective long-term for non-indexable facet spaces. citeturn34view0turn24view0  

**Testing**
- Use Search Console URL Inspection to confirm the “Google-selected canonical” and compare to your “user-declared canonical.” citeturn18search3turn29search6

### URL structure best practices (parameters, case, trailing slashes, etc.)

Google provides explicit URL structure guidance (including pitfalls like session IDs, parameter handling, and case sensitivity). citeturn4view1turn23search4

**Non-negotiable policy choices to document (because your platform is unspecified):**
- Trailing slash policy (e.g., `/category/` vs `/category`) — choose one and enforce via redirects + canonicals. citeturn2search4turn6view0  
- Parameter strategy for filters/sort/search — choose which parameters are indexable (if any) and clamp the rest via robots + canonical + UI link behavior. citeturn34view0turn24view0  
- Avoid session IDs in crawlable URLs; keep URL spaces finite. citeturn4view1turn24view0  

### XML sitemaps (best practices, scale, and examples)

**What sitemaps are and aren’t**
A sitemap is a file that provides info about pages and other files you consider important; Google reads it to crawl more efficiently. Submitting a sitemap is a **hint**, not a guarantee. citeturn11search15turn11search4

**What to include**
- Include only **canonical, indexable URLs you want crawled** (status 200, not `noindex`, not blocked). This is implied by Google’s crawl budget guidance about URL inventory management and the role of redirects/soft 404s. citeturn24view0turn11search4  
- Use `<lastmod>` when you can keep it accurate; Google warns it must match reality and reflect “last significant modification.” citeturn22view0turn21search0turn24view0  
- **Do not bother with `<priority>` and `<changefreq>`** for Google; Google explicitly does not use them. citeturn21search0turn22view0  
- Google ended support for the unauthenticated “sitemap ping” endpoint; submit via Search Console or robots.txt instead. citeturn22view0turn11search4

### Sitemap examples table (small vs medium vs large)

| Site type | Recommended sitemap pattern | Example files | Splitting strategy |
|---|---|---|---|
| Small site | Single sitemap | `sitemap.xml` | No splitting unless near protocol limits or operationally beneficial. citeturn11search4 |
| Medium site | Sitemap index + type splits | `sitemap_index.xml` → pages/categories/products/blog | Split by template type; optionally shard products if needed. citeturn11search4turn11search15 |
| Large site | Sitemap index + shards (by ID ranges/date/type) | `sitemap_products_0001.xml…` | Shard by stable ranges; keep `<lastmod>` accurate; monitor with Search Console Sitemaps report. citeturn24view0turn11search8turn22view0 |

(See templates in ZIP: `templates/sitemap_small.xml`, `templates/sitemap_medium_index.xml`, `templates/sitemap_large_index.xml`.)

**Platform-specific sitemap notes (since platform is unspecified)**  
- **entity["company","WordPress","cms platform"]:** Core includes extensible sitemap functionality (e.g., `/wp-sitemap.xml` in many setups; exact output depends on configuration/plugins). citeturn32search12turn32search0  
- **entity["company","Shopify","ecommerce platform"]:** Stores automatically generate `sitemap.xml` including products/collections/blog posts; robots.txt can be customized via `robots.txt.liquid`. citeturn31search4turn31search1turn31search18  
- **entity["company","Magento","ecommerce platform"] (Adobe Commerce): Admin supports XML sitemap configuration and robots/sitemap configuration patterns (including on-cloud rewrites). citeturn31search2turn31search5turn31search3turn31search12  
- Custom stacks (HTML/PHP/Node.js): generate sitemaps from your canonical URL database and publish them on stable paths; automate updates. citeturn11search4turn22view0  

### Pagination and infinite scroll (Google’s current direction)

Google’s current e-commerce guidance: pagination and incremental page loading can improve UX/performance, but you must ensure Google can find all content. citeturn33search0

**Key implementation constraints**
- Ensure each “page” of listings has crawlable links (HTML `<a href="">`), and that incremental loading does not hide links/content behind un-crawlable interactions. citeturn33search0turn18search2  
- `rel=prev/next` historically existed (Google blog), but **Google has stated it does not use rel prev/next for indexing signals anymore** (secondary sources; confirm if you also care about other engines). citeturn33search4turn33search11  

## Architecture and internal linking for discovery and e-commerce scale

### Example visual sitemap diagram (hierarchy)
![Alt text: Diagram of a sample ecommerce sitemap with Home → Categories → Subcategories → Products and Blog → Posts.](sandbox:/mnt/data/technical_seo_playbook_assets/visual_sitemap_diagram.png)

*Caption: Visual sitemap example. Replace with your site’s actual IA and ensure every important page is reachable by links.*

### Site architecture principles grounded in Google’s guidance

Google emphasizes that it tries to understand the relationship between pages based on linkages; navigation structures and cross-page links affect Google’s understanding of your structure, and pages should be reachable via links through navigation (menus → categories → subcategories → products). citeturn23search0

Also: Google generally does **not** infer site structure from URL structure alone; internal linking is the key signal for relative importance within a site. citeturn23search0

### Example architecture diagram (hub-and-spoke + silos)
![Alt text: Diagram showing homepage linking to category hubs and a blog hub; hubs link to product and guide spokes; contextual cross-links connect guides to products.](sandbox:/mnt/data/technical_seo_playbook_assets/site_architecture_hub_silo.png)

*Caption: Architecture template combining silos (categories) and topical hubs. Implement through navigation + contextual internal linking.*

### Crawl depth and link equity (practical targets)
Because Google discovers importance primarily through internal linking, a rational engineering target is: **make revenue-driving pages (best categories and best products) reachable within a shallow click depth**, and ensure paginated category pages still expose crawlable product links. citeturn23search0turn33search0

### Faceted navigation and filter handling (canonical + robots + 404 discipline)

Google’s faceted navigation guidance is explicit: URL-parameter facets can generate infinite URL spaces that cause overcrawling and slower discovery crawls. citeturn34view0turn24view0

**Two supported strategies**
- **Non-indexable facets:** Prevent crawling (robots disallow); optionally move filtering state to URL fragments (Google “generally doesn’t support fragments in crawling and indexing”). citeturn34view0  
- **Indexable facets:** Constrain the space and follow best practices (consistent parameter separators; stable ordering; no duplicate filters; return 404 for no-result/nonsense combinations). citeturn34view0  

**Scale note (explicit):** The cost/benefit of indexable facets is strongly scale-dependent. For large catalogs, unconstrained facets can consume crawl budget and slow discovery of new products. citeturn34view0turn24view0

## Structured data and product ecosystem implementation

### Scope notes (explicit)
- Rich result eligibility can change; Google doesn’t guarantee structured data features will show. citeturn13view1turn27view0turn12search4  
- FAQ and HowTo rich results changed materially: FAQ rich results are now primarily limited to authoritative government/health sites, and HowTo rich results were simplified/removed broadly (Google announcement). citeturn12search1  

### Product structured data (merchant listings) — required and recommended fields

Google distinguishes between **Product snippets** vs **Merchant listings**; merchant listings are for pages where customers can purchase products, and generally require richer product detail (shipping/returns/etc.). citeturn13view0turn13view1

Merchant listings require a `Product` with an embedded `Offer` (seller must be the merchant). citeturn15view0turn16view0

### Structured data properties table (Product schema)

| Property group | Required / Recommended | Properties | Example JSON-LD fragment | Common validation issues (typical) |
|---|---|---|---|---|
| `Product` | **Required** | `name`, `image`, `offers` | `"name": "Example Widget", "image": ["https://..."], "offers": {...}` citeturn15view0 | Missing `offers`; images not crawlable/indexable; images don’t represent product. citeturn15view0 |
| `Offer` | **Required** | `price` (or `priceSpecification.price`), `priceCurrency` | `"offers": {"@type":"Offer","price":49.99,"priceCurrency":"USD"}` citeturn16view0 | Price missing/invalid; currency missing; (merchant listings require price > 0). citeturn16view0 |
| `Offer` | Recommended | `availability`, `itemCondition`, `url`, `shippingDetails`, `hasMerchantReturnPolicy` | `"availability":"https://schema.org/InStock"` citeturn16view0turn17view0 | Availability omitted; mismatch with on-page content; shipping/returns missing where expected. citeturn16view0turn17view0 |
| Identifiers | Recommended | `gtin*`, `mpn`, `sku`, `brand.name` | `"gtin14":"000123...","brand":{"@type":"Brand","name":"Brand"}` citeturn15view0 | Missing brand/GTIN reduces matching to shopping experiences. citeturn13view0turn15view0 |
| Reviews | Recommended (when eligible and policy-compliant) | `aggregateRating`, `review` | `"aggregateRating":{"@type":"AggregateRating",...}` citeturn15view0 | Review markup violates review snippet guidelines or mismatches visible reviews. citeturn15view0 |

(Full example file in ZIP: `templates/product_jsonld_merchant_listing.json`.)

### Validation/testing steps (structured data)
- Validate with Rich Results Test (critical errors block eligibility; warnings are optional improvements). citeturn13view1  
- Test with URL Inspection to see how Google fetches the page and whether it’s blocked by robots/noindex/login. citeturn13view1turn18search3  
- Monitor the dedicated Search Console reports for merchant listings / product snippets. citeturn13view1  

### Merchant Center and product feeds: when to use and how it interacts with on-page structured data

Google explicitly supports providing product data via (a) on-page structured data, (b) Google Merchant Center feeds, or (c) both; using both increases eligibility and helps Google verify data, and some experiences may combine feed + structured data. citeturn13view0turn23search2

**When feeds are especially important (per Google):**
- Web crawling is not guaranteed to find all products; feeds improve inventory completeness. citeturn23search2  
- Feeds/Content API can provide faster update control (e.g., stock level updates). citeturn23search2  
- Feeds can provide data not present on the site. citeturn23search2  

**Merchant Center structured data setup (official):**
Merchant Center requires access to your HTML/templates to add markup and has conditions for matching structured data to product data. citeturn12search3turn12search2  

## Performance, mobile-first, HTTPS, internationalization, and JavaScript SEO

### Core Web Vitals: what to optimize and how to verify

Google defines Core Web Vitals as a set of metrics measuring real-world UX, and strongly recommends achieving “good” CWV. citeturn9search2turn9search5  
INP replaced FID as part of Core Web Vitals in March 2024 (and Search Console shifted to INP). citeturn9search0turn9search1

**Measurement stack (Google-first)**
- Search Console Core Web Vitals report (field data, grouped by URL patterns). citeturn9search5  
- PageSpeed Insights (field + lab; describes CWV aggregation rules). citeturn9search16  
- Lighthouse (lab diagnostics for performance and LCP details). citeturn9search6turn9search19  

**High-yield optimization levers (platform-agnostic)**
- Ensure critical content loads quickly (LCP) and reduce main-thread blocking to improve responsiveness (INP). citeturn9search2turn9search4  
- Implement lazy-loading carefully so content isn’t hidden from Google (load content when visible in viewport; leverage built-in image/iframe lazy-loading or IntersectionObserver patterns). citeturn18search2  

### Mobile-first indexing and responsive design parity

Google uses the **mobile version** of a site’s content, crawled with the smartphone agent, for indexing and ranking (“mobile-first indexing”). citeturn8search3  
Practical requirement: ensure your mobile rendering includes the same critical content, internal links, and structured data as desktop, or Google may index the diminished mobile version. citeturn8search3turn8search6turn13view1

### HTTPS and security (HTTPS migration, HSTS, mixed content)

Google’s HTTPS guidance emphasizes planning migrations carefully and following best practices. citeturn8search1turn30view0

**HSTS (Strict-Transport-Security)**
HSTS tells browsers the host should only be accessed using HTTPS and future HTTP attempts should be upgraded automatically. citeturn36search0turn36search4  
**Implementation note (conditional):** Enable HSTS only after you are confident HTTPS is stable for all subdomains you include, because browsers will enforce it. This is a security/ops decision; site-specific constraints are **unspecified** here. citeturn36search0

**Mixed content**
Mixed content defenses focus on preventing insecure (HTTP) subresource loads on HTTPS pages; browsers may upgrade some requests or block “blockable” mixed content. citeturn36search1turn36search8turn36search12

**HTTP/2 and HTTP/3 considerations**
- HTTP/2 introduces multiplexing and header compression (reducing latency/overhead). citeturn36search6turn36search13turn36search17  
- HTTP/3 uses QUIC over UDP and aims to reduce latency and head-of-line blocking vs TCP. citeturn36search3turn36search10  
**Environment note (explicit):** Whether you can enable HTTP/2/3 depends on your hosting/CDN stack, which is **unspecified**.

### Internationalization (hreflang) and locale-adaptive pages

Google’s localized versions documentation supports hreflang via:
- `<link rel="alternate" hreflang="...">` in HTML,  
- HTTP headers (useful for non-HTML like PDFs),  
- XML sitemaps (with `xhtml:link` entries), and it requires each version to reference all versions including itself. citeturn10search0turn25search14  

For locale-adaptive pages (content varies by user location/language), Google may not crawl/index all locale variants because Googlebot requests may originate from the US and not send `Accept-Language`. citeturn10search2

### JavaScript SEO: rendering modes and Google’s constraints

Google provides a JavaScript SEO basics guide and emphasizes that mis-implemented JS can affect indexing; dynamic rendering is described as a workaround and not recommended as a long-term solution. citeturn18search0turn18search1turn18search5  
Lazy-loading is a performance best practice but can hide content from Google if implemented incorrectly; Google documents patterns to ensure content loads when visible. citeturn18search2turn27view0

**Framework notes (explicitly conditional):**
- React/Angular/Vue/Next/Nuxt specifics are **platform/framework-dependent** and cannot be tailored without knowing your implementation details (unspecified).  
- The platform-agnostic requirement remains: ensure critical content and internal links are discoverable without user interactions that Googlebot won’t perform reliably. citeturn18search0turn18search2  

## Testing, QA, monitoring, automation, migrations, troubleshooting, and sources

### Testing and QA plan (staging vs production)

**Staging environment rules (risk management)**
Robots.txt is not a secure way to protect private environments; for sensitive content, use access controls. citeturn19search1turn28search3  
**Operational pitfall:** If you block crawling of staging via robots.txt, Google can’t crawl pages to see `noindex` tags (so you can create confusing states). citeturn27view0turn24view0

**Pre-release checklist (minimum)**
- Confirm meta robots/X‑Robots‑Tag states are correct for production templates (no accidental sitewide `noindex`). citeturn26search2turn27view0turn30view0  
- Validate robots.txt is correct and reachable (and doesn’t block critical CSS/JS resources needed for rendering). citeturn35view1turn18search0  
- Validate canonical + redirects for key template classes (homepage, category, product, blog). citeturn28search10turn6view0  
- Validate sitemaps parse successfully in Search Console and monitor errors. citeturn11search8turn11search4  
- Validate product structured data on a representative sample and monitor Search Console reports post-deploy. citeturn13view1turn17view0  

### Monitoring and maintenance plan (Search Console + logs)

Use the following Search Console reports as your primary monitoring layer:
- Page indexing report (what’s indexed vs not; reasons). citeturn29search0  
- URL Inspection tool for URL-level debugging and indexability tests. citeturn29search6turn18search3  
- Sitemaps report for sitemap processing status/errors. citeturn11search8  
- Crawl Stats report for requests, response, and availability issues. citeturn29search1turn29search12  

**Log analysis**
Google recommends monitoring server access/error logs during migrations and crawling changes; log analysis is also a key crawl budget practice for large sites. citeturn30view0turn24view0

### Automation (scripts and APIs)

**Included scripts (in ZIP)**
- `scripts/parse_googlebot_logs.py` — parses access logs and outputs crawl stats by crawler family/status code.
- `scripts/bulk_validate_product_structured_data.py` — fetches URLs, extracts JSON-LD Product markup, and checks for key required/recommended fields (linting, not authoritative).
- `scripts/generate_sitemap_from_csv.py` — generates a basic sitemap from canonical URL exports.

**Google APIs you can integrate**
- Search Console URL Inspection API (programmatic URL-level data). citeturn29search3turn29search14  
- Search Console sitemap submission endpoint. citeturn29search2turn29search5  

### Redirects and removed products decision table

Google’s migration guidance warns against irrelevant mass redirects to the homepage (can act like soft 404); use relevant destinations or return proper 404/410 for removed content. citeturn30view0turn24view0

| Condition | Recommended action | Notes |
|---|---|---|
| Temporarily out of stock | Keep URL 200 + show OOS + `Offer.availability=OutOfStock` | Availability enums include OutOfStock/Discontinued/etc. citeturn16view0 |
| Permanently discontinued; direct replacement exists | 301 to replacement | Update internal links; remove old SKU from sitemap; avoid chains. citeturn6view0turn30view0turn24view0 |
| Permanently discontinued; no replacement, but strong category substitute exists | 301 to closest relevant category | Avoid redirecting many unrelated URLs to homepage (soft 404 risk). citeturn30view0turn24view0 |
| Permanently removed; no relevant substitute | Return 404 or 410 | Google crawl budget guidance recommends 404/410 for permanently removed pages. citeturn24view0turn7search1 |
| Removed but urgently must disappear from SERP (temporary) | Use Search Console Removals tool (temporary) + also fix underlying status/noindex | Removals are temporary (about 6 months / limited). citeturn26search3turn26search6 |

### Removed/out-of-stock flowchart diagram
![Alt text: Flowchart deciding between keep 200 with out-of-stock markup, 301 to replacement/category, or 404/410 for removed products.](sandbox:/mnt/data/technical_seo_playbook_assets/product_lifecycle_flowchart.png)

*Caption: Implementation decision tree for product lifecycle URLs. Adapt rules to your merchandising strategy and internal search UX.*

### Migration checklists

**HTTP → HTTPS migration (Google-aligned essentials)**
- Configure TLS certificates and ensure the site is fully accessible over HTTPS. citeturn30view0turn8search1  
- Implement server-side redirects from HTTP to HTTPS (permanent) and ensure canonicals point to HTTPS. citeturn30view0turn6view0  
- Verify both site variants in Search Console; note: Change of Address tool is not required for HTTP→HTTPS. citeturn30view0  
- Monitor indexing/traffic fluctuations; this is expected to settle over time. citeturn30view0  

**Domain/CMS migration (site move with URL changes)**
- Build complete old→new URL mapping and implement server-side permanent redirects. citeturn30view0  
- Avoid irrelevant bulk redirects to homepage (soft 404 risk). citeturn30view0  
- Submit Change of Address for domain/subdomain moves (not for HTTP→HTTPS). citeturn8search0turn30view0  
- Keep redirects as long as possible (Google suggests generally at least ~1 year). citeturn30view0  
- Monitor with Search Console sitemaps + indexing reports; check crawl logs. citeturn30view0turn11search8turn29search0  

### Tooling (curated, labeled)
Primary (Google/official):
- Search Console (indexing, CWV, sitemaps, crawl stats), Rich Results Test, PageSpeed Insights. citeturn29search13turn13view1turn9search16  

Secondary (industry tooling; not Google):
- entity["company","Screaming Frog","seo crawler"] (crawling + URL Inspection API integration guidance exists). citeturn29search21turn30view0  
- entity["company","Botify","seo automation platform"] and entity["company","Lumar","seo crawler platform"] (formerly DeepCrawl; secondary mention only — no platform-specific assumptions in this report). *(No site-specific claims made here due to lack of primary citations in this report.)*

### Official Google documentation map and annotated sources (direct links)

Below are the highest-impact primary sources used to construct this playbook. Each entry includes an annotation and a direct URL (in code, per output constraints).

**Search fundamentals**
- SEO Starter Guide (baseline best practices for crawl/index/understanding). citeturn23search8  
```txt
https://developers.google.com/search/docs/fundamentals/seo-starter-guide
```

**robots.txt and crawling infrastructure**
- robots.txt intro (robots is crawl control, not indexing removal). citeturn19search1  
```txt
https://developers.google.com/search/docs/crawling-indexing/robots/intro
```
- Robots spec: supported fields, caching, error handling. citeturn35view0  
```txt
https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
```
- Create/submit robots.txt + testing options. citeturn35view1  
```txt
https://developers.google.com/crawling/docs/robots-txt/create-robots-txt
```
- Search Console robots.txt report. citeturn20search0  
```txt
https://support.google.com/webmasters/answer/6062598
```
- Optimize crawl budget (large sites; avoid crawl waste; prefer 404/410; avoid long redirect chains). citeturn24view0  
```txt
https://developers.google.com/crawling/docs/crawl-budget
```
- Faceted navigation crawling guidance. citeturn34view0  
```txt
https://developers.google.com/crawling/docs/faceted-navigation
```
- Reduce Google crawl rate (operational mitigation). citeturn19search3  
```txt
https://developers.google.com/crawling/docs/crawlers-fetchers/reduce-crawl-rate
```

**Indexing controls**
- Implementing noindex. citeturn26search2  
```txt
https://developers.google.com/search/docs/crawling-indexing/block-indexing
```
- Robots meta + X‑Robots‑Tag specifications (includes official server config examples). citeturn27view0  
```txt
https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
```

**Canonicalization, redirects, migrations**
- Canonicalization methods ranked by strength. citeturn28search10  
```txt
https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
```
- Redirects: types and best practices. citeturn6view0  
```txt
https://developers.google.com/search/docs/crawling-indexing/301-redirects
```
- Site moves/migrations (including HTTP→HTTPS note and redirect strategy). citeturn30view0  
```txt
https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
```
- Change of Address tool (domain moves). citeturn8search0  
```txt
https://support.google.com/webmasters/answer/9370220
```

**Sitemaps**
- Sitemap overview. citeturn11search15  
```txt
https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
```
- Build/submit sitemap (includes Search Console + API + robots discovery). citeturn11search4  
```txt
https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
```
- Google blog: sitemap ping deprecation + lastmod guidance; priority/changefreq not used. citeturn22view0  
```txt
https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
```
- Search Console Sitemaps report. citeturn11search8  
```txt
https://support.google.com/webmasters/answer/7451001
```
- Combine sitemap extensions. citeturn25search0  
```txt
https://developers.google.com/search/docs/crawling-indexing/sitemaps/combine-sitemap-extensions
```
- Image sitemaps. citeturn11search1  
```txt
https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
```
- Video sitemaps. citeturn11search3  
```txt
https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
```

**E-commerce**
- Ecommerce site structure (internal linking emphasis; URLs not the structure signal). citeturn23search0  
```txt
https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure
```
- Pagination/incremental loading guidance. citeturn33search0  
```txt
https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
```
- Share product data with Google (structured data + Merchant Center). citeturn23search2  
```txt
https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google
```

**Structured data**
- Product structured data overview (snippets vs merchant listings; variants; structured data + Merchant Center together). citeturn13view0  
```txt
https://developers.google.com/search/docs/appearance/structured-data/product
```
- Merchant listings structured data (Product + Offer required/recommended properties; shipping/returns precedence). citeturn15view0turn16view0turn17view0  
```txt
https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
```
- Merchant Center: set up structured data. citeturn12search3  
```txt
https://support.google.com/merchants/answer/7331077
```
- Changes to HowTo/FAQ rich results (feature availability changed). citeturn12search1  
```txt
https://developers.google.com/search/blog/2023/08/howto-faq-changes
```

**Performance and mobile**
- Core Web Vitals in Search (LCP/INP/CLS). citeturn9search2  
```txt
https://developers.google.com/search/docs/appearance/core-web-vitals
```
- INP replaces FID announcement. citeturn9search0  
```txt
https://developers.google.com/search/blog/2023/05/introducing-inp
```
- Mobile-first indexing best practices. citeturn8search3  
```txt
https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
```

**JavaScript SEO**
- JavaScript SEO basics. citeturn18search0  
```txt
https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
```
- Dynamic rendering is a workaround (not a recommended long-term solution). citeturn18search1turn18search5  
```txt
https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering
```
- Fix lazy-loaded content. citeturn18search2  
```txt
https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading
```

**Search Console reports and APIs**
- Page indexing report. citeturn29search0  
```txt
https://support.google.com/webmasters/answer/7440203
```
- Crawl Stats report. citeturn29search1turn29search12  
```txt
https://support.google.com/webmasters/answer/9679690
```
- URL Inspection API announcement. citeturn29search3  
```txt
https://developers.google.com/search/blog/2022/01/url-inspection-api
```
- Sitemaps submit endpoint. citeturn29search2  
```txt
https://developers.google.com/webmaster-tools/v1/sitemaps/submit
```

**Security references (authoritative non-Google)**
- HSTS header (Strict-Transport-Security). citeturn36search0  
```txt
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security
```
- Mixed content defenses. citeturn36search1  
```txt
https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Mixed_content
```

**Platform documentation (official)**
- Shopify sitemap behavior (auto-generated). citeturn31search4  
```txt
https://help.shopify.com/en/manual/promoting-marketing/seo/find-site-map
```
- Shopify robots customization (`robots.txt.liquid`). citeturn31search1  
```txt
https://help.shopify.com/en/manual/promoting-marketing/seo/editing-robots-txt
```
- Adobe Commerce XML sitemap configuration. citeturn31search2turn31search5  
```txt
https://experienceleague.adobe.com/en/docs/commerce-admin/config/catalog/xml-sitemap
```
- WordPress core sitemaps (developer reference + announcement). citeturn32search0turn32search12  
```txt
https://make.wordpress.org/core/2020/07/22/new-xml-sitemaps-functionality-in-wordpress-5-5/
```

