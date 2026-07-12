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
  - site/src/pages/
  - site/src/content/
  - site/src/components/
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
| Home | `site/src/pages/index.astro` and shared components | Explain the local-first shopping-list product | high | product availability, pricing, or platform claim changes |
| Blog index and articles | `site/src/pages/blog/`, `site/src/content/blog/` | Publish and list public editorial content | high | route, indexability, or article readiness changes |
| Marketing pages | `site/src/pages/features.astro`, `site/src/pages/pricing.astro`, `site/src/pages/compare.astro` | Explain product value, offer, and alternatives | high | product, pricing, or comparison claim changes |
| Trust pages | `site/src/pages/terms.astro`, `site/src/pages/privacy.astro` | State current project and data posture conservatively | high | app data/auth/partnership posture changes |
| Machine-readable summary | `public/llms.txt` | Describe only currently published guide surfaces | high | indexable guide set or trust posture changes |

## Maintenance Rule

Add any new public route before it is promoted, indexed, or added to a sitemap.
