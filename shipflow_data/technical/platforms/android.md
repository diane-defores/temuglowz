---
artifact: technical_module_context
metadata_schema_version: "1.0"
artifact_version: "1.0.4"
project: "temu"
created: "2026-06-10"
updated: "2026-06-11"
status: draft
source_skill: sf-build
scope: "android-tauri-share-target"
owner: "Diane"
confidence: "medium"
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - src-tauri/
  - src-tauri/gen/android/app/src/main/AndroidManifest.xml
  - src/lib/shareBridge.ts
  - .github/workflows/dev-builds.yml
depends_on:
  - artifact: "Tauri v2 mobile plugin docs"
    artifact_version: "accessed 2026-06-09"
    required_status: "reviewed"
  - artifact: "Android Developers receive shared data docs"
    artifact_version: "accessed 2026-06-09"
    required_status: "reviewed"
supersedes: []
evidence:
  - "Tauri Android project generated with `pnpm tauri:android:init`."
  - "Generated Android manifest includes ACTION_SEND text/plain share target."
  - "Local Android native builds are not authoritative on this aarch64 workspace because the installed NDK is linux-x86_64."
  - "GitHub Actions Blacksmith run 27301921202 built the Android debug APK successfully for commit cde00d0 on 2026-06-10."
  - "Workflow changed after quota proof to publish debug APK prereleases directly and avoid Actions artifact quota annotations."
  - "Ready spec temu-socialglow-ui-copy-migration.md requires SocialGlow-style native bottom-bar menu behavior without visible profile controls."
  - "WebView bottom-bar menu now includes an explicit user-triggered product observation action that captures only the current URL."
next_review: "2026-07-10"
next_step: "/sf-verify Temu shopping lists Android app"
---

# Android Tauri Share Target

## Purpose

Track the native Android surface for receiving user-initiated Temu product links through the Android Sharesheet.

## Owned Files

- `src-tauri/tauri.conf.json`: Tauri app identity and mobile config.
- `src-tauri/gen/android/app/src/main/AndroidManifest.xml`: generated Android manifest with `ACTION_SEND` `text/plain` intent filter.
- `src-tauri/android/AndroidManifest.share-intent.xml`: reference snippet for regenerating the share filter.
- `src-tauri/android/ShareIntentBridge.kt`: placeholder parsing contract for Android shared text.
- `src-tauri/src/lib.rs`: Tauri commands consumed by the frontend share bridge.
- `src/lib/shareBridge.ts`: frontend consumption path for pending share payloads.
- `.github/workflows/dev-builds.yml`: GitHub Actions debug APK build, Blacksmith runner selection, build caches, and prerelease APK publishing.
- `src-tauri/plugins/android-temu-webview/`: Android native WebView plugin targeted for the SocialGlow-style bottom-bar menu migration.

## Entrypoints

- Android Sharesheet sends `android.intent.action.SEND` with MIME `text/plain`.
- The app manifest makes `MainActivity` exported for this explicit user action.
- The frontend imports pending payloads through `consume_pending_share` when a native bridge supplies one.

## Invariants

- Shared payloads are untrusted text and must be parsed by `src/lib/importParser.ts`.
- Android sharing must not request Temu credentials, cookies, account data, or broad storage access.
- The app must accept manual URL paste even when native share delivery is unavailable.
- Regenerating `src-tauri/gen/android` must preserve the `ACTION_SEND` filter.
- Full Android support cannot be claimed until a real device/emulator test proves payload delivery into import review.
- The SocialGlow-derived bottom-bar menu must keep dark mode and text-size controls, use shopping-session labels, and hide profile controls in v1.
- The WebView observation action must be explicit and user-triggered; it must capture only the current URL and must not parse Temu DOM price/stock.
- Android OS notification delivery is out of scope for first-slice observation reminders; in-app due badges are the allowed proof surface.

## Validation

Local validation is limited to TypeScript, Vue/browser, Convex typecheck, unit
tests, lint, and web build:

```bash
pnpm typecheck
pnpm typecheck:convex
pnpm test:once
pnpm lint:check
pnpm build
```

Android native proof is CI-first for this project. Use GitHub Actions
Blacksmith as the source of truth for Tauri Android/WebView builds.

Local Android commands are allowed only on a host with a compatible Android
SDK/NDK:

```bash
pnpm tauri:android:init
pnpm tauri:android:build
```

GitHub Actions validation and APK distribution:

```bash
workflow: Dev Builds
runner: blacksmith-2vcpu-ubuntu-2404
release asset: app-universal-debug.apk
```

CI cache policy:

- Android SDK/NDK setup uses Blacksmith transparent cache and pinned `ANDROID_NDK_VERSION`; avoid explicit caching of `/usr/local/lib/android/sdk/ndk` because restoring modes/utimes there can produce non-fatal tar warnings.
- Rust cache for `src-tauri` with `cache-on-failure` enabled.
- Gradle caches stored under workspace-local `.gradle-cache` plus generated Android `.gradle`.
- pnpm store cache through `actions/setup-node`.

Manual validation is required on Android:

- `TC-MANUAL-001`: app appears in Sharesheet for Temu product text.
- `TC-MANUAL-002`: shared payload opens import review with parsed URL.
- `TC-MANUAL-004`: saved product remains visible after restart and airplane mode.

Known environment gap:

- Current workspace host is `aarch64`, but the detected Android NDK clang path is `prebuilt/linux-x86_64`, causing an exec format linker failure during local `pnpm tauri:android:build`.
- Do not spend implementation time trying to prove Android locally in this workspace unless the SDK/NDK architecture is fixed first. Use CI Blacksmith and the debug APK prerelease instead.

## Bottom-Bar Menu Migration

The SocialGlow UI copy-migration spec targets the Android WebView plugin for a
native bottom-bar menu adapted from SocialGlow/Social News. The intended menu
behavior is shopping-session switching by session name, dark mode control, and
text-size control. Profile controls are not part of the visible v1 Android UI.

This is currently a migration requirement, not completed Android proof. Update
this section after the native plugin source is merged, the Blacksmith APK build
passes for that commit, and a real-device smoke test covers the bottom-bar menu.

## Product Observation Action

The bottom-bar menu includes `Observer ce produit`. The native plugin emits the
same frontend capture event with `action=observe`, the active session id, and
the current URL. Frontend code owns URL validation, saved-snapshot lookup,
manual observation shell creation, and routing. The plugin must not inspect,
scrape, parse, log, or export Temu page content beyond the current URL.

Manual proof must cover:

- valid saved product URL creates a `manual_required` observation and opens product detail;
- valid unsaved product URL routes to import review first;
- non-product URL stays recoverable and creates no observation;
- no Android notification permission is requested for reminder due badges.

## Reader Checklist

- Confirm `AndroidManifest.xml` still has exactly the intended text share filter.
- Confirm GitHub Actions uses the Blacksmith runner and keeps Android NDK, Rust, pnpm, and Gradle cache hits healthy.
- Confirm GitHub Actions publishes the debug APK prerelease asset.
- Confirm native Android/WebView build proof comes from CI unless a compatible local SDK/NDK is explicitly available.
- Confirm the SocialGlow-style bottom-bar menu has no visible profile controls before marking Android proof for the UI copy migration complete.
- Confirm `Observer ce produit` stays URL-only and user-triggered before marking observation proof complete.
- Confirm no Android code logs private payloads, cookies, addresses, order history, or payment data.
- Confirm manual URL fallback remains available.
- Confirm runtime share payload delivery before marking Android proof as passed.

## Maintenance Rule

Update this document when Tauri Android config, generated manifest, share-intent bridge, package identifier, Android permissions, or manual Android proof status changes.
