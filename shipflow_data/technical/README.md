---
artifact: technical_governance
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
status: draft
project: "temu"
created: "2026-06-09"
updated: "2026-06-09"
source_skill: sf-docs
scope: "technical"
owner: "Diane"
confidence: "medium"
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - shipflow_data/technical/code-docs-map.md
depends_on: []
supersedes: []
evidence:
  - "Clean-slate Temu workspace contains only the ready spec and exploration artifact."
  - "/sf-docs technical bootstrap request for Governance Corpus Gate before implementation."
next_review: "2026-07-09"
next_step: "/sf-docs technical audit"
---

# Temu Technical Governance

## Purpose

This document is the canonical entrypoint for technical governance in the Temu workspace. It tracks how code-paths map to technical documentation before implementation so documentation and validation obligations stay aligned with `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md`.

## Owned Files

- `shipflow_data/technical/README.md`: repository-level technical governance index.
- `shipflow_data/technical/code-docs-map.md`: path-to-doc coverage and validation map.
- `shipflow_data/technical/architecture.md`: optional future architecture doc if subsystem topology decisions diverge from scaffold defaults.

## Entrypoints

- `/sf-docs technical`: creates or updates this technical governance layer before implementation.
- `shipflow_data/technical/code-docs-map.md`: must be loaded before any future code-facing documentation work.
- `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md`: spec source of truth for behavior and scope.

## Invariants

- Technical governance uses the monorepo root `shipflow_data/` (single canonical copy).
- No `/home/claude/temu` app source files are present yet; this is an intentional clean-slate bootstrap.
- Technical documentation must not claim features that are not yet implemented.
- Mapping changes affecting scope, validation, security, auth, or persistence must be tracked through `shipflow_data/technical/code-docs-map.md`.

## Validation

```bash
python3 /home/claude/shipflow/tools/shipflow_metadata_lint.py \
  shipflow_data/technical/README.md \
  shipflow_data/technical/code-docs-map.md
rg -n "Maintenance Rule|Validation|Owned Files|Entrypoints|Invariants|Reader Checklist" \
  shipflow_data/technical/README.md shipflow_data/technical/code-docs-map.md
```

## Reader Checklist

- If implementing a scaffolded surface, read `shipflow_data/technical/code-docs-map.md` first.
- If an implementation path changes the app contract (imports, auth, sync, storage, Android surface, or data schema), update the plan and docs before `/sf-verify`.
- If any new external provider behavior is introduced, evaluate whether `/home/claude/shipflow/shipflow_data/technical/platforms/<provider>.md` is needed.

## Maintenance Rule

Update this file when `shipflow_data` scope boundaries, major subsystem mapping, governance source files, or validation ownership changes.
