---
artifact: exploration_report
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-09"
updated: "2026-06-09"
status: draft
source_skill: sf-explore
scope: "Android app for persistent Temu shopping lists"
owner: "unknown"
confidence: medium
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "/home/claude/socialglowz"
  - "Android Sharesheet"
  - "Temu product pages"
  - "Convex"
  - "Tauri Android"
evidence:
  - "Local Socialglowz stack inspection: Vue 3, Vite, Tauri Android, Pinia, Convex, PrimeVue, i18n, backup/sync patterns."
  - "Android official docs confirm apps can receive shared text through ACTION_SEND and matching intent filters."
  - "Temu terms reviewed: automated crawling/scraping and significant content storage without consent are restricted."
depends_on: []
supersedes: []
next_step: "/sf-spec Temu shopping lists Android app"
---

# Exploration Report: Temu Shopping Lists Android App

## Starting Question

Create an Android app, inspired by Socialglowz, that lets a user save Temu products into personal lists such as "Cuisine" or "Voiture", while preserving product photos, names, descriptions, selected options, price snapshots, and availability status even when the Temu listing later disappears or sells out.

The user explicitly requested exploration first, not implementation.

## Context Read

- `/home/claude/temu` - Current workspace is empty and not a Git repo yet.
- `/home/claude/socialglowz/package.json` - Confirms reusable app foundation: Vue 3, Vite, Pinia, PrimeVue, Convex, Tauri 2, Android build scripts, Vitest, TypeScript.
- `/home/claude/socialglowz/vite.config.ts` - Confirms reusable front-end infrastructure: aliases, i18n plugin, auto imports, component auto registration, Tailwind, Vue router generation.
- `/home/claude/socialglowz/src-tauri/tauri.conf.json` - Confirms Tauri app packaging and mobile deep-link configuration patterns.
- `/home/claude/socialglowz/src-tauri/plugins/android-webview/*` - Confirms an Android native plugin pattern exists, including Kotlin plugin wiring.
- `/home/claude/socialglowz/convex/schema.ts` - Confirms Convex auth/data schema patterns that can be adapted for lists and product snapshots.
- `/home/claude/socialglowz/src/lib/cloudSync.ts` and backup composables - Confirm reusable validation, local-to-cloud sync, and backup patterns.
- `/home/claude/socialglowz/src/services/kanbanService.ts` - Confirms an existing list/board mental model, but it should be redesigned for shopping lists rather than copied as-is.

## Internet Research

- [Android Developers: Receive simple data from other apps](https://developer.android.com/training/sharing/receive?hl=en) - Accessed 2026-06-09 - Confirms Android share-target mechanism using `ACTION_SEND`, MIME types such as `text/plain`, and user confirmation/editing of shared content.
- [Tauri: Mobile Plugin Development](https://v2.tauri.app/develop/plugins/develop-mobile/) - Accessed 2026-06-09 - Confirms Android plugins are Kotlin classes extending Tauri's plugin API and can handle mobile lifecycle hooks.
- [Tauri: Features and Recipes](https://v2.tauri.app/plugin/) - Accessed 2026-06-09 - Confirms official/community mobile sharing and plugin ecosystem exists, but share-target handling may still need app-specific validation.
- [Temu Terms of Use](https://www.temu.com/ca/terms-of-use.html?r_pid=601099533446720&rps=10032) - Accessed 2026-06-09 - Confirms risk around automated crawling/scraping, storing significant service content, and circumventing service protections.

## Problem Framing

The core user pain is not "make another wishlist". It is "Temu does not preserve enough context when a product disappears." The app must therefore behave like a personal archive of product decisions, not just a link manager.

The product record should be a snapshot:

- original Temu URL and product id if extractable
- title at save time
- main image and gallery images saved or cached under explicit limits
- selected variant/options if known
- price, currency, shipping signal, coupon/discount snapshot if visible
- description/specs copied from user-visible share/product data when allowed
- availability state: unknown, available, sold out, removed, link broken
- source: Android share, manual URL paste, in-app browser save, cart import
- timestamp and list assignment

## Option Space

### Option A: Android Share Target First

Summary: User opens Temu, taps share on a product, chooses the new app from Android Sharesheet, then the app receives the shared URL/text and creates a product snapshot.

Pros:
- Best MVP path.
- User-initiated, explicit, low-friction.
- Aligns with Android's documented sharing model.
- Avoids logging into Temu inside our app.
- Easier to defend legally and ethically than scraping a logged-in cart.

Cons:
- Depends on what Temu shares for each product.
- May not include the full cart.
- Product metadata may require fetching the shared URL or asking the user to confirm details.
- Need real-device tests with Temu Android share payloads.

### Option B: Manual URL Paste

Summary: User copies a Temu product URL and pastes it into the app. The app parses the URL, fetches a preview where possible, and asks the user to complete missing fields.

Pros:
- Very robust fallback.
- Works even if Android share target integration is not complete.
- Good for early alpha and debugging.

Cons:
- More manual friction.
- Same metadata limitations as share links.
- Not enough for cart-level import by itself.

### Option C: In-App Temu WebView With Save Button

Summary: App embeds a Temu browser surface and lets the user browse Temu inside the app, then save the current product.

Pros:
- Can create a smoother "browse and save" workflow.
- Socialglowz already has WebView/plugin patterns.
- Could support save-from-current-page without switching apps.

Cons:
- Highest technical and policy risk.
- Temu may block embedded WebViews or treat them differently.
- Socialglowz contains anti-detection WebView code; that should not be reused for Temu.
- Login/session handling becomes sensitive.

### Option D: Cart Import

Summary: Capture all items from the user's Temu cart in one action.

Pros:
- Matches the user's ideal workflow.
- Strong product value if it works.

Cons:
- Most uncertain path.
- Temu may not expose "share cart" or may share incomplete data.
- Programmatic cart reading can become scraping/automation and violate restrictions.
- Needs a proof spike on a real Android device before being specified as MVP.

## Comparison

| Criterion | Share target | Manual paste | In-app WebView | Cart import |
| --- | --- | --- | --- | --- |
| MVP fit | High | High fallback | Medium | Low until proven |
| User friction | Low | Medium | Medium | Low if feasible |
| Legal/ToS risk | Lower | Lower | Medium/high | High if automated |
| Reuse from Socialglowz | Medium | Medium | High technically | Medium |
| Offline archive fit | High | High | High | High |
| Unknowns | Temu payload shape | URL preview quality | WebView blocking | Cart share availability |

## Emerging Recommendation

Build the product around an explicit user-driven import pipeline:

1. MVP import: Android share target for `text/plain` Temu links.
2. Required fallback: manual paste/import from clipboard.
3. Snapshot model: store product details and images in our app at save time, with a clear user-facing "snapshot captured on date" concept.
4. Later spike: cart import only after verifying a real Temu "share cart" payload exists and is usable without automation or bypassing protections.

Use Socialglowz as a code donor for:

- Vue/Vite/Tauri Android project scaffolding.
- Pinia persisted stores.
- Convex auth and sync patterns.
- i18n setup.
- PrimeVue component system.
- Backup/export patterns.
- Android plugin wiring pattern.
- Validation style for URLs and payloads.

Do not copy:

- Social network-specific UI.
- Anti-fingerprint / stealth WebView logic.
- Social account/profile concepts except where the generic sync pattern is useful.
- Existing Kanban model as the core data model.

## Draft Product Shape

Primary screens:

- Lists: "Cuisine", "Voiture", "Cadeaux", etc.
- List detail: product cards with photo, title, snapshot price, availability, note, tags, quantity, priority.
- Product detail: archived snapshot, images, options, original URL, availability history, user notes.
- Import review: when receiving a Temu share, show parsed data and ask which list to save into.
- Missing-data editor: let the user add/adjust title, image, price, variant when the link preview is incomplete.
- Archive/backup: export all saved snapshots.

Core entities:

- `shoppingLists`
- `products`
- `productSnapshots`
- `listItems`
- `productImages`
- `availabilityChecks`

Important invariant: deleting or changing the original Temu product must not destroy the local/cloud snapshot already saved by the user.

## Non-Decisions

- Whether the app must work fully offline before account creation.
- Whether image storage is local-only, Convex storage, object storage, or hybrid.
- Whether there is a paid cloud sync plan.
- Whether iOS is in scope.
- Whether cart import is promised in the MVP.
- Whether product availability checks are manual or automatic.

## Rejected Paths

- Automated scraping of cart pages - Rejected for MVP because Temu terms restrict crawling/scraping and significant content copying without consent, and this would be fragile.
- Reusing Socialglowz stealth WebView logic - Rejected because it increases policy and platform risk.
- Link-only wishlist - Rejected because it fails the central value: preserving product identity after removal/sellout.

## Risks And Unknowns

- Temu share payload: Need real Android samples for product share and any cart/share-list feature.
- Image rights/storage: Need decide how much product imagery to preserve and under what personal-use framing.
- Availability refresh: Need decide whether the app checks links automatically, only on user action, or never.
- Auth/sync: Need decide local-first anonymous mode vs mandatory login.
- Storage cost: Product images can become expensive if cloud-synced.
- Policy boundary: Need keep imports user-initiated and avoid background scraping.
- App store review: Need avoid implying affiliation with Temu unless authorized.

## Redaction Review

- Reviewed: yes
- Sensitive inputs seen: none
- Redactions applied: none
- Notes: No secrets, cookies, tokens, private user data, or live Temu account data were inspected.

## Decision Inputs For Spec

- User story seed: As a Temu shopper, I want to save products from Temu into named shopping lists with durable snapshots, so I can remember what the product was even when Temu removes or sells it out.
- Scope in seed: Android app, share-target import, manual URL fallback, named lists, product snapshots, offline-readable saved product details, availability state.
- Scope out seed: Automated cart scraping, bypassing anti-bot systems, mass catalog scraping, public resale of Temu product data.
- Invariants/constraints seed: User-initiated imports only; saved snapshots remain readable without the original Temu page; original URL preserved; missing metadata can be edited manually; product state can become unavailable without deleting archived details.
- Validation seed: Real-device Android share tests from Temu product page; unit tests for URL parsing and snapshot validation; local/offline persistence test; Convex sync round-trip test if cloud sync is included.

## Handoff

- Recommended next command: `/sf-spec Temu shopping lists Android app`
- Why this next step: The concept is clear enough for a spec, but the spec should mark cart import as an investigation spike until real Temu share/cart payloads are captured.

## Exploration Run History

| Date UTC | Prompt/Focus | Action | Result | Next step |
|----------|--------------|--------|--------|-----------|
| 2026-06-09 00:00:00 UTC | Android app inspired by Socialglowz for Temu product lists | Inspected Socialglowz stack, Android/Tauri pieces, Convex schema, sync/backup patterns, Android share docs, Tauri mobile docs, and Temu terms | Recommended share-target-first MVP with manual paste fallback and cart import as a spike | `/sf-spec Temu shopping lists Android app` |
