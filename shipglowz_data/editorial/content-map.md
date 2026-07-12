---
artifact: editorial_map
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: reviewed
source_skill: 300-sg-docs
scope: public-content-routing
owner: "Diane"
confidence: high
risk_level: high
security_impact: none
docs_impact: yes
linked_systems:
  - src/pages/
  - src/site/data/
  - src/site/components/AffiliateGuideTemplate.astro
depends_on:
  - artifact: shipglowz_data/editorial/README.md
    artifact_version: "1.0.0"
    required_status: reviewed
supersedes: []
evidence:
  - "Guide routes are Astro static pages backed by JSON data."
next_step: "/206-sg-audit-copy public guides"
---

# Content Map

| Surface | Source | Job | Claim sensitivity | Update trigger |
|---|---|---|---|---|
| Home | `src/pages/index.astro` and shared components | Explain the local-first shopping-list product | high | product availability, pricing, or platform claim changes |
| Guide index | `src/pages/guides/index.astro`, `src/site/data/guideIndex.ts` | List only complete public guides | high | route, indexability, or guide readiness changes |
| Kitchen guide | `src/pages/guides/kitchen-gadgets.astro`, JSON data | Help compare kitchen product options | high | product source, pricing, disclosure, or methodology changes |
| Summer guide | `src/pages/guides/summer-cooling.astro`, JSON data | Help compare cooling product options | high | product source, pricing, disclosure, or methodology changes |
| Draft computing guide | `src/pages/guides/gadgets-informatique.astro` | Hold future taxonomy without public recommendation | high | stable source corpus becomes available |
| Trust pages | `src/pages/terms.astro`, `src/pages/privacy.astro` | State current project and data posture conservatively | high | app data/auth/partnership posture changes |
| Machine-readable summary | `public/llms.txt` | Describe only currently published guide surfaces | high | indexable guide set or trust posture changes |

## Maintenance Rule

Add any new public route before it is promoted, indexed, or added to a sitemap.
