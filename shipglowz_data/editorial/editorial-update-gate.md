---
artifact: editorial_policy
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: reviewed
source_skill: 300-sg-docs
scope: public-content-update-gate
owner: "Diane"
confidence: high
risk_level: high
security_impact: none
docs_impact: yes
linked_systems:
  - shipglowz_data/editorial/claim-register.md
  - shipglowz_data/editorial/page-intent-map.md
depends_on: []
supersedes: []
evidence:
  - "Affiliate readiness requires public claims to match evidence."
next_step: "/206-sg-audit-copy public guides"
---

# Editorial Update Gate

Before changing a public guide, legal/trust page, sitemap entry, or machine-readable public summary:

1. Identify the page job in `page-intent-map.md`.
2. Check every new/changed claim against `claim-register.md`.
3. Verify a visible disclosure is near any affiliate CTA.
4. Confirm the route is substantive before adding it to sitemap, guide index, or `llms.txt`.
5. Record source date and known limitations for product claims.
6. Run the static build and browser evidence path before calling the page ready.

Claim impact plan for the affiliate-readiness chantier: public guide copy, trust wording, and machine-readable route listing are impacted; general app feature copy is not changed by the guide template alone.

## Maintenance Rule

Update the gate when the site gains a new editorial surface or a partner approval changes the disclosure obligation.
