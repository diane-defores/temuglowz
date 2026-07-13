---
artifact: exploration_report
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-13"
updated: "2026-07-13"
status: draft
source_skill: 203-sg-research
scope: "Official Amazon and SHEIN access options for legal affiliate catalogue sourcing"
owner: "unknown"
confidence: high
risk_level: medium
security_impact: no
docs_impact: yes
linked_systems:
  - "Amazon Associates"
  - "Amazon Creators API"
  - "Amazon Product Advertising API"
  - "SHEIN affiliate program"
  - "SHEIN Open Platform"
  - "Temu official access research"
  - "Public guide product sourcing"
evidence:
  - "Amazon publicly offers an affiliate-oriented product API path and documents migration from PA-API to Creators API."
  - "Amazon Associates policies explicitly reference Creators API, PA API, and Data Feeds as governed product-advertising content channels."
  - "SHEIN public developer documentation is framed around seller experience, application review, and authorization integration."
depends_on:
  - "shipglowz_data/workflow/research/2026-07-13-temu-official-access-options.md"
supersedes: []
next_step: "/100-sg-spec define a merchant-agnostic guide-ingestion architecture with Amazon as the first official source"
---

# Exploration Report: Amazon and SHEIN Official Access Options

## Starting Question

Compared with Temu, do Amazon and SHEIN offer clearer official paths for affiliate-friendly product discovery, catalog access, and guide enrichment that TemuGlowz could use legally?

## Internet Research

- [Amazon Associates](https://affiliate-program.amazon.com/) - Accessed 2026-07-13 - Public affiliate program landing page used to confirm publisher-focused positioning.
- [Amazon Creators API docs](https://affiliate-program.amazon.com/creatorsapi/docs/) - Accessed 2026-07-13 - Primary official documentation for Amazon's current affiliate-oriented product API.
- [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies) - Accessed 2026-07-13 - Used to confirm that Amazon explicitly governs API and data-feed usage in affiliate policy.
- [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement) - Accessed 2026-07-13 - Used to verify the allowed publisher/site framing.
- [Amazon tools overview](https://affiliate-program.amazon.com/welcome/topic/tools) - Accessed 2026-07-13 - Public product/tooling overview referencing programmatic product access.
- [Amazon PA-API documentation](https://webservices.amazon.com/paapi5/documentation/) - Accessed 2026-07-13 - Historical documentation confirming deprecation and migration to Creators API.
- [Amazon PA-API registration page](https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html) - Accessed 2026-07-13 - Used to confirm the deprecation date and migration notice.
- [SHEIN affiliate program](https://m.shein.com/us/affiliate/recruit?cdn_rsite=cf&ref=m&rep=dir&ret=mus) - Accessed 2026-07-13 - Public affiliate landing page checked for any product-feed or publisher-API claims.
- [SHEIN Open Platform](https://open.sheincorp.com/) - Accessed 2026-07-13 - Public developer and onboarding entry point.
- [SHEIN developer documentation](https://open.sheincorp.com/documents/system/dad0d1c7-be76-4b03-a735-4e23f012bdd9) - Accessed 2026-07-13 - Used to confirm platform posture and supported business domains.
- [SHEIN API documentation sample](https://open.sheincorp.com/documents/apidoc/1000001) - Accessed 2026-07-13 - Checked to see whether public endpoints are seller/operations oriented versus publisher/catalog oriented.
- [SHEIN API calling guide](https://open.sheincorp.com/documents/system/49b797df-016e-40eb-882b-ab9bbaa8c630) - Accessed 2026-07-13 - Used to confirm authorization and application-centric integration model.

## Executive Conclusion

Amazon is materially more usable than Temu or SHEIN for an affiliate-driven content site that wants legal programmatic product access.

As of 2026-07-13:

- Amazon exposes an official affiliate-oriented API path through `Creators API`.
- Amazon's legacy `PA-API` is deprecated as of `May 15, 2026`, which confirms the current direction rather than closing access.
- SHEIN offers affiliation publicly, but its public developer platform appears seller/integrator oriented, not publisher/catalog oriented.
- Temu and SHEIN currently look similar from TemuGlowz's perspective: affiliate monetization exists, but a clearly documented publisher catalog API has not been found.

## Amazon: Officially Productizable For Affiliates

### What exists

Amazon publicly positions the Associates program for content creators, publishers, and bloggers. More importantly for TemuGlowz, Amazon documents a current `Creators API` that provides programmatic access to product catalog data for affiliate-style use cases.

Amazon also still exposes historical `PA-API` documentation, but those official pages now state that `PA-API` was deprecated on `May 15, 2026` and that developers should migrate to `Creators API`.

### Why this matters

This is the cleanest official path we have found so far for:

- product search
- item lookup
- catalog enrichment
- image and offer retrieval under policy
- reusable merchant-backed ingestion tooling

Amazon also explicitly references `Creators API`, `PA API`, and `Data Feeds` in its program policies, which is strong evidence that catalog access for affiliates is a recognized and governed use case rather than an implied loophole.

### Practical implication for TemuGlowz

Amazon is the best first candidate for a merchant integration that TemuGlowz can automate with low legal ambiguity.

That does not mean every desired field or workflow will be frictionless. TemuGlowz still needs to validate:

- approval prerequisites
- available marketplaces
- request quotas or revenue-gated scaling rules
- exact product fields exposed
- image sizes and variants
- pricing or offer freshness constraints
- attribution and disclosure requirements

But the category of access is clearly official.

## SHEIN: Official, But Likely Seller-First

### What exists

SHEIN has:

- a public affiliate program
- a public Open Platform
- onboarding/application/review/authorization flow
- developer docs for API calling

### What the public docs suggest

The Open Platform language centers on seller experience and e-commerce operational solutions such as product, order, return, procurement, and related integration flows. The platform also highlights application review and authorization integration, which points to a controlled partner ecosystem rather than open affiliate catalog access.

I did not find a public SHEIN equivalent of Amazon's affiliate-oriented catalog API documentation.

### Practical implication for TemuGlowz

SHEIN should currently be treated as:

- monetizable through affiliate participation
- potentially integrable only with further approval or partner status
- not yet proven as a simple publisher API source

So SHEIN remains worth qualifying, but not worth architecting around first.

## Comparison With Temu

Temu already looks constrained for TemuGlowz because:

- affiliate and influencer programs are public
- partner APIs exist
- but the public official path still does not show a confirmed publisher-facing catalog API
- public terms constrain scraping and significant content storage without permission

Compared to that:

- Amazon is a strong official integration candidate
- SHEIN is closer to Temu than to Amazon

## Decision Framework

### Best first official source

Choose Amazon first if the goal is to prove that TemuGlowz can scale beyond manual page handling.

### Why Amazon first

- official affiliate-facing API posture
- lower policy ambiguity
- clearer developer surface
- more credible path to reusable tooling
- easier basis for a merchant-agnostic ingestion abstraction later

### What to do with SHEIN

Keep SHEIN in qualification mode until one of these is confirmed:

- a true publisher-facing product API or feed
- a partner approval route TemuGlowz can realistically obtain
- written permission boundaries for product metadata usage

### What to do with Temu

Continue the Temu official-access inquiry, but do not block the whole product strategy on it.

## Recommended Next Steps

1. Apply for Amazon Associates access if not already approved.
2. Request or configure Amazon Creators API access and capture the real integration requirements.
3. Build a small proof-of-concept ingestion path around Amazon first.
4. In parallel, contact SHEIN and Temu support for written clarification on publisher data access.
5. Only after that, decide whether TemuGlowz should stay merchant-specific or become explicitly multi-merchant.

## Sources

- [Amazon Associates](https://affiliate-program.amazon.com/)
- [Amazon Creators API docs](https://affiliate-program.amazon.com/creatorsapi/docs/)
- [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies)
- [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement)
- [Amazon tools overview](https://affiliate-program.amazon.com/welcome/topic/tools)
- [Amazon PA-API documentation](https://webservices.amazon.com/paapi5/documentation/)
- [Amazon PA-API registration page](https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html)
- [SHEIN affiliate program](https://m.shein.com/us/affiliate/recruit?cdn_rsite=cf&ref=m&rep=dir&ret=mus)
- [SHEIN Open Platform](https://open.sheincorp.com/)
- [SHEIN developer documentation](https://open.sheincorp.com/documents/system/dad0d1c7-be76-4b03-a735-4e23f012bdd9)
- [SHEIN API documentation sample](https://open.sheincorp.com/documents/apidoc/1000001)
- [SHEIN API calling guide](https://open.sheincorp.com/documents/system/49b797df-016e-40eb-882b-ab9bbaa8c630)
