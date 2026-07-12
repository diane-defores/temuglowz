---
artifact: platform_usage
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: draft
source_skill: 300-sg-docs
scope: android-tauri-platform
owner: "Diane"
confidence: high
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - src-tauri/
  - .github/workflows/dev-builds.yml
  - shipglowz_data/workflow/test-checklists/
depends_on: []
supersedes: []
evidence:
  - "CLAUDE.md declares CI-first native Android proof on GitHub Actions Blacksmith."
next_review: "2026-08-12"
next_step: "/103-sg-verify Android proof"
---

# Android/Tauri Platform Usage

## Runtime contract

The product target is an Android Tauri application with native WebView and an Android share-intent bridge. Browser builds are development/test surfaces, not proof of Android runtime behavior.

## Proof authority

Local TypeScript, unit, lint, and browser-build checks are authoritative for their respective layers. Native build and Sharesheet/device behavior require the Blacksmith CI workflow and real-device checklist. Local Android commands are non-authoritative on the current aarch64 host with an x86_64 NDK.

## Security boundary

The app must not export or persist Temu cookies, credentials, localStorage, IndexedDB, or browser sessions. Share payloads are treated as untrusted input and pass through the app import validator.

## Maintenance Rule

Update this document when Android build tooling, share-intent behavior, WebView controls, proof authority, or security boundaries change.
