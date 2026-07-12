---
artifact: product_context
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: draft
source_skill: 300-sg-docs
scope: product-surfaces
owner: "Diane"
confidence: high
risk_level: high
security_impact: yes
docs_impact: yes
desired_outcomes: "Capture and revisit Temu products without cart automation or unsafe session handling"
non_goals: "Live scraping, cart import, background monitoring, stealth behavior, credential storage"
target_user: "Android shopper saving Temu product links"
user_problem: "Product links and shopping intent are difficult to capture into durable, reviewable lists"
linked_systems:
  - README.md
  - site/src/pages/
  - app/src/
  - app/src-tauri/
depends_on: []
supersedes: []
evidence:
  - "README.md and package configuration describe the local-first Temu shopping-list Android MVP."
next_review: "2026-08-12"
next_step: "/103-sg-verify product scope and public surfaces"
---

# TemuGlowz Product Context

## Product surfaces

- Android Tauri app: save Temu product links into durable local shopping lists, with manual import, notes, quantities, options, observations, and export.
- Public Astro site: product explanation, trust pages, pricing/marketing surfaces, and editorial blog content.

## Current scope

The app is local-first. Android share intake and in-app Temu WebView sessions are supported as app-owned flows, while live Temu scraping, cart import, background price monitoring, stealth behavior, credential storage, and Temu partnership claims are out of scope.

Cloud sync and paid entitlements remain fail-closed scaffolding until suite identity, entitlement, and deployment proof are complete.

## Canonical implementation docs

Use `shipglowz_data/technical/apps/temu-shopping-lists-android-app.md` for app behavior and `shipglowz_data/editorial/` for public claims and content.

## Maintenance Rule

Update this artifact when product scope, platform surfaces, non-goals, or delivery state changes.
