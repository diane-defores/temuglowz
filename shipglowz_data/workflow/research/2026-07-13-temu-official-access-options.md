---
artifact: exploration_report
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-13"
updated: "2026-07-13"
status: draft
source_skill: 203-sg-research
scope: "Official Temu access options for legal product discovery and enrichment"
owner: "unknown"
confidence: high
risk_level: medium
security_impact: no
docs_impact: yes
linked_systems:
  - "Temu affiliate program"
  - "Temu influencer program"
  - "Temu partner platform"
  - "Temu EU research API"
  - "Public guide product sourcing"
  - "Authenticated browser enrichment workflow"
evidence:
  - "Temu public affiliate and influencer pages do not advertise a publisher product feed or affiliate catalogue API."
  - "Temu partner documentation is framed around seller and partner operations, with authorization requirements before normal API use."
  - "Temu Terms of Use explicitly restrict crawling, scraping, and storing significant portions of service content without consent."
depends_on:
  - "shipglowz_data/technical/site/temu-authenticated-product-enrichment-workflow.md"
supersedes: []
next_step: "/300-sg-docs update the sourcing workflow after direct confirmation from Temu affiliate or partner support"
---

# Exploration Report: Temu Official Access Options

## Starting Question

What official Temu programs, APIs, or legal access paths exist that could let TemuGlowz discover or enrich product pages without relying on fragile manual browsing or prohibited scraping?

## Internet Research

- [Temu Affiliate Program](https://www.temu.com/affiliate_recruit.html) - Accessed 2026-07-13 - Public affiliate landing page used to verify whether Temu advertises affiliate product feeds, APIs, or data-export capabilities.
- [Temu Influencer Program](https://www.temu.com/influencer-recruit.html) - Accessed 2026-07-13 - Public influencer landing page checked for any parallel product-access tooling.
- [Temu Partner Platform](https://partner.temu.com/) - Accessed 2026-07-13 - Public partner entry point describing the scope of Temu's official API and integration tooling.
- [Temu Partner Platform: Seller Authorization Guide](https://partner.temu.com/documentation?menu_code=38e79b35d2cb463d85619c1c786dd303) - Accessed 2026-07-13 - Used to confirm the authorization gate for normal API usage.
- [Temu Partner Platform: Open API Authorization](https://partner.temu.com/documentation?menu_code=fb16b05f7a904765aac4af3a24b87d4a) - Accessed 2026-07-13 - Cross-check on partner API access requirements.
- [Temu EU Partner Documentation: Research API Overview](https://partner-eu.temu.com/documentation?menu_code=98501210a0cc465695e6d94e364bb83c) - Accessed 2026-07-13 - Used to verify whether Temu exposes research-oriented product and review endpoints in the EU partner environment.
- [Temu EU Partner Documentation: Mall Goods Query](https://partner-eu.temu.com/documentation?menu_code=98501210a0cc465695e6d94e364bb83c&sub_menu_code=4528d74753ee409a97bf025d56a687ac) - Accessed 2026-07-13 - Product-query endpoint evidence.
- [Temu EU Partner Documentation: Goods Reviews Query](https://partner-eu.temu.com/documentation?menu_code=98501210a0cc465695e6d94e364bb83c&sub_menu_code=c04d1f99c6864327a5c6ee8b2e8ee739) - Accessed 2026-07-13 - Review-query endpoint evidence.
- [Temu EU Partner Documentation: Advertising Library API](https://partner-eu.temu.com/documentation?menu_code=94af0dce5c054781807d5a0f45a2bd75) - Accessed 2026-07-13 - Checked for ad-transparency endpoints versus commerce/publisher endpoints.
- [Temu Researcher Instruction](https://partner-eu.temu.com/researcher-instruction) - Accessed 2026-07-13 - Used to infer whether the EU research branch targets vetted researchers rather than normal affiliate publishers.
- [Temu Vetted Researcher Instruction](https://partner-eu.temu.com/vetted-researcher-instruction) - Accessed 2026-07-13 - Used to confirm the likely audience for the research endpoints.
- [Temu Terms of Use](https://www.temu.com/terms-of-use.html) - Accessed 2026-07-13 - Used to confirm current restrictions on scraping, crawling, automated access, and significant content storage.

## What Temu Officially Offers

### 1. Affiliate Program

Temu publicly offers an affiliate program for referral links, codes, and commissions.

Current public evidence does not show:

- a product feed for publishers
- an affiliate catalogue API
- a documented bulk product-export surface
- a scraping allowance for affiliates

Conclusion:

- useful for monetization
- not sufficient on its own for catalogue ingestion

### 2. Influencer Program

Temu also offers an influencer program with a creator-oriented posture.

Current public evidence does not show any product-data tooling beyond the commercial program itself.

Conclusion:

- useful for samples or creator monetization if approved
- not a product-data access channel

### 3. Partner Platform / Open API

Temu does have a real official partner platform and API surface.

However, the documentation language is framed around sellers and partner operations, not around public editorial catalogue building. The authorization pages also indicate that seller authorization must be obtained before API capabilities can be used normally.

Conclusion:

- this is a real official API surface
- but it appears to be seller or marketplace-partner oriented
- it should not be assumed available to TemuGlowz as a normal affiliate publisher

### 4. EU Research / Advertising APIs

The EU partner environment exposes research-oriented endpoints including product, mall, review, and advertising-library queries.

This is the most interesting official surface from a pure data perspective.

But the surrounding documentation and researcher instructions strongly suggest a transparency or vetted-research use case, not a normal affiliate or SEO-publisher workflow.

Conclusion:

- official data endpoints do exist
- but the apparent policy frame is research/transparency, not editorial affiliate ingestion
- using this path for commercial guide-building would require explicit confirmation from Temu

## Legal Constraint

Temu's public Terms of Use are the clearest boundary:

- automated or manual crawling/scraping is restricted
- significant copying or storage of service content is restricted without consent
- commercial use of service content appears constrained without explicit permission

Conclusion:

- TemuGlowz should not treat affiliate acceptance as implied permission to scrape
- any automated catalogue ingestion needs a clearly documented official allowance

## Decision Summary

As of 2026-07-13, the official landscape looks like this:

- affiliate program: yes
- influencer program: yes
- official API: yes
- affiliate-facing publisher API/feed: not found
- official scraping permission: not found
- research-oriented EU data endpoints: yes
- confirmed legal business use of those research endpoints for TemuGlowz: not yet established

## Practical Recommendation

Use a two-track approach.

### Track A: Official Business Inquiry

Contact Temu affiliate or partner support and ask directly whether they offer:

- a publisher product feed
- an affiliate catalogue API
- deep-link catalogue search access
- approved bulk product metadata access for editorial comparison sites
- permission boundaries for storing images, descriptions, and review snippets

This is the only clean path to a scalable legal integration.

### Track B: Conservative Operational Fallback

Until Temu confirms an official data-access path:

- do not build a scraper as if it were authorized
- keep product discovery human-guided
- prefer external discovery such as search-engine indexing plus direct product-page review
- use the authenticated browser workflow only for page-level enrichment of known products
- record sourcing uncertainty explicitly in public content and internal logs

## Follow-Up Tasks

1. Prepare a concise Temu outreach packet with the exact access questions TemuGlowz needs answered.
2. Update the authenticated-enrichment workflow after Temu confirms or rejects an official data path.
3. Keep the current guide-ingestion tooling positioned as page-level enrichment, not catalogue scraping.

## Redaction Review

- Reviewed: yes
- Issues found: none

