---
artifact: technical_guidelines
metadata_schema_version: "1.0"
artifact_version: "1.1.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: active
source_skill: 300-sg-docs
scope: app-design-system-authority
owner: "Diane"
confidence: high
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - app/src/ui/temu-shell/style.css
  - app/src/ui/temu-shell/components/MobileSettingsSheet.vue
  - app/src/styles.css
  - app/src/app-pages/
depends_on: []
supersedes: []
evidence:
  - "The implemented app shell centralizes tokens and shared visual primitives under app/src/ui/temu-shell/."
next_review: "2026-08-12"
next_step: "/503-sg-audit-design-tokens app"
---

# App Design System Authority

## Purpose

Keep new TemuGlowz app UI aligned with the shared Temu shell instead of adding page-local visual literals.

## Authority

- Token and component CSS: `app/src/ui/temu-shell/style.css`
- Reference component: `app/src/ui/temu-shell/components/MobileSettingsSheet.vue`
- Shared app styles: `app/src/styles.css`
- Theme carrier: `html.dark` and the Temu shell custom properties

## Rules

New or migrated app pages must consume shell tokens and shared primitives for colors, spacing, radii, shadows, motion, and density. The legacy stylesheet may remain for compatibility, but it is not the authority for new UI.

The Settings surface is the historical reference for compact cards, section labels, account controls, status pills, warm primary actions, restrained depth, dark mode, and mobile density. Migrated routes must extend shared `temu-shell` primitives instead of reviving legacy `.panel`, `.item-card`, `.notice`, or `.sync-onboarding-card` styling.

## Migration History

List detail, manual import, and synchronization were the first routes aligned with the Settings-derived authority. This records the design decision; current visual compliance still requires fresh code and screenshot verification.

## Validation

From `app/`, run `pnpm typecheck:full`, `pnpm lint:check`, and `pnpm build` for UI changes. Include mobile and desktop visual proof when the change materially alters layout or interaction.

## Maintenance Rule

Update this document when the canonical token carrier, reference component, theme mechanism, or migration boundary changes.
