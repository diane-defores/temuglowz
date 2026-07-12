---
artifact: technical_map
metadata_schema_version: "1.0"
artifact_version: "0.2.0"
project: TemuGlowz
created: "2026-07-09"
updated: "2026-07-12"
status: draft
source_skill: 300-sg-docs
scope: code-docs-routing-bootstrap
owner: unknown
confidence: medium
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - shipglowz_data/technical/site/guide-pages-contract.md
  - shipglowz_data/technical/site/geek-objects-guide-brief.md
  - shipglowz_data/technical/site/temu-authenticated-product-enrichment-workflow.md
  - shipglowz_data/technical/site/design-system-authority.md
  - src/layouts/Layout.astro
  - src/pages/guides/
  - src/site/lib/guideSchemas.ts
  - src/
  - src-tauri/
  - convex/
  - site/src/
  - shipglowz_data/technical/design-system-authority.md
depends_on:
  - artifact: "shipglowz_data/technical/README.md"
    artifact_version: "0.1.0"
    required_status: "draft"
supersedes: []
evidence:
  - "Public guide routes use Astro and share a guide JSON-LD helper."
  - "Recent SEO fixes touched Layout.astro and guide page structured data."
  - "Authenticated Temu product enrichment now has a dedicated workflow document."
next_review: "2026-07-23"
next_step: "/300-sg-docs technical"
---

# Code Docs Map

## Purpose

Route technical changes to the right canonical documentation owner.

## Mappings

### Vue/Tauri shopping-list app

- Path patterns: `src/**`, `src-tauri/**`, `convex/**`
- Primary docs: `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md`, `shipglowz_data/technical/platforms/android.md`, and `shipglowz_data/technical/design-system-authority.md` for UI changes
- Trigger: import/list persistence, sync/auth, Android share target, WebView, or app UI changes
- Validation: `pnpm typecheck`, `pnpm typecheck:convex`, `pnpm test:once`, `pnpm lint:check`, `pnpm build`; native proof is CI-first

### Public Astro site

- Path patterns: `site/src/pages/**`, `site/src/components/**`, `site/src/content/**`, `site/src/layouts/**`
- Primary docs: `shipglowz_data/technical/site/guide-pages-contract.md` and `shipglowz_data/editorial/content-map.md`
- Trigger: public route, content, SEO, structured-data, pricing, trust, or schema changes
- Validation: `pnpm build:site`; preserve the Astro content schema and editorial claim gates

### Public guide pages

- Path patterns:
  - `src/pages/guides/*.astro`
  - `src/site/data/*.json`
  - `src/site/lib/guideSchemas.ts`
  - `src/layouts/Layout.astro`
- Primary doc:
  - `shipglowz_data/technical/site/guide-pages-contract.md`
  - `shipglowz_data/technical/site/design-system-authority.md` for UI/token changes
- Trigger:
  - public guide route changes
  - structured-data changes
  - `hreflang`, canonical, `lang`, or sitemap-related guide changes
  - Astro versus Vue rendering decisions for public guide pages
- Validation:
  - confirm public guide routes remain Astro-first
  - confirm page-level JSON-LD remains wired through `Layout`
  - confirm `hreflang` follows actual page language

### Authenticated Temu product enrichment

- Path patterns:
  - `.agents/skills/temu-product-adder/SKILL.md`
  - `src/site/data/*.json`
  - `src/pages/guides/*.astro`
  - `src/site/components/ProductCard.astro`
- Primary doc:
  - `shipglowz_data/technical/site/temu-authenticated-product-enrichment-workflow.md`
- Trigger:
  - Temu product pages that require login before reliable extraction
  - test-account or OTP-assisted enrichment flow changes
  - payload normalization rules for guide insertion
  - repeatability or session-reuse decisions for Temu browser extraction
- Validation:
  - confirm authenticated product enrichment still follows the documented login and extraction flow
  - confirm secrets and session artifacts stay out of the repo
  - confirm output fields match current guide data needs

### Geek-objects guide planning

- Path patterns:
  - `shipglowz_data/technical/site/geek-objects-guide-brief.md`
  - `shipglowz_data/technical/site/geek-objects-source-log.md`
  - `src/pages/guides/gadgets-informatique.astro`
  - `src/site/data/gadgets-informatique.json`
- Primary doc:
  - `shipglowz_data/technical/site/geek-objects-guide-brief.md`
- Trigger:
  - category split between practical computing accessories and geek objects
  - future public page naming or slug decisions for geek-object content
  - section-taxonomy decisions before public publication
  - degraded Temu sourcing-account decisions that affect discovery workflow
- Validation:
  - confirm geek-object intent remains separate from practical computing intent
  - confirm no thin public guide is published before a stable product corpus exists
  - confirm future source URLs are logged independently from fragile browser sessions

## Maintenance Rule

Add a new mapping when a subsystem repeatedly requires rediscovery before edits can be made safely.
