---
artifact: platform_usage
metadata_schema_version: "1.0"
artifact_version: "0.2.0"
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
  - app/src-tauri/
  - app/src/lib/shareBridge.ts
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

## Owned files and entrypoints

- `app/src-tauri/tauri.conf.json`: Tauri identity and mobile configuration.
- `app/src-tauri/gen/android/app/src/main/AndroidManifest.xml`: generated `ACTION_SEND` / `text/plain` share target.
- `app/src-tauri/android/`: regeneration-safe share-intent contract references.
- `app/src-tauri/src/lib.rs`: native commands consumed by the frontend.
- `app/src/lib/shareBridge.ts`: validation handoff for pending shared text.
- `app/src-tauri/plugins/android-temu-webview/`: native WebView and bottom-bar integration.

The Sharesheet payload and WebView capture event are untrusted inputs. Frontend parsing and validation remain authoritative before any product is saved.

## Proof authority

Local TypeScript, unit, lint, and browser-build checks are authoritative for their respective layers. Native build and Sharesheet/device behavior require the Blacksmith CI workflow and real-device checklist. Local Android commands are non-authoritative on the current aarch64 host with an x86_64 NDK.

## Security boundary

The app must not export or persist Temu cookies, credentials, localStorage, IndexedDB, or browser sessions. Share payloads are treated as untrusted input and pass through the app import validator.

Regenerating the Android project must preserve the intended text share filter. Manual URL paste remains the fallback when native delivery is unavailable. Full Android support cannot be claimed until a current device or emulator proves payload delivery into import review.

The shopping-session bottom bar may expose session switching, dark mode, text size, URL save, and the explicit “Observer ce produit” action. It must hide profile controls in v1, capture no page content beyond the current URL, and request no Android notification permission for in-app reminder badges.

## Validation

From `app/`, run the TypeScript, Convex, unit, lint, and web-build checks. Native Android/Tauri/WebView proof is CI-first on GitHub Actions Blacksmith because the known local host/NDK architecture mismatch makes local native output non-authoritative. Real-device checks must cover Sharesheet visibility, payload routing, persistence after restart/offline use, URL-only observation behavior, and absence of sensitive logging.

## Reader Checklist

- Confirm the generated manifest has only the intended text share filter.
- Confirm CI still produces the expected debug APK before citing build proof.
- Confirm manual URL fallback remains available.
- Confirm bottom-bar capture stays explicit, URL-only, and profile-free.
- Confirm no native code logs cookies, addresses, order history, payment data, or raw private payloads.

## Maintenance Rule

Update this document when Android build tooling, share-intent behavior, WebView controls, proof authority, or security boundaries change.
