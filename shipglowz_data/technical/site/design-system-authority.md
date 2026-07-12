---
artifact: technical_guidelines
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: reviewed
source_skill: 300-sg-docs
scope: public-site-design-system-authority
owner: "Diane"
confidence: high
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - site/src/styles/global.css
  - site/src/site/components/
  - app/src/app-pages/
depends_on:
  - artifact: shipglowz_data/technical/site/guide-pages-contract.md
    artifact_version: "0.1.0"
    required_status: draft
supersedes: []
evidence:
  - "Public Astro pages consume Tailwind v4 semantic color and radius variables from global.css."
next_review: "2026-08-12"
next_step: "/103-sg-verify public guide visual proof"
---

# Public Site Design-System Authority

## Canonical Source

`site/src/styles/global.css` is the public-site token source. Its semantic CSS variables and Tailwind v4 `@theme` bridge own colors, radius, typography families, reduced-motion behavior, and global visual primitives.

## Component Bridge

Public guide pages use `site/src/site/components/AffiliateGuideTemplate.astro` and `ProductCard.astro`. New guide presentation must extend these shared components rather than duplicate route markup or introduce page-local token values.

## Rules

- Use semantic Tailwind classes backed by `global.css` tokens.
- Preserve the reduced-motion behavior and visible focus treatment from `Layout.astro`.
- Do not add hardcoded color, spacing, motion, breakpoint or radius values outside the existing token/utility pattern unless a platform/API requirement is documented.
- Validate touched public UI with the design-system drift check and desktop/mobile browser proof.

## Maintenance Rule

Update this authority when the public-site token source or shared guide component boundary changes.
