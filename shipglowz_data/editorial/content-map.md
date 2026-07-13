---
artifact: editorial_map
metadata_schema_version: "1.0"
artifact_version: "1.1.0"
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
  - site/src/pages/
  - site/src/components/
  - site/src/site/components/
  - site/src/site/data/
depends_on:
  - artifact: shipglowz_data/editorial/README.md
    artifact_version: "1.0.0"
    required_status: reviewed
supersedes: []
evidence:
  - "Guide routes are Astro static pages backed by JSON data."
  - "Operator decision 2026-07-13: the homepage becomes a catalogue-first discovery surface and the application remains a secondary path."
next_step: "/206-sg-audit-copy public guides"
---

# Content Map

| Surface | Source | Job | Claim sensitivity | Update trigger |
|---|---|---|---|---|
| Home | `site/src/pages/index.astro` and shared components | Lead with independent, fun discovery of useful or unusual Temu gadgets by use case; route to substantive guides and keep the application secondary | high | catalogue positioning, published guide set, app emphasis, affiliate posture, or claim boundary changes |
| Blog placeholder | `site/src/pages/blog.astro` | State the current editorial surface without implying unavailable articles | high | article collection or blog routing changes |
| App presentation | `site/src/pages/app.astro` | Explain how the shopping-list app fits the public site | high | app availability, platform, or sync claim changes |
| Buying guides | `site/src/pages/guides/`, `site/src/site/components/`, `site/src/site/data/` | Publish curated guide pages from structured product data | high | guide routes, product evidence, disclosures, or schemas change |
| Trust pages | `site/src/pages/terms.astro`, `site/src/pages/privacy.astro` | State current project and data posture conservatively | high | app data/auth/partnership posture changes |
| Machine-readable summary | `site/public/llms.txt` | Describe only currently published guide surfaces | high | indexable guide set or trust posture changes |

## Maintenance Rule

Add any new public route before it is promoted, indexed, or added to a sitemap.
