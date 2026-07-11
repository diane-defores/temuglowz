# Tasks — temuglowz

> Operational task records follow `$SHIPFLOW_ROOT/skills/references/operational-record-format.md`.

---

## Active

🟠 [temuglowz] task: Protect incomplete guide pages from indexing until product selections are ready | status: todo | area: seo-guides | next: add noindex or remove /guides/gadgets-informatique from sitemap and llms.txt until the page has substantive product content
🟠 [temuglowz] task: Repair public-site internal links and guide index integrity | status: todo | area: seo-site-architecture | next: verify all linked public routes resolve or remove broken links across footer, guides, and utility pages
🟠 [temuglowz] task: Add an upstream image optimization path for guide product assets | status: todo | area: seo-cwv-images | next: define how product ingestion stores width/height plus local WebP or AVIF derivatives instead of relying on raw third-party image URLs
🟠 [temuglowz] task: Run build and browser verification for public guide SEO and CWV changes | status: todo | area: seo-verification | next: run site build, inspect rendered head output, and capture browser-level validation for LCP/CLS-sensitive guide pages
🟠 [temuglowz] task: Industrialize authenticated Temu product enrichment with a reusable test-account flow | status: doing | area: guide-ingestion-auth | next: connect the new prepare/apply product-ingestion CLI to the authenticated browser session so login-gated Temu products can be turned into guide-ready payloads without ad hoc manual reshaping | notes: tools/add-temu-product.ts now supports normalized prepare/apply modes and explicit needs_authentication output
🟠 [temuglowz] task: Split geek-object content planning away from the practical computing guide | status: doing | area: content-taxonomy-guides | next: keep the future geek-objects guide in planning mode until a stable source corpus exists, then decide whether to replace or complement /guides/gadgets-informatique | notes: taxonomy and source-log docs now exist under shipglowz_data/technical/site/

## Historical completed work

🟢 [temuglowz] task: Fix guide hreflang emission to follow page language | status: done | area: seo-i18n | next: none | notes: Layout.astro now derives hreflang from the page lang prop instead of forcing en on French guides
🟢 [temuglowz] task: Add page-level guide structured data for public Astro guides | status: done | area: seo-structured-data | next: none | notes: added shared guideSchemas helper and wired BreadcrumbList, Article, FAQPage, and ItemList support into current guide pages
🟢 [temuglowz] task: Improve guide product-card image rendering contract for CWV | status: done | area: seo-cwv-images | next: none | notes: reserved image dimensions and aspect ratio, added explicit priority control, and aligned Astro and Vue product-card rendering paths

---

## Backlog

🟡 [temuglowz] task: Reduce always-on motion and non-critical client hydration on the public site | status: todo | area: performance-site | next: review which public pages still need client islands and whether global reveal/motion logic can be deferred or narrowed

---

## Audit Findings

🔴 [temuglowz] task: Enforce version-aware cloud sync conflict and tombstone handling in live paths | status: todo | area: cloud-sync | id: TASK-2026-06-12-401-001 | next: wire runtime hydration/push paths through version-aware merge or reject stale server writes and deletes | notes: code audit found Convex writes and client hydration bypass the conservative merge contract already modeled in src/lib/syncMerge.ts
🟠 [temuglowz] task: Replace Convex auth token localStorage persistence with a more secure app-owned session path | status: todo | area: auth | id: TASK-2026-06-12-401-002 | next: move JWT/refresh handling out of web localStorage and prove sign-in refresh/sign-out behavior again | notes: current client persists bearer and refresh tokens in localStorage, which is a weak storage boundary for a Tauri WebView app
🟠 [temuglowz] task: Paginate cloud sync pulls and return a continuation cursor | status: todo | area: performance | id: TASK-2026-06-25-403-001 | next: spec or implement paginated hydration contract after backend/client sync API decision | notes: perf audit capped Convex sync reads at 500 records to prevent unbounded pulls, but full correctness for large accounts needs cursor pagination and client replay loops
🟠 [temuglowz] task: Hardening public-site SEO foundations before adding more localized content | status: todo | area: seo-site-foundations | next: protect thin guides from indexing, repair broken internal links, and validate page-level metadata output across guide routes | notes: 2026-07-09 SEO audit found the static Astro base is sound but not yet excellent because thin content and broken route architecture still leak crawl quality
🟠 [temuglowz] task: Replace the current Temu test account for product discovery browsing | status: todo | area: sourcing-ops | next: provision a clean browsing account or alternative sourcing path because the current test account/session is operationally degraded for exploration | notes: 2026-07-11 browser checks showed sold-out product pages, no-result searches, and intermittent network-connection messaging across multiple queries
