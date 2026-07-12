---
artifact: agent_entrypoint
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
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
  - shipglowz_data/
depends_on: []
supersedes: []
evidence:
  - "Created as the canonical repository routing entrypoint required by ShipGlowz governance."
next_review: "2026-08-12"
next_step: "/103-sg-verify project governance"
---

# TemuGlowz Agent Contract

## Read first

1. `CLAUDE.md` for execution and validation constraints.
2. `README.md` for the public project overview.
3. `shipglowz_data/technical/code-docs-map.md` before code changes.
4. `shipglowz_data/editorial/content-map.md` before public-copy or content changes.
5. The mapped primary document before changing a subsystem.

## Canonical ownership

- Durable governance lives under `shipglowz_data/`.
- `shipglowz_data/business/` owns business, product, brand, and GTM truth.
- `shipglowz_data/technical/` owns implementation and platform contracts.
- `shipglowz_data/editorial/` owns public surfaces, claims, page intent, and editorial follow-up.
- `shipglowz_data/workflow/` owns specs, audits, checklists, evidence, and execution tasks.
- Root legacy docs such as `BUSINESS.md`, `TASKS.md`, and `AUDIT_LOG.md` are migration sources, not new sources of truth.

## Non-negotiables

- Do not claim Temu partnership, approval, live pricing, availability, testing, or automation without evidence.
- Keep app data local-first and do not store Temu cookies, credentials, or browser session exports.
- Preserve runtime content schemas; governance frontmatter belongs only on governance artifacts.
- Any code or public-claim change requires documentation alignment or an explicit no-impact record.

## Validation

Run the focused checks named by the mapped technical/editorial contract, plus metadata lint on changed governance artifacts. Native Android proof is CI-first in this workspace.

## Maintenance Rule

Update this contract when canonical ownership, entrypoint order, security boundaries, or authoritative validation changes.
