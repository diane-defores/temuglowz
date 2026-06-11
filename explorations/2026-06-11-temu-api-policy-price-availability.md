---
artifact: exploration_report
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-11"
updated: "2026-06-11"
status: draft
source_skill: 700-sf-explore
scope: "Temu API and policy boundaries for price and availability tracking"
owner: "Diane"
confidence: medium
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "Temu Partner Platform"
  - "Temu Terms of Use"
  - "Temu Shopping Lists Android WebView"
  - "shipflow_data/workflow/TASKS.md"
  - "shipflow_data/workflow/specs/temu-shopping-lists-android-app.md"
  - "shipflow_data/workflow/specs/temu-shopping-webview-sessions.md"
evidence:
  - "Official Temu Terms of Use reviewed 2026-06-11: automated crawling/scraping, storing significant service content without consent, and commercial use without permission are sensitive/restricted."
  - "Official Temu Partner Platform public materials reviewed 2026-06-11: Temu has partner/open APIs, but the public evidence points to authorized partners/sellers and permitted API use, not a general consumer price-alert API."
  - "Project TASK-2026-06-10-013 already tracks a deferred price and availability history spec."
  - "Existing project specs already exclude automated scraping, stealth WebView behavior, cookie export, cart crawling, and background harvesting."
depends_on:
  - artifact: "shipflow_data/workflow/TASKS.md"
    artifact_version: "unknown"
    required_status: active
  - artifact: "explorations/2026-06-10-temu-webview-embedding.md"
    artifact_version: "1.0.0"
    required_status: draft
supersedes: []
next_step: "/100-sf-spec Price and availability observation for saved Temu products"
---

# Exploration Report: Temu API And Price/Availability Boundaries

## Starting Question

Observer le vrai contexte avant de spécifier le suivi prix/stock: Temu propose-t-il une API utilisable, et quelles limites faut-il respecter pour rester en bons termes avec Temu?

## Context Read

- `CLAUDE.md` - confirms the project targets Android Tauri with native WebView and CI-first Android proof.
- `shipflow_data/workflow/TASKS.md` - confirms `TASK-2026-06-10-013`: price and availability history is already a deferred follow-up.
- Existing specs and explorations - confirm repeated guardrails: no automated cart scraping, no stealth WebView, no cookie export, no background product harvesting.

## Internet Research

- [Temu Terms of Use](https://www.temu.com/terms-of-use.html) - Accessed 2026-06-11 - Primary source for public service-use restrictions and risk boundaries.
- [Temu Partner Platform](https://partner.temu.com/) - Accessed 2026-06-11 - Primary source showing Temu has an official partner platform for apps and APIs.
- [Temu Partner API request endpoints documentation](https://partner.temu.com/documentation?menu_code=38e79b35d2cb463d85619c1c786dd303&sub_menu_code=8311de2b2d434e4d805e88413ab815d8) - Accessed 2026-06-11 - Search/open evidence that Open Platform API requests exist, but documentation is JavaScript-gated.
- [Temu Partner Platform Terms PDF](https://partner.temu.com/protocol/temu_partner_platform_terms_20250523.pdf) - Accessed 2026-06-11 - Primary source for partner/API permitted-use framing, authorized users, API materials, and platform review/corrective powers.
- [Temu Affiliate Program](https://www.temu.com/affiliate_recruit.html) - Accessed 2026-06-11 - Primary source showing official affiliate/referral program exists, but it is not evidence of product price/stock data API access.

## Problem Framing

The product need is legitimate: users want to know when a saved Temu product changes price or becomes scarce/sold out, and they want the local snapshot to remain understandable after Temu changes or removes the listing.

The policy problem is that automatic price/availability monitoring can easily become scraping:

```
User intent                  Risk boundary
───────────                  ─────────────
Save product manually  ───▶  low risk when visible, user-initiated, local
Refresh current product ──▶  medium risk if explicit and rate-limited
Background checks      ───▶  high risk: automated repeated access
Mass price tracking    ───▶  likely scraper/product-harvesting territory
Bypass/stealth         ───▶  reject
```

## API Observations

Temu appears to have official APIs through the Temu Partner Platform. Public search results and the Partner Terms point to apps built for authorized platform use, seller/merchant operations, seller authorization, signed API requests, and partner review. This is not the same as a public buyer-facing API that a shopping-list app can freely use to monitor arbitrary consumer product pages.

There are third-party "Temu API" or scraper products, but those should not be treated as safe evidence of permission. Some explicitly market access to product price/availability data unavailable through an official public API. That is exactly the kind of path this project should avoid unless a later legal/policy decision explicitly accepts it.

## Option Space

### Option A: Official Partner API

- Summary: Apply for/use Temu Partner Platform API access if Temu grants a permitted use that covers product availability/price observation for this app.
- Pros: Best relationship with Temu; structured API; less brittle than WebView parsing.
- Cons: Access and allowed scope are uncertain; likely designed for sellers/partners, not consumer saved-product alerts; may require app review, contracts, seller authorization, and data security obligations.

### Option B: User-Initiated WebView Observation

- Summary: Only observe the currently visible product page after the user taps a button in our app, while the user is shopping.
- Pros: Matches existing app architecture; no background crawling; no hidden automation; easy to explain as a personal capture/update action.
- Cons: Still needs careful implementation; DOM extraction can be fragile; should not scrape broad page content or bypass protections.

### Option C: Manual/Reminder-Based Status

- Summary: Store last-seen price/availability when captured; let user mark alert preferences; app reminds user to re-check, but does not automatically crawl Temu.
- Pros: Safest policy posture; useful enough for a first version; works even without API access.
- Cons: Less magical; no real-time alerts unless the user opens/rechecks the product.

### Option D: Background Scraper Or Third-Party Scraper API

- Summary: Periodically fetch Temu product pages or use scraper APIs for price/availability.
- Pros: Strong feature promise: price alerts, stock alerts, histories.
- Cons: Highest policy and operational risk; conflicts with the project's current no-scraping guardrails; can trigger anti-bot systems; fragile; likely wrong for an app that wants to remain friendly to Temu.

## Comparison

| Criterion | Partner API | User-Initiated WebView | Manual/Reminder | Background Scraper |
| --- | --- | --- | --- | --- |
| Temu relationship | Best if approved | Reasonable if narrow | Best without API | Worst |
| Product value | High | Medium-high | Medium | High |
| Policy risk | Medium until approved | Medium-low | Low | High |
| Technical fragility | Low-medium | Medium | Low | High |
| Time to first safe version | Unknown | Medium | Low | Medium-high |
| Fits current app | Maybe later | Yes | Yes | No |

## Emerging Recommendation

Use a two-lane strategy:

1. Product lane now: implement "observations" rather than "monitoring".
   - Capture last-seen price/availability only when the user explicitly saves or refreshes the current visible product in the WebView.
   - Store timestamp, source URL, observed values, and confidence.
   - Let users opt into local reminders such as "me rappeler de vérifier ce produit", not background crawling.

2. Partnership lane later: investigate Temu Partner Platform access separately.
   - Do not build the core product on unofficial endpoints.
   - Do not claim live price/stock alerts unless Temu-approved API access or a clearly permitted route exists.

## Proposed Guardrails

- No background crawling of Temu product pages.
- No mass product harvesting, search scraping, cart scraping, or competitor analytics.
- No stealth/anti-detection code, webdriver masking, proxy rotation, CAPTCHA bypass, or hidden automation.
- No Temu cookie export, account/session sync, password capture, checkout capture, payment capture, address capture, or order-history capture.
- No modifications that hide or alter Temu price, shipping fees, warnings, seller identity, delivery promises, checkout content, or brand identity.
- No claim of Temu partnership, approval, certification, or API authorization unless actually granted.
- Store only user-saved product observations and bounded snapshots needed for personal lists.
- Keep refreshes explicit, visible, rate-limited, and user-initiated.
- If official API access is pursued, treat it as a separate high-risk spec with fresh docs, account review, data-protection obligations, and permitted-use proof.

## Non-Decisions

- Whether to apply for Temu Partner Platform access.
- Whether local notifications should be Android local-only or cloud-backed premium notifications.
- Whether to parse visible DOM for price/availability in v1.
- Exact alert thresholds, such as price drop percentage or "almost sold out" confidence.

## Rejected Paths

- Third-party scraper APIs as the default backend - rejected because permission is unclear and the project has already set a no-scraping posture.
- Background scheduled product refreshes against Temu pages - rejected for first spec because it is automated repeated access.
- Cart/page crawler - rejected because it overlaps with high-risk cart scraping already blocked in project tasks.

## Risks And Unknowns

- Official API scope is uncertain: Temu has official partner APIs, but current public evidence does not prove a permitted buyer-product-alert API.
- Product page semantics are fragile: "low stock" or "sold out" may be rendered differently by locale, promotion, variant, or login state.
- Notifications can imply reliability: if we cannot verify stock continuously, copy must say "last observed" or "reminder", not "live stock alert".
- Storage boundary matters: saved product snapshots should be personal and bounded, not a product database.

## Redaction Review

- Reviewed: yes
- Sensitive inputs seen: none
- Redactions applied: none
- Notes: Web sources were summarized; no cookies, tokens, account data, or private logs were used.

## Decision Inputs For Spec

- User story seed: En tant qu'utilisatrice, je veux suivre l'état observé des produits Temu que j'ai sauvegardés, afin de savoir lesquels méritent une vérification ou une action avant qu'ils disparaissent ou soient épuisés.
- Scope in seed: explicit user-triggered observation, last-seen price, last-seen availability, observation timestamp, status confidence, local reminder/notification preference.
- Scope out seed: background crawling, scraper API, mass monitoring, cart scraping, affiliate automation, official Temu partnership claims.
- Invariants/constraints seed: user-initiated only, visible WebView only, bounded personal data, no Temu cookies/account/session export, no checkout/payment/address/order capture.
- Validation seed: policy grep for forbidden automation terms, Android manual smoke for explicit refresh, tests for observation history merge/deduplication, UI copy audit for "last observed" wording.

## Handoff

- Recommended next command: `/100-sf-spec Price and availability observation for saved Temu products`
- Why this next step: The safest first product slice is not "live monitoring"; it is explicit observations and reminders. A spec should encode that boundary before implementation.

## Exploration Run History

| Date UTC | Prompt/Focus | Action | Result | Next step |
|----------|--------------|--------|--------|-----------|
| 2026-06-11 01:24:00 UTC | Temu API and policy limits for price/availability alerts | Read project context, searched official Temu terms/partner/affiliate sources, compared API/user-initiated/manual/scraper paths | Recommended explicit user-initiated observations first; defer official API partnership and reject scraping as default | /100-sf-spec Price and availability observation for saved Temu products |
