---
artifact: technical_module_context
metadata_schema_version: "1.0"
artifact_version: "1.0.1"
project: "temu"
created: "2026-06-10"
updated: "2026-06-10"
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
- `.github/workflows/dev-builds.yml`: GitHub Actions debug APK build, Blacksmith runner selection, aggressive build caches, artifact upload, and release fallback.

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

GitHub Actions validation and artifact:

```bash
workflow: Dev Builds
runner: blacksmith-2vcpu-ubuntu-2404
artifact: temu-shopping-lists-android-debug-arm64
fallback release asset: app-universal-debug.apk
```

CI cache policy:

- Android NDK cache keyed by pinned `ANDROID_NDK_VERSION`.
- Rust cache for `src-tauri` with `cache-on-failure` enabled.
- Gradle caches stored under workspace-local `.gradle-cache` plus generated Android `.gradle`.
- pnpm store cache through `actions/setup-node`.

Manual validation is required on Android:

- `TC-MANUAL-001`: app appears in Sharesheet for Temu product text.
- `TC-MANUAL-002`: shared payload opens import review with parsed URL.
- `TC-MANUAL-004`: saved product remains visible after restart and airplane mode.

Known environment gap:

- Current workspace host is `aarch64`, but the detected Android NDK clang path is `prebuilt/linux-x86_64`, causing an exec format linker failure during local `pnpm tauri:android:build`.
- Do not spend implementation time trying to prove Android locally in this workspace unless the SDK/NDK architecture is fixed first. Use CI Blacksmith and the debug APK/release fallback instead.

## Reader Checklist

- Confirm `AndroidManifest.xml` still has exactly the intended text share filter.
- Confirm GitHub Actions uses the Blacksmith runner and keeps Android NDK, Rust, pnpm, and Gradle cache hits healthy.
- Confirm GitHub Actions uploads `temu-shopping-lists-android-debug-arm64` or publishes the fallback prerelease APK when artifact quota is full.
- Confirm native Android/WebView build proof comes from CI unless a compatible local SDK/NDK is explicitly available.
- Confirm no Android code logs private payloads, cookies, addresses, order history, or payment data.
- Confirm manual URL fallback remains available.
- Confirm runtime share payload delivery before marking Android proof as passed.

## Maintenance Rule

Update this document when Tauri Android config, generated manifest, share-intent bridge, package identifier, Android permissions, or manual Android proof status changes.
