---
artifact: technical_overview
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: TemuGlowz
created: "2026-07-09"
updated: "2026-07-09"
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
  - shipglowz_data/technical/site/guide-pages-contract.md
  - shipglowz_data/technical/site/temu-authenticated-product-enrichment-workflow.md
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

## Maintenance Rule

When a technical rule becomes durable enough that future agents should rely on it without rediscovery, place it in this corpus instead of ad hoc `docs/` files.
