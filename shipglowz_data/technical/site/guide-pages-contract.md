---
artifact: technical_guidelines
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: TemuGlowz
created: "2026-07-09"
updated: "2026-07-09"
status: draft
source_skill: 300-sg-docs
scope: public-guide-pages
owner: unknown
confidence: high
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - shipglowz_data/technical/code-docs-map.md
  - src/pages/guides/
  - src/layouts/Layout.astro
  - src/site/lib/guideSchemas.ts
  - src/site/data/guideIndex.ts
depends_on: []
supersedes: []
evidence:
  - "Repository contains public guide routes under src/pages/guides/*.astro."
  - "Guide pages use Layout.astro and page-level JSON-LD through src/site/lib/guideSchemas.ts."
  - "Vue remains available for widgets/islands, but duplicate public guide pages create governance and SEO drift."
next_review: "2026-07-23"
next_step: "/300-sg-docs update public site governance"
---

# Guide Pages Contract

## Purpose

Define the canonical implementation contract for public guide pages on the TemuGlowz site.

## Scope

This document applies to:

- public guide routes under `src/pages/guides/*.astro`
- guide content data in `src/site/data/*.json`
- guide structured-data generation in `src/site/lib/guideSchemas.ts`
- shared site metadata behavior in `src/layouts/Layout.astro`

## Owned Files

- `src/pages/guides/*.astro`
- `src/site/data/*.json`
- `src/site/lib/guideSchemas.ts`
- `src/layouts/Layout.astro`

## Rendering Rules

- Public guide pages must live in `src/pages/guides/*.astro`.
- Public guide pages are the canonical indexable routes for guide content.
- Do not create a second public Vue page for the same guide slug unless there is an explicit, documented product reason.
- Vue is allowed inside Astro when a widget or island is genuinely needed.
- The rule is not "never use Vue". The rule is "avoid unnecessary client-side hydration on public SEO pages."

## SEO Rules

Every public guide page should pass these props to `Layout`:

- `path`
- `lang`
- `title`
- `description`
- `jsonLd`

Page-level structured data for guides should be generated through `src/site/lib/guideSchemas.ts`.

That helper is the current source of truth for:

- `BreadcrumbList`
- `Article`
- `FAQPage` when FAQ entries exist
- `ItemList` when products exist

`hreflang` must follow the real page language. Do not hardcode `en` for French guide pages.

If a guide is incomplete or intentionally not ready for indexing, do not expose it as a normal indexable page without explicit review.

## Data Rules

Guide content data should live in `src/site/data/*.json`.

Each guide data file should include at minimum:

- `title`
- `description`
- `metaDescription`
- `publishedDate`
- `updatedDate`
- `sections`

If products exist, keep product metadata complete enough for structured data whenever possible:

- `name`
- `description`
- `rank`
- `productUrl`
- `image`
- `price`
- `rating`

## Current Examples

- `src/pages/guides/kitchen-gadgets.astro`
- `src/pages/guides/summer-cooling.astro`
- `src/pages/guides/gadgets-informatique.astro`

## Validation

- Confirm public guide routes remain Astro-first.
- Confirm `jsonLd` is passed into `Layout`.
- Confirm `src/site/lib/guideSchemas.ts` still matches the guide data shape.
- Confirm `hreflang` follows page language.
- Confirm sitemap inclusion matches indexability intent.

## Maintenance Rule

Update this document when the public guide architecture, rendering strategy, or structured-data ownership changes.
