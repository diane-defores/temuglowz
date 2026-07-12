---
artifact: exploration_report
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-10"
updated: "2026-06-10"
status: draft
source_skill: sf-explore
scope: "Embedding Temu inside the Android app with WebView/Tauri"
owner: "unknown"
confidence: medium
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "Tauri Android"
  - "Android WebView"
  - "Temu product pages"
  - "Android Sharesheet"
  - "Product snapshot import"
evidence:
  - "Current app uses Tauri and displays the Vue/Vite frontend in a WebView."
  - "Current share bridge consumes Android/Tauri share payloads and web query imports."
  - "Temu Terms of Use reviewed on 2026-06-10; automation, scraping, and significant content storage are sensitive areas."
depends_on:
  - "shipglowz_data/workflow/specs/temu-shopping-lists-android-app.md"
supersedes: []
next_step: "/sf-spec In-app Temu WebView capture mode"
---

# Exploration Report: Temu WebView Embedding

## Starting Question

Should the app embed Temu inside an Android WebView, using Tauri or native Android WebView code, so the user can browse Temu in-app, save products more directly, maybe save a cart, and possibly inject visual themes or helper controls?

## Context Read

- `app/src-tauri/tauri.conf.json` - Confirms the current Android app is a Tauri app wrapping our own Vue/Vite frontend in a WebView.
- `app/src/lib/shareBridge.ts` - Confirms the current integration model is share/query payload import, not an embedded Temu browser.
- `.github/workflows/dev-builds.yml` - Confirms GitHub CI is intended to build a debug Android APK.
- `shipglowz_data/workflow/specs/temu-shopping-lists-android-app.md` - Confirms the current spec treats direct Temu/cart capture as unresolved and higher risk.

## Internet Research

- [Temu Terms of Use](https://www.temu.com/terms-of-use.html) - Accessed 2026-06-10 - Used to verify current risk language around access rules, automated scraping/crawling, copying/storing service content, and personal non-commercial use.

## Problem Framing

There are two different ideas that can look similar:

- Tauri WebView as app shell: the app UI is ours, rendered by a WebView.
- Temu-in-WebView mode: the app loads `temu.com` inside an internal browser surface.

The current implementation only does the first. Adding the second can make product capture smoother, but it also creates account, privacy, fragility, policy, and trademark risk.

## Option Space

### Option A: Keep Share-Based Import As Primary

- Summary: User browses in Temu, shares a product/cart link to our app, then confirms the snapshot.
- Pros: Lowest risk, explicit user action, less fragile, no Temu login inside our app.
- Cons: Depends on what Temu exposes through share links; cart-level import may be limited.

### Option B: In-App Temu Browser Without DOM Injection

- Summary: Add an internal browser screen for Temu, but do not inspect or mutate the page. The app provides external controls such as "save current URL".
- Pros: Better UX than app switching, lower risk than DOM scraping, no hidden automation.
- Cons: Metadata capture remains weak unless the user manually confirms fields.

### Option C: User-Initiated Product Capture From WebView

- Summary: The user opens a Temu product in the embedded WebView and taps a visible app button. The app extracts only the visible/current product data needed for a personal snapshot.
- Pros: Strong UX, can prefill title/image/price/variant, preserves the user's intended product.
- Cons: Technically brittle; may break when Temu changes DOM; needs strict privacy boundaries and terms review.

### Option D: Cart Capture From WebView

- Summary: User opens their Temu cart in the embedded WebView, then taps "save visible cart". The app extracts visible product cards and asks the user to choose target lists.
- Pros: Directly matches the user's original pain around cart organization.
- Cons: Highest risk short of automation; requires login; risks over-collection; may be blocked or considered scraping if not carefully constrained.

### Option E: Theme/CSS Injection

- Summary: Inject CSS or helper UI into Temu pages loaded in the embedded WebView.
- Pros: Could add visual list controls, highlight saved products, reduce visual clutter, or overlay save/category buttons.
- Cons: High fragility and product risk; must not hide prices, shipping costs, warnings, checkout states, brand identity, or mislead the user about what is Temu vs our app.

## Emerging Recommendation

Use a staged approach:

1. Keep Android share import as the stable default.
2. Add "Temu browser beta" as an opt-in mode.
3. Start with no DOM mutation: save current URL plus manual confirmation.
4. Add user-initiated extraction only for the current visible product page.
5. Defer cart extraction until a real-device prototype proves it works without hidden automation or broad scraping.

Avoid theme injection for the first Temu WebView version. If it is added later, treat it as a local assistive overlay: never change checkout meaning, prices, warnings, product claims, or brand identity.

## Risks And Unknowns

- Temu may block or degrade embedded WebViews.
- Temu DOM and client data structures can change without notice.
- In-app login means the app must handle a sensitive session context and avoid collecting cookies, passwords, or private account data.
- Temu's current terms restrict automated crawling/scraping and storing significant service content without consent; product snapshot behavior should stay user-initiated, minimal, and personal.
- Google Play review may object if the app appears affiliated with Temu, wraps Temu as a competing storefront, or modifies a third-party shopping flow.

## Decision Inputs For Spec

- User story seed: As a shopper, I can browse Temu inside the app and save the current product into one of my lists without losing the product details later.
- Scope in seed: opt-in in-app browser, visible save button, URL capture, manual confirmation, limited current-product metadata extraction after user action.
- Scope out seed: background scraping, automated cart crawling, checkout automation, credential interception, price manipulation, hiding Temu warnings or fees.
- Invariants/constraints seed: no password/cookie capture, no automated purchase actions, no background crawling, no bulk content archival, no implication of Temu affiliation.
- Validation seed: real Android test with Temu product page, login boundary review, share fallback still works, snapshot remains after product URL is removed or unavailable.

## Redaction Review

- Reviewed: yes
- Sensitive inputs seen: none
- Redactions applied: none
- Notes: Report summarizes public terms and local source files only.

## Handoff

- Recommended next command: `/sf-spec In-app Temu WebView capture mode`
- Why this next step: This is a meaningful architecture and policy expansion beyond the current share-based MVP and should be scoped separately before implementation.

## Exploration Run History

| Date UTC | Prompt/Focus | Action | Result | Next step |
|----------|--------------|--------|--------|-----------|
| 2026-06-10 08:10:00 UTC | Temu inside Tauri/WebView | Compared share import, embedded browser, DOM extraction, cart capture, and CSS/theme injection | Recommended staged opt-in browser with strict user-initiated capture boundaries | `/sf-spec In-app Temu WebView capture mode` |
