# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Aligned GitHub Actions and package engine constraints on Node.js 22.12 so Astro site validation can run on its supported runtime; hosted CI retest remains pending after push.
- Reorganized the repository into a root pnpm workspace with canonical `app/`, `site/`, and `shipglowz_data/` trees; local install, typecheck, lint, tests, builds, and migration hygiene checks pass.
- Added a safer `tools/add-temu-product.ts` prepare/apply flow so Temu product ingestion no longer invents placeholder ratings or prices and can explicitly stop on login-gated products.
- Fixed public guide `hreflang` tags so localized pages emit the correct alternate language instead of always advertising English.
- Added page-level structured data to guide pages with breadcrumb, article, FAQ, and product list schema coverage.
- Improved guide product-card image rendering with explicit dimensions, aspect-ratio reservation, and controlled image priority for better layout stability.
- Added a technical workflow document for authenticated Temu product enrichment so browser login and payload extraction can be repeated without relying on conversation context.
- Added a planning brief and source log for a future geek-objects guide so category design can continue without relying on the currently degraded Temu browsing account.

## 2026-06-10

### Added

- Added Temu Shopping Lists entitlement guardrails for the suite-owned ledger model, including a stable `temu_shopping_lists` product id, allowlisted plans/sources/statuses, fail-closed protected access evaluation, and unit coverage.
- Added entitlement compliance docs, checklist, and support runbook skeleton before any protected sync, provider billing, activation-code, or support-grant implementation.

### Changed

- Marked existing Convex/cloud sync scaffolding as non-authorizing until a backend bridge verifies identity and suite-ledger entitlement server-side.
- Documented the local-first/free MVP boundary in README and technical docs so saved product snapshots remain separate from future paid or protected features.

## 2026-06-22

### Added

- Added browser extension overlay support for web parity with mobile Temu shopping flow.
- Added `extension/manifest.json` with Chrome extension manifest v3 configuration.
- Added `extension/content/overlay.js` content script for Temu product page overlay button.
- Added `src/lib/extensionBridge.ts` TypeScript module for extension detection and messaging.
- Added `src/ui/temu-shell/components/ExtensionOverlay.vue` Vue overlay component.

### Changed

- Integrated ExtensionOverlay component into the main web shell (App.vue).
- Updated ManualImportPage.vue with degraded-mode messaging about extension requirement.
