# Changelog

All notable changes to this project will be documented in this file.

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
