---
artifact: technical_module_context
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-09"
updated: "2026-06-10"
status: draft
source_skill: sf-docs
scope: "code-docs-map"
owner: "Diane"
confidence: "medium"
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - shipflow_data/technical/README.md
  - shipflow_data/workflow/specs/temu-shopping-lists-android-app.md
depends_on: []
supersedes: []
evidence:
  - "Initial scaffold now exists for Vue/Vite/Tauri Android, local persistence, tests, and Android share-target contract."
  - "Spec-driven Android Temu import requirements in shipflow_data/workflow/specs/temu-shopping-lists-android-app.md."
next_review: "2026-07-09"
next_step: "/sf-docs technical audit"
---

# Code Docs Map

## Purpose

Map code areas to technical documentation and validation checkpoints for the Temu shopping-list Android MVP.

## Owned Files

- `shipflow_data/technical/code-docs-map.md`: route table for future code-change impact.
- `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md`: source behavior contract.
- `shipflow_data/technical/apps/temu-shopping-lists-android-app.md`: implemented app surface context.
- `shipflow_data/technical/platforms/android.md`: Android Tauri share-target context.
- `shipflow_data/technical/architecture.md` (optional): to be created once cloud sync and image-storage decisions are finalized.

## Entrypoints

- Read this map before any code implementation (`/sf-start`) and again before `/sf-verify`.
- Treat each path below as an entrypoint to the corresponding subsystem ownership and validation gate.
- For any touched path with no mapped primary doc, default to creating a subsystem technical module under `shipflow_data/technical/` before first merge.

## Path Coverage

| Path pattern | Subsystem | Primary doc | Validation | Docs trigger |
| --- | --- | --- | --- | --- |
| `src/` | Temu import flow + list UX + persisted local state | `shipflow_data/technical/apps/temu-shopping-lists-android-app.md` | `pnpm typecheck`, `pnpm test:once`, `pnpm lint:check`, `pnpm build` | `src` domain changes, list/item model changes, share-review UX, offline persistence logic |
| `src-tauri/**` | Android share target platform integration and Tauri commands | `shipflow_data/technical/platforms/android.md` | `pnpm tauri:build`, `pnpm tauri:android:build` where compatible | Native command/API additions, share intent contract, Android placeholder/Kotlin handoff |
| `src-tauri/src/lib.rs`, `src-tauri/src/main.rs`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/src/backup.rs` | Tauri runtime entrypoints and backup command profile | `shipflow_data/technical/apps/temu-shopping-lists-android-app.md` + `shipflow_data/technical/platforms/android.md` | `pnpm tauri:build`, `cargo check` where Linux prerequisites exist | Share payload command contract, Android manifest/config placeholder |
| `convex/**` | cloud sync model and mutation/query contracts | `shipflow_data/technical/apps/temu-shopping-lists-android-app.md` + future `shipflow_data/technical/architecture.md` | Convex checks when sync functions are added | schema changes, merge/update semantics, image persistence policy, auth expectations |
| `scripts/**` (when created) | utility scripts: backups, seeds, maintenance exports | `shipflow_data/technical/README.md` | `npm run test`/`npm run lint` in script owner package | serialization format, backup/export contract, redaction policy |
| `README.md`, `shipflow_data/**` | governance and onboarding | `shipflow_data/technical/README.md` | `python3 /home/claude/shipflow/tools/shipflow_metadata_lint.py shipflow_data/technical/README.md shipflow_data/technical/code-docs-map.md` | any governance or path-routing update |
| `AGENT.md` | local compatibility docs | `shipflow_data/technical/README.md` | Git metadata + linter contract checks | `AGENT.md` updates and compatibility rules |

### Current Coverage State

- `src/**`: implemented (Vue UI, store layer, parser/validator coverage, export serialization tests).
- `src-tauri/**`: implemented (Tauri command scaffold + Android manifest/config + Kotlin placeholder contract).
- `convex/**`: implemented (initial schema scaffold only).
- `scripts/**`: **non-coverage** (future utility layer; no scaffold yet).

## Documentation Update Plan

| code changed | subsystem | primary doc | secondary docs | action | priority | reason | owner role | parallel-safe | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/**` | Temu import + list UX + persistence | `shipflow_data/technical/apps/temu-shopping-lists-android-app.md` | `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md` | update | P0 | App surface exists and needs verification-aligned docs | executor | yes | update when UI/state behavior changes |
| `src-tauri/**` | Android share target + platform bridges | `shipflow_data/technical/platforms/android.md` | `shipflow_data/workflow/specs/temu-shopping-lists-android-app.md` | update | P0 | Sharesheet and intent behavior is security-critical user entrypoint | executor | no | plugin command/API changes should require explicit plan |
| `src-tauri/android/**` | Android share bridge contract placeholder | `shipflow_data/technical/platforms/android.md` | `src-tauri/src/lib.rs`, `src-tauri/android/AndroidManifest.share-intent.xml` | review | P0 | Keeps Android share surface deterministic until plugin wiring is implemented | executor | no | manifest/kotlin contract should be updated when native bridge is implemented |
| `convex/**` | Optional sync schema + functions | `shipflow_data/technical/README.md` (+ future `shipflow_data/technical/architecture.md`) | spec | review | P1 | Schema and merge semantics can affect local/remote safety | integrator | no | requires explicit decision on opt-in sync posture |
| `README.md`, `shipflow_data/**` | Governance and onboarding | `shipflow_data/technical/README.md` | relevant spec + trackers | review/update | P0 | Governance drift can block readiness gates | integrator | yes | metadata/lint must pass after each touched file |

## Validation

```bash
python3 /home/claude/shipflow/tools/shipflow_metadata_lint.py \
  shipflow_data/technical/README.md \
  shipflow_data/technical/code-docs-map.md
rg -n "Maintenance Rule|Validation|Owned Files|Entrypoints|Invariants|Reader Checklist" \
  shipflow_data/technical/code-docs-map.md
```

## Reader Checklist

- Load this map before any code-facing doc action in this chantier.
- If implementation has already started and one of the paths above exists, replace temporary owner doc references with a dedicated subsystem module doc.
- If a mapped code path changes, create an updated Documentation Update Plan row and verify it in `/sf-verify`.
- If no covered paths exist yet (clean-slate), set risk posture to `clean-slate not covered` and avoid claiming implementation status.

## Maintenance Rule

Update this map whenever a major path is added, removed, or materially changes behavior, validation owner, or security boundary.  
Mandatory when:

- a new subsystem is created under `src/`, `src-tauri/`, or `convex/`,
- Android share behavior, sync model, or persistence strategy changes,
- validation commands become actionable after scaffold creation,
- any governance file moves/renames or governance ownership changes.
