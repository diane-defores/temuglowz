---
artifact: technical_workflow
metadata_schema_version: "1.0"
artifact_version: "0.1.1"
project: TemuGlowz
created: "2026-07-10"
updated: "2026-07-12"
status: draft
source_skill: 001-sg-build
scope: authenticated-temu-product-enrichment
owner: unknown
confidence: high
risk_level: medium
security_impact: yes
docs_impact: yes
linked_systems:
  - shipglowz_data/technical/code-docs-map.md
  - shipglowz_data/technical/site/guide-pages-contract.md
  - shipglowz_data/workflow/TASKS.md
  - site/src/pages/guides/gadgets-informatique.astro
  - site/src/site/data/gadgets-informatique.json
  - site/src/site/components/ProductCard.astro
  - site/tools/add-temu-product.ts
  - .agents/skills/temu-product-adder/SKILL.md
depends_on:
  - artifact: "shipglowz_data/technical/site/guide-pages-contract.md"
    artifact_version: "0.1.0"
    required_status: "draft"
supersedes: []
evidence:
  - "Temu product page goods_id=601105166590393 redirects to login for browser access."
  - "Playwright MCP runtime required local Chromium installation before authenticated browser work was possible."
  - "Reliable enrichment requires a signed-in Temu session for some products and regions."
next_review: "2026-07-24"
next_step: "/300-sg-docs update Temu authenticated workflow after first reusable extraction script"
---

# Temu Authenticated Product Enrichment Workflow

## Purpose

Make Temu product enrichment repeatable without relying on conversation memory.

This workflow defines how to:

- open a Temu product in a real browser
- authenticate with a dedicated test account when required
- extract only reliable product fields
- convert the result into guide-page content updates
- avoid storing secrets or session artifacts unsafely in the repo

## Scope

This document applies when a guide-enrichment task depends on browser-visible Temu product data that is not safely accessible from public HTML alone.

Typical cases:

- a Temu product page redirects to login before title/price/details are visible
- the browser-visible price or variant differs by region or session
- the product page requires a real user flow to confirm the visible primary image, description, or current sale state

## Current Known Constraint

At least some Temu product URLs redirect to `login.html` before the product detail page is visible.

Known example:

- `https://www.temu.com/goods.html?goods_id=601105166590393`

Therefore:

- unauthenticated search or open-page fetches are not always sufficient
- browser-authenticated proof is a supported enrichment path
- the enrichment workflow must explicitly model session setup

## Canonical Inputs

Minimum operator input for an authenticated enrichment run:

- product URL or `goods_id`
- target guide slug
- preferred section when already known

When browser login is required, the operator additionally provides:

- test-account email
- permission to submit the Temu login form
- OTP code when Temu sends it

## Canonical Output

The workflow should produce a normalized product payload suitable for guide insertion.

Preferred fields:

- `name`
- `productUrl`
- `image`
- `description`
- `price`
- `galleryImages`
- `videoUrl`
- `rating`
- `reviewCount`
- `reviewSnippets`
- `pros`
- `cons`
- `imageWidth`
- `imageHeight`

If a field is not reliably observable, leave it unset instead of inventing it.

## Current Tooling Entry Point

The current CLI entry point is:

- `site/tools/add-temu-product.ts`

It now has two explicit modes:

- `prepare`
- `apply`

Use `prepare` first, even when the final goal is a guide update.

Examples:

```bash
pnpm --filter @temuglowz/site product:add -- prepare --url "https://www.temu.com/goods.html?goods_id=601105166590393"
pnpm --filter @temuglowz/site product:add -- apply --input-file /tmp/product.json --page gadgets-informatique --section connectique-usb
```

Behavior contract:

- `prepare` never writes guide data
- `prepare` returns `needs_authentication` when Temu redirects to login
- `prepare` returns a machine-readable checklist and completeness level
- `apply` only writes when the requested completeness threshold is met
- the tool updates `updatedDate` in the target guide data file when insertion succeeds

## Extraction Checklist

### Required

- `name`
- `productUrl`
- `description`
- `primaryImage`

### Recommended

- `galleryImages[]` with at least 3 images
- `price`
- `rating`
- `reviewCount`
- `pros[]`

### Bonus

- `videoUrl`
- `reviewSnippets[]`
- `imageWidth`
- `imageHeight`

## Publish Gates

### minimum_publishable

- `name`
- `productUrl`
- `description`
- `primaryImage`

### strong_publishable

- everything in `minimum_publishable`
- `galleryImages[]`
- `price`
- `rating`
- `reviewCount`
- `pros[]`

This should be the default target for public guide insertion.

### premium_enrichment

- everything in `strong_publishable`
- `videoUrl`
- `reviewSnippets[]`
- `imageWidth`
- `imageHeight`

## Runtime Prerequisite

Authenticated browser work depends on a functioning Playwright MCP runtime.

The known-good local requirement is:

- Playwright MCP must launch with an explicit Chromium executable path
- the referenced Chromium binary must actually exist on disk

Do not assume the configured path exists just because MCP configuration names it.

## Execution Flow

### 1. Open the product URL directly

Start from the exact Temu product URL or a normalized `goods_id` URL.

Observe one of two outcomes:

- product page is visible directly
- product page redirects to Temu login

### 2. If redirected, switch to authenticated mode

Use a dedicated test account, not a personal account.

Safe interaction model:

- browser opens the Temu login page
- the email field is filled with the test-account email
- the login form is submitted only with explicit operator approval
- the operator provides the OTP code out-of-band

Do not store OTP codes, passwords, or cookies in repo files.

### 3. Extract only visible, reliable product fields

Preferred extraction order:

1. visible product title
2. visible current price
3. visible primary image URL
4. visible rating/review summary
5. visible bullet points or short description
6. visible variant or pack-size information when it materially changes the guide copy

Do not infer:

- fake ratings
- stale prices
- hidden specs
- guessed dimensions

### 4. Normalize into a guide payload

Translate the product page into a guide-safe content object.

Rules:

- keep the product title close to Temu wording, but shorten only when it improves readability
- keep the guide description editorialized and concise
- `pros` should come from visible benefits, not pure invention
- `cons` should be omitted when not observable
- preserve the source Temu URL

### 5. Route to the right section

Section placement should follow the guide data model, not convenience.

If the current guide sections do not fit the product well:

- prefer adding a better section over forcing a poor classification
- document the new section in the same update when it becomes durable

### 6. Update the page and metadata

After normalization:

- update the guide data JSON
- update the guide page only if structure or copy needs adjustment
- keep sitemap and indexability aligned with actual content readiness

## Reliability Rules

- Treat browser-visible data as authoritative over search snippets when the page is accessible.
- Treat search snippets as fallback hints only.
- Do not publish placeholder product entries as if they were confirmed.
- If the product page cannot be reached after login, report the exact stop point instead of guessing the payload.

## Session Strategy

Short term:

- use assisted login with operator-provided OTP

Preferred longer-term evolution:

- introduce a dedicated reusable test-account session strategy
- keep session state outside the repo
- define expiry/relogin expectations explicitly

Until that exists, assume OTP-assisted login is the standard path.

## Security Rules

- Never commit test-account credentials, OTP codes, cookies, or storage state.
- Never paste raw session tokens into docs, tracker entries, or summaries.
- Redact private account identifiers in user-facing reports when unnecessary.
- Use a test account that exists only for Temu enrichment work.

## Current Repeatable Minimum

A future operator or agent should be able to restart the flow with:

1. this workflow document
2. the target product URL
3. the target guide slug
4. a test-account email
5. an OTP supplied at run time

That is the minimum acceptable repeatability bar for now.

## Next Hardening Step

The next structural improvement is not more conversation guidance.

It is one of:

- a reusable extraction script that prepares the normalized payload after login
- a session-state strategy for the test account
- a documented product-field extraction checklist tied to `temu-product-adder`

## Maintenance Rule

Update this document whenever:

- Temu changes the login gate behavior
- the runtime/browser prerequisite changes
- a reusable script or session-state strategy replaces the current assisted-login flow
- guide ingestion requires new canonical product fields
