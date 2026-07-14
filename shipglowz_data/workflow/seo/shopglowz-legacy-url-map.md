---
artifact: decision_record
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "ShopGlowz"
created: "2026-07-14"
updated: "2026-07-14"
status: reviewed
source_skill: 102-sg-start
scope: legacy-public-route-and-machine-readable-seo-mapping
owner: "Diane"
confidence: high
risk_level: high
security_impact: none
docs_impact: yes
linked_systems:
  - "site/src/pages/"
  - "site/public/sitemap.xml"
  - "site/public/llms.txt"
  - "site/src/layouts/Layout.astro"
depends_on:
  - artifact: "shipglowz_data/workflow/specs/shopglowz-multi-merchant-gadget-platform.md"
    artifact_version: "1.0.0"
    required_status: ready
supersedes: []
evidence:
  - "2026-07-14 static route inventory under site/src/pages"
  - "2026-07-14 published article inventory under site/src/content/articles"
  - "2026-07-14 sitemap and llms.txt parity test"
next_step: "/103-sg-verify shopglowz-multi-merchant-gadget-platform"
decision: "Keep the existing temuglowz.com paths live during the ShopGlowz public-brand transition; do not introduce synthetic redirects while the domain and route slugs are unchanged."
rationale: "The public identity changes from TemuGlowz to ShopGlowz, but neither the production domain nor the current content slugs are being migrated in this chantier. A same-URL canonical is safer than a redirect that adds no user or SEO value."
consequences: "Every published legacy route must remain generated and canonicalize to itself. If a future domain or slug migration is approved, this map becomes the source inventory for explicit 301 redirects and post-deploy verification."
---

# ShopGlowz legacy URL map and machine-readable SEO audit

Date UTC: 2026-07-14 15:49:00 UTC  
Proof path: evidence-first  
Production domain decision: unchanged (`https://temuglowz.com`) until a separate domain-migration decision exists.

## Decision

The ShopGlowz rebrand changes the public name and editorial scope, not the production domain or the currently published URL slugs. Therefore, the legacy-route strategy for this wave is **live equivalent content at the same URL**, with a self-referential canonical. No redirect is configured because no source route has moved.

This deliberately does not treat the technical domain as public-brand copy. The canonical host stays `temuglowz.com` until an explicit domain-migration chantier decides its replacement and supplies 301 rules.

## Route inventory and disposition

| Existing public route family | Disposition in this wave | Canonical / redirect target | Evidence |
|---|---|---|---|
| `/` | Live ShopGlowz homepage | self canonical | `site/src/pages/index.astro` through `Layout.astro` |
| `/guides` and published guide routes | Live ShopGlowz guide pages | self canonical | `site/src/pages/guides/` |
| `/guides/gifts`, `/guides/camping`, `/guides/tech-gadgets` | Live usage-first hubs with Temu and Amazon destinations using the shared merchant contract | self canonical | `site/src/pages/guides/`, `site/src/site/data/usageHubs.ts`, `UsageHub.astro` |
| `/blog` | Live ShopGlowz practical-guides hub | self canonical | `site/src/pages/blog.astro` |
| `/blog/<published-article-slug>` including Temu-named articles | Live editorial vertical; Temu is a topic, not the site identity | self canonical | `site/src/pages/blog/[slug].astro` and published content collection |
| `/app` | Existing secondary application page | self canonical | `site/src/pages/app.astro` |
| `/privacy`, `/terms` | Live trust pages | self canonical | static route files |
| `/guides/gadgets-informatique` | Live but intentionally excluded from indexing while the selection is in preparation | self canonical plus `noindex` | route source; omitted from sitemap |

## Machine-readable parity rules

- `site/public/sitemap.xml` includes every article whose frontmatter has `status: published`.
- `site/public/llms.txt` lists the same published article corpus and the published guide set.
- The three usage hubs are present in both `sitemap.xml` and `llms.txt`.
- Routes marked `noindex` are absent from the sitemap.
- `Layout.astro` emits canonical, alternate and Open Graph URLs from the route path on the unchanged production host.

The automated `publicSeo.test.ts` enforces the published-article and noindex parity rules so the next content batch cannot silently update one machine-readable surface without the other.

## Future migration trigger

Re-open this map before any of these changes:

- `temuglowz.com` changes to a ShopGlowz domain;
- a published guide or article slug is removed or renamed;
- a currently noindexed guide is published or deleted;
- a hosting layer capable of issuing 301 redirects is introduced or changed.

At that point, record source URL, exact 301 target, canonical target, rollout date, and browser/HTTP proof for each affected route.
