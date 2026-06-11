---
artifact: technical_guidelines
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-11"
updated: "2026-06-11"
status: active
source_skill: 001-sf-build
scope: "design-system-authority"
owner: "Diane"
confidence: high
risk_level: medium
security_impact: none
docs_impact: yes
linked_systems:
  - "src/ui/temu-shell/style.css"
  - "src/ui/temu-shell/components/MobileSettingsSheet.vue"
  - "src/styles.css"
  - "src/pages/"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-socialglow-ui-copy-migration.md"
    artifact_version: "1.0.2"
    required_status: ready
supersedes: []
evidence:
  - "503-sf-audit-design-tokens found that Settings/temu-shell is the de facto canonical UI while legacy pages still use src/styles.css hardcoded visual values."
  - "User decision 2026-06-11: the Settings page design, inspired by SocialGlow, is canonical for the app."
next_review: "2026-06-25"
next_step: "/103-sf-verify design-system authority after page migration"
---

# Design System Authority

## Canonical Source

The canonical Temu app design system is the SocialGlow-derived `temu-shell` layer:

- Token and component CSS source: `src/ui/temu-shell/style.css`
- Canonical component reference: `src/ui/temu-shell/components/MobileSettingsSheet.vue`
- Canonical interaction shape: compact settings cards, section labels, pill actions, tokenized surfaces, warm primary action color, restrained SocialGlow-style depth, and dark-mode support through `html.dark`.

## Required Consumption Rule

New or migrated user-facing pages must consume the `temu-shell` CSS custom properties and shared shell/page primitives instead of introducing local hardcoded colors, spacing, radii, shadows, motion, or one-off layout constants.

Allowed raw literals are limited to semantic constants already established inside the central shell style layer, platform/API-required values, or file-local values that are promoted into named reusable classes in the central style source during the same change.

## Legacy Layer

`src/styles.css` currently contains legacy scaffold styles such as `.panel`, `.item-card`, `.notice`, `.sync-onboarding-card`, global blue buttons, and app notification styles. It may remain as a compatibility layer until each route is migrated, but it is not the authority for new product page design.

## Migration Priority

1. Shopping list detail.
2. Manual import.
3. Synchronization.
4. Import review and product detail follow-up if the same legacy drift remains visible after the first migration.

## Verification

Design-system work must run:

```bash
python3 /home/claude/shipflow/tools/design_system_drift_check.py --changed --format markdown
pnpm typecheck:full
pnpm lint:check
pnpm build
```

Visual proof should include desktop and mobile screenshots for the migrated routes.
