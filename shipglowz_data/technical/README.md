---
artifact: technical_overview
metadata_schema_version: "1.0"
artifact_version: "0.3.0"
project: TemuGlowz
created: "2026-07-09"
updated: "2026-07-12"
status: draft
source_skill: 300-sg-docs
scope: technical-governance-bootstrap
owner: unknown
confidence: medium
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - shipglowz_data/technical/code-docs-map.md
  - shipglowz_data/technical/apps/temu-shopping-lists-android-app.md
  - shipglowz_data/technical/platforms/android.md
  - shipglowz_data/technical/site/guide-pages-contract.md
  - shipglowz_data/technical/site/temu-authenticated-product-enrichment-workflow.md
  - shipglowz_data/technical/design-system-authority.md
depends_on: []
supersedes: []
evidence:
  - "Repository contains Astro public pages and Vue application/runtime surfaces."
  - "Public guide-page SEO and rendering rules needed canonical placement instead of ad hoc docs/ notes."
next_review: "2026-07-23"
next_step: "/300-sg-docs technical audit"
---

# Technical Governance

## Purpose

This folder is the canonical technical-governance corpus for TemuGlowz.

## Current Focus

- Public site rendering and SEO contracts
- Code-to-doc routing for technical changes
- Surface-specific technical rules when site and app behavior differ
- Repeatable browser-authenticated product enrichment for Temu guide content
- Pre-publication taxonomy planning for future guide categories such as geek objects

## Current Surfaces

- `site`: public Astro-rendered marketing and guide pages
- `app`: Vue/Tauri application runtime

The app design authority is `shipglowz_data/technical/design-system-authority.md`.

## Owned Files

- `shipglowz_data/technical/code-docs-map.md`: path-to-document routing and validation ownership.
- `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md`: app runtime, persistence, sync, entitlement, and product-observation contracts.
- `shipglowz_data/technical/platforms/android.md`: Android/Tauri native proof and share/WebView boundaries.
- `shipglowz_data/technical/site/`: public Astro site contracts.

## Entrypoints

- Read `shipglowz_data/technical/code-docs-map.md` before code-facing documentation work.
- Use the app module for changes under `app/**` and the site modules for changes under `site/**`.
- Keep native Android claims conditional on CI and real-device proof.

## Invariants

- TemuGlowz has one technical governance corpus under `shipglowz_data/technical/`.
- App and site rules stay surface-scoped when their runtimes or proof requirements differ.
- Technical documentation must not strengthen implementation, affiliation, price, availability, or runtime claims beyond recorded evidence.

## Validation

Run the ShipGlowz metadata linter on changed durable artifacts and verify that active references resolve only through `app/**`, `site/**`, or `shipglowz_data/**`.

## Reader Checklist

- Identify whether the change affects app, site, or both.
- Load the corresponding primary document from the code-docs map.
- Recheck security, public claims, and proof authority before changing a durable contract.

## Maintenance Rule

When a technical rule becomes durable enough that future agents should rely on it without rediscovery, place it in this corpus instead of ad hoc `docs/` files.
