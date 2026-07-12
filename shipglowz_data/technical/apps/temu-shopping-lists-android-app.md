---
artifact: technical_module_context
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: draft
source_skill: 300-sg-docs
scope: app-runtime
owner: "Diane"
confidence: high
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - src/
  - src-tauri/
  - convex/
  - README.md
depends_on: []
supersedes: []
evidence:
  - "README.md and package configuration describe the implemented Vue/Vite/Tauri local-first app."
next_review: "2026-08-12"
next_step: "/103-sg-verify app runtime"
---

# Temu Shopping Lists Android App

## Purpose

Document the local-first Android Tauri app that saves Temu product links into durable shopping lists.

## Owned Files

- `src/`: Vue pages, routes, import parsing, validation, stores, backup, and UI.
- `src-tauri/`: Tauri commands, Android project, share-target contract, and WebView integration.
- `convex/`: fail-closed cloud-sync/auth scaffolding.
- `README.md`: scope, setup, security boundary, and validation limitations.

## Invariants

- Imports are user-initiated and unsafe/non-Temu URLs are rejected before saving.
- Saved data is local-first; Temu cookies, credentials, browser profiles, and session exports are not stored.
- No scraping, stealth WebView, automated cart import, or live background price monitoring is allowed.
- Cloud sync and entitlements remain blocked until suite identity, entitlement, and deployment proof exist.
- Native Android proof is authoritative from CI/device checks, not this aarch64 local host.

## Validation

Run `pnpm typecheck`, `pnpm typecheck:convex`, `pnpm test:once`, `pnpm lint:check`, and `pnpm build`. Use GitHub Actions Blacksmith plus a real device for native Android proof.

## Reader Checklist

Read URL validation, store tests, the Android manifest/share bridge, and the README together before changing import or native behavior.

## Maintenance Rule

Update this document when app scope, persistence, security boundaries, sync state, or authoritative proof changes.
