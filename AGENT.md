---
artifact: agent_entrypoint
metadata_schema_version: "1.0"
artifact_version: "1.1.0"
project: "TemuGlowz"
created: "2026-07-12"
updated: "2026-07-12"
status: active
source_skill: 300-sg-docs
scope: repository-agent-contract
owner: "Diane"
confidence: high
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - CLAUDE.md
  - README.md
  - app/README.md
  - site/README.md
  - shipglowz_data/
depends_on: []
supersedes: []
evidence:
  - "The repository is organized as a thin pnpm root with app and site workspaces."
next_review: "2026-08-12"
next_step: "/103-sg-verify project governance"
---

# TemuGlowz agent router

## Read first

1. `CLAUDE.md` for monorepo execution and validation constraints.
2. `README.md` for workspace routing and root commands.
3. `app/README.md` before app, Tauri, Convex, or extension work.
4. `site/README.md` before Astro, public asset, guide data, or site-tool work.
5. The mapped document under root `shipglowz_data/` when governance access is in scope.

## Ownership

- `app/` owns Vue, Vite, Tauri, Convex, extension code, app assets, and app-local configuration.
- `site/` owns Astro pages/layouts/components, site-only Vue islands, guide data, public assets, and site tools.
- The root owns workspace orchestration, CI routing, process configuration, and repository entrypoints.
- Keep exactly one governance corpus at root; never create nested or legacy governance copies.

## Non-negotiables

- Do not claim Temu partnership, approval, live pricing, availability, testing, or automation without evidence.
- Keep app data local-first and do not store Temu cookies, credentials, or browser session exports.
- Do not make the app depend on files under `site/`, or the public site depend on app implementation files.
- Validate the affected workspace and run root orchestration checks for cross-workspace changes.
