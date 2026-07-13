---
artifact: claim_register
metadata_schema_version: "1.0"
artifact_version: "1.1.0"
project: "ShopGlowz"
created: "2026-07-12"
updated: "2026-07-13"
status: reviewed
source_skill: 300-sg-docs
scope: public-claim-evidence
owner: "Diane"
confidence: high
risk_level: high
security_impact: none
docs_impact: yes
linked_systems:
  - site/src/site/data/
  - site/src/pages/guides/
  - site/src/pages/terms.astro
  - site/src/pages/privacy.astro
depends_on:
  - artifact: "FTC Endorsement Guides: What People Are Asking"
    artifact_version: "accessed 2026-07-12"
    required_status: reviewed
supersedes: []
evidence:
  - "Public guide data formerly included unsupported testing language."
next_step: "/206-sg-audit-copy public guides"
---

# Claim Register

| Claim family | Permitted wording | Required evidence | Forbidden wording without evidence |
|---|---|---|---|
| Product selection | curated, selected to compare, listed for a stated use case | current source log and visible criteria | tested, approved, best proven |
| Price/availability | indicative, verify on the merchant page | dated source observation | live, guaranteed, always in stock |
| Product capability | feature announced on the product page | dated product source | works perfectly, reliable, safe, best quality |
| Affiliate status | no current partner status; possible commission after approval | written program approval and implemented disclosure | official partner, authorised, sponsored by a merchant |
| Seller/reviews | verify ratings and seller information on the merchant page | dated verified source | verified seller, trusted rating, independently reviewed |
| App data posture | local-first as documented by verified code/docs | implementation and privacy contract | private, secure, production-ready without scope/evidence |

## Maintenance Rule

Review this register before publishing, indexing, or sending any page to a partner.
