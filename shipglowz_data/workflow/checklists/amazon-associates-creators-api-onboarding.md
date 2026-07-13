---
artifact: checklist
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-13"
updated: "2026-07-13"
status: draft
source_skill: 309-sg-tasks
scope: "Operator checklist for Amazon Associates and Creators API onboarding"
owner: "unknown"
confidence: high
risk_level: medium
security_impact: yes
docs_impact: yes
linked_systems:
  - "Amazon Associates"
  - "Amazon Creators API"
  - "shipglowz_data/workflow/research/2026-07-13-amazon-shein-official-access-options.md"
  - "shipglowz_data/workflow/specs/shopglowz-multi-merchant-gadget-platform.md"
depends_on: []
supersedes: []
next_step: "Run the checklist with a real Amazon Associates account and record the results in TASKS.md."
---

# Amazon Associates + Creators API Onboarding Checklist

## Goal

Obtain real Amazon affiliate/API access, capture the actual constraints, and decide quickly whether Amazon should become the first official merchant source for TemuGlowz.

## Inputs

- An Amazon account that can apply to Associates
- The public TemuGlowz or ShopGlowz site URL that will be declared to Amazon
- A stable email inbox for program and API approval messages
- A place to store credentials securely outside the repo

## Step 1: Confirm program entry conditions

- [ ] Verify which public site, social profile, or app surface will be declared in the Amazon Associates application.
- [ ] Verify that the public surface already contains basic legal pages and an affiliate disclosure path.
- [ ] Verify which Amazon marketplace matters first: `FR`, `DE`, `UK`, `US`, or other.
- [ ] Record the declared surface and target marketplace in `shipglowz_data/workflow/TASKS.md`.

## Step 2: Apply to Amazon Associates

- [ ] Create or reuse the Associates account.
- [ ] Record the exact approval status: `pending`, `approved`, `rejected`, or `needs_changes`.
- [ ] Record any requirements Amazon imposes before full approval.
- [ ] Record the Associate tag(s) issued for each marketplace.

Decision gate:

- If the site is rejected or blocked, stop the API work and document the blocker first.

## Step 3: Request or enable Creators API access

- [ ] Confirm the current Amazon official path in the docs: https://affiliate-program.amazon.com/creatorsapi/docs/
- [ ] Verify whether Creators API access is immediate, application-based, invite-based, or revenue-gated.
- [ ] Record every required credential or identifier without storing secrets in the repo.
- [ ] Record whether sandbox/testing access exists.
- [ ] Record any rate-limit, quota, or earning-based scaling rule.

Evidence pages:

- https://affiliate-program.amazon.com/creatorsapi/docs/
- https://affiliate-program.amazon.com/help/operating/policies
- https://affiliate-program.amazon.com/help/operating/agreement

## Step 4: Validate the data surface we actually need

- [ ] Confirm whether the API supports product search by keyword.
- [ ] Confirm whether the API supports direct item lookup by product identifier or URL-derived identifier.
- [ ] Confirm whether image URLs are available in multiple sizes.
- [ ] Confirm whether price, offer, availability, rating, and review-count fields are exposed.
- [ ] Confirm whether attribution/link-format rules are enforced by the API contract.
- [ ] Confirm whether data freshness or caching/storage limits are documented.

Minimum publishable data for TemuGlowz:

- product name
- affiliate destination URL
- primary image
- optional gallery or alternate images
- price or offer field, if policy and freshness allow it
- rating and review count, only if explicitly exposed and allowed

## Step 5: Run a narrow proof of concept

- [ ] Pick 3 to 5 products from one intended guide theme.
- [ ] Test search discovery, item lookup, and final affiliate-link generation.
- [ ] Compare the returned fields against the current guide-ingestion contract.
- [ ] Note all missing fields that still require manual enrichment.
- [ ] Decide whether Amazon can support a first merchant-backed pipeline with acceptable effort.

Success threshold:

- The API returns enough data to populate at least `name`, `url`, `primaryImage`, and one useful commerce field without policy ambiguity.

## Step 6: Record policy boundaries

- [ ] Capture the exact affiliate disclosure requirement for the site.
- [ ] Capture any restrictions on storing images, prices, reviews, or other product-advertising content.
- [ ] Capture any restrictions on mixing Amazon data with other merchants in the same comparison or guide context.
- [ ] Capture any mandatory attribution language or branding requirements.

## Step 7: Make the product decision

Choose one outcome and record it in `TASKS.md`:

- `go`: Amazon becomes the first official merchant source to integrate
- `go_limited`: Amazon is usable, but only for bounded guide types or fields
- `hold`: access exists, but quotas/policies/data gaps make implementation premature
- `no_go`: TemuGlowz should not build around Amazon now

## Expected Outputs

- Associates approval status
- marketplace and Associate tag list
- Creators API access status
- documented quotas/rate limits
- allowed field inventory
- policy summary for storage/disclosure
- `go / go_limited / hold / no_go` decision

## Follow-up If `go`

- update the merchant strategy task
- create a short implementation spec for an Amazon-backed ingestion proof
- define the merchant-neutral product schema delta from current Temu-oriented ingestion

## Sources

- https://affiliate-program.amazon.com/
- https://affiliate-program.amazon.com/creatorsapi/docs/
- https://affiliate-program.amazon.com/help/operating/policies
- https://affiliate-program.amazon.com/help/operating/agreement
- https://affiliate-program.amazon.com/welcome/topic/tools
- https://webservices.amazon.com/paapi5/documentation/
- shipglowz_data/workflow/research/2026-07-13-amazon-shein-official-access-options.md
