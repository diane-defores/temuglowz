---
artifact: technical_brief
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: TemuGlowz
created: "2026-07-11"
updated: "2026-07-11"
status: draft
source_skill: 001-sg-build
scope: geek-objects-guide-taxonomy
owner: unknown
confidence: high
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - shipglowz_data/technical/code-docs-map.md
  - shipglowz_data/technical/site/guide-pages-contract.md
  - shipglowz_data/technical/site/geek-objects-source-log.md
  - shipglowz_data/workflow/TASKS.md
  - site/src/pages/guides/gadgets-informatique.astro
  - site/src/site/data/gadgets-informatique.json
depends_on:
  - artifact: "shipglowz_data/technical/site/guide-pages-contract.md"
    artifact_version: "0.1.0"
    required_status: "draft"
supersedes: []
evidence:
  - "User clarified that the target topic is not practical computer accessories but geek objects that evoke computing culture."
  - "Current Temu sourcing account/session is operationally degraded for discovery and should not drive category design."
next_review: "2026-07-25"
next_step: "/300-sg-docs turn geek objects brief into public draft only after a stable product corpus exists"
---

# Geek Objects Guide Brief

## Purpose

Separate the future geek-objects guide from the current practical-computing guide.

This brief defines the category, naming direction, section taxonomy, and exclusion rules before any public page is created.

## Core Positioning

This guide is about objects that reference computing, gaming, internet culture, or retro-tech aesthetics.

It is not about practical PC accessories.

## Not The Same Intent

Keep these intents separate:

- `gadgets-informatique`
  - practical accessories
  - desk utility
  - USB hubs
  - laptop stands
  - cable management
- future geek-objects guide
  - decor
  - novelty items
  - gifts for geeks
  - gaming-room ambiance
  - retro-computing references
  - keyboard, pixel, code, RGB, or setup-inspired objects

Do not force both intents into one page.

## Candidate Slugs

Preferred candidates to evaluate later:

- `/guides/objets-geek`
- `/guides/cadeaux-geek`
- `/guides/deco-geek`

Current preference:

- `/guides/objets-geek`

Reason:

- broad enough for decor, gifts, novelty, and setup-inspired items
- clearer than `gadgets-informatique`
- less restrictive than `cadeaux-geek`

## Candidate Title Directions

Draft title options:

- `Les Meilleurs Objets Geek Temu 2026`
- `Les Meilleurs Objets Geek et Cadeaux pour Geeks Temu 2026`
- `Top Objets Geek Temu 2026: Deco, Lampes Pixel et Idees Cadeaux`

## Draft Taxonomy

### 1. Deco setup et ambiance geek

Examples:

- neon signs
- RGB desk decor
- mini ambient lights
- gaming-room wall decor

### 2. Lampes pixel et lumieres retro-tech

Examples:

- pixel lamps
- block lights
- retro screen-inspired lights
- code or keyboard-themed lighting

### 3. Objets clavier, souris et references bureau geek

Examples:

- giant keycap objects
- keyboard-inspired decor
- novelty desk toys linked to computing imagery

### 4. Gadgets gaming et references pop-tech

Examples:

- controller-inspired decor
- gaming-symbol objects
- streamer-room accessories

### 5. Idees cadeaux geek et objets insolites

Examples:

- novelty gifts
- funny tech-inspired mugs
- decorative signs
- small collector-style objects

## Inclusion Rules

Include products that are:

- visually tied to computing, gaming, internet, or retro-tech culture
- primarily decorative, collectible, giftable, or novelty-driven
- understandable without a strong utility claim

## Exclusion Rules

Exclude products that are mainly:

- USB hubs
- laptop stands
- cable organizers
- cooling pads
- adapters
- charging stations
- routine office utility

Those belong in the practical computing guide, not here.

## SEO Direction

Likely keyword clusters to validate later:

- `objets geek`
- `cadeaux geek`
- `deco geek`
- `lampe pixel`
- `deco gaming room`
- `objets setup gamer`

The key SEO distinction is:

- practical accessory intent versus identity / gift / decor intent

## Sourcing Rule For Now

Do not rely on the current Temu account/session to discover products.

Treat it as operationally degraded for browsing and category exploration until replaced or proven healthy again.

Use it only if:

- a human operator already has a known product URL
- or another clean sourcing path is available

## Publication Rule

Do not create a public indexable Astro guide route yet.

First build:

1. a stable product corpus
2. section fit proof
3. at least one publishable batch of products

Only then decide whether to:

- replace `gadgets-informatique`
- or keep both guides as separate public pages
