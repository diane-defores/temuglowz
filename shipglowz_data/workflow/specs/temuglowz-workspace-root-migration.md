---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.1.0"
project: "TemuGlowz"
created: "2026-07-12"
created_at: "2026-07-12 21:48:39 UTC"
updated: "2026-07-13"
updated_at: "2026-07-13 07:21:09 UTC"
status: reviewed
source_skill: 100-sg-spec
source_model: "GPT-5 Codex"
scope: "workspace root migration"
owner: "Diane"
confidence: high
user_story: "En tant qu'operatrice du depot TemuGlowz, je veux une racine mince et un workspace pnpm coherent separant app, site et gouvernance, afin que le developpement, la CI et la maintenance partent de chemins canoniques sans perdre les travaux existants."
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "app/"
  - "site/"
  - "shipglowz_data/"
  - "package.json"
  - "pnpm-workspace.yaml"
  - "pnpm-lock.yaml"
  - ".github/workflows/"
  - "AGENT.md"
  - "CLAUDE.md"
  - "README.md"
depends_on:
  - artifact: "shipglowz_data/technical/code-docs-map.md"
    artifact_version: "0.3.0"
    required_status: draft
  - artifact: "shipglowz_data/editorial/content-map.md"
    artifact_version: "1.0.0"
    required_status: reviewed
supersedes: []
evidence:
  - "The working tree contains tracked deletions from root source paths and untracked destinations under app/, site/, and shipglowz_data/."
  - "The user supplied the target topology and requested a final independent audit, repair, and full local verification without commit or push."
next_step: "/405-sg-prod puis /107-sg-test --retest BUG-2026-07-12-001"
---

# TemuGlowz Workspace Root Migration

## Title

TemuGlowz workspace root migration and final repair

## Status

Locally closed after implementation and verification on 2026-07-12. The canonical `app/`, `site/`, and `shipglowz_data/` workspace is in place with no active root source or `shipflow_data` / SocialGlowz / TubeFlow residue; install, typecheck, lint, 102 app tests, 2 site tests, both builds (including 9 site pages), ignore checks, and `git diff --check` passed. Commit and push remain pending under `005-sg-ship`.

`BUG-2026-06-11-001` remains an open pre-existing Android `high` / `fix-attempted` bug outside this structural migration scope. It is not closed by this chantier and requires a separate `/107-sg-test --retest BUG-2026-06-11-001` run.

## User Story

En tant qu'operatrice du depot TemuGlowz, je veux une racine mince et un workspace pnpm coherent separant app, site et gouvernance, afin que le developpement, la CI et la maintenance partent de chemins canoniques sans perdre les travaux existants.

Trigger: final verification of the in-progress root-to-workspace migration. Observable result: all useful tracked and untracked material has a canonical destination, root scripts and CI work from the monorepo root, and no legacy corpus or active source remains at obsolete root paths.

## Minimal Behavior Contract

Starting from the dirty migration worktree, preserve every useful existing change, place app code only under `app/`, site code only under `site/`, and governance only under root `shipglowz_data/`; root orchestration and CI must run successfully, while missing destinations, broken paths, legacy corpora, leaked local environment files, or generated Git pollution must produce a failing verification rather than silent data loss.

## Success Behavior

- Root contains the three canonical directories plus repository/workspace/router files and approved local tooling metadata.
- Every deletion representing useful project material has an equivalent or intentionally consolidated canonical destination.
- Root `pnpm` scripts install, typecheck, lint, test, and build app and site using workspace package names.
- CI, aliases, Tauri, Convex, Astro, tools, and documentation point at canonical paths.
- Git ignores generated outputs and local environment files; `.env.local` is untracked and undisclosed.

## Error Behavior

- If content has no destination, preserve or restore it under the correct canonical tree before proceeding.
- If a migration-caused check fails, repair only that cause and rerun the affected check.
- Never erase unrelated dirty work, rewrite project behavior, commit, push, deploy, or expose secrets.

## Problem

The repository is mid-migration: Git reports many source deletions and untracked destination files. A partial move can leave missing files, stale root paths, invalid workspace metadata, broken CI, duplicate legacy corpora, or ignored-output regressions.

## Solution

Audit tracked, modified, deleted, and untracked content; reconcile moves and consolidations; repair canonical paths and orchestration; regenerate the pnpm lockfile; then run root and package validations plus legacy, secret, and generated-output checks.

## Scope In

- Root-to-`app/`, root-to-`site/`, and legacy-to-`shipglowz_data/` migration completion.
- Root package/workspace/lockfile, CI, process config, ignore rules, and router documentation.
- Migration-caused source/config/test/build repairs.

## Scope Out

- Product feature changes, content redesign, dependency major upgrades, deployment, commit, and push.
- Reverting or discarding useful work produced by other agents.

## Constraints

- Use `apply_patch` for edits.
- Preserve the dirty worktree and all relevant concurrent-agent changes.
- No `shipflow_data`, no SocialGlowz/TubeFlow corpus, no active app/site source dispersed at root.
- Do not print `.env.local` values.

## Test Contract

- Surface: mixed pnpm monorepo (`app` Vue/Tauri/Convex/extension; `site` Astro).
- Proof profile: automated local checks plus Git/path/static hygiene review.
- Proof order: destination audit -> lockfile install -> `git diff --check` -> legacy/secret/output scans -> root typecheck -> lint -> tests -> builds.
- Required results: every command exits zero, or a clearly non-migration/environment limitation is reported as residual.
- Native Android compilation/device proof is an exception-with-proof: unchanged native behavior is outside this structural migration; CI paths and local web/type/test/build coverage are required.

## Dependencies

- Existing pnpm 8 workspace metadata and locally installed Node toolchain.
- Existing Vue, Tauri, Convex, Astro, TypeScript, ESLint, Vitest, and Rust/Android project files.
- Fresh external docs not needed: this work validates local path relocation and current checked-in scripts, not undocumented external API behavior.

## Invariants

- No useful content loss.
- Exactly one root governance corpus: `shipglowz_data/`.
- Existing application behavior and public claims remain unchanged unless a path-only repair is required.
- Secrets remain local and ignored.

## Links & Consequences

- Moving manifests changes dependency resolution, config roots, aliases, generated output locations, and CI caches.
- Moving docs changes router paths and governance ownership.
- Moving site source changes Astro route discovery and tool-relative data paths.
- All consumers must be revalidated from the repository root.

## Documentation Coherence

Review and repair `README.md`, `AGENT.md`, `CLAUDE.md`, package READMEs, `shipglowz_data/technical/code-docs-map.md`, and any touched canonical docs that still route to deleted or legacy paths.

## Edge Cases

- A deleted source is intentionally split or consolidated instead of byte-identically moved.
- Generated files already exist locally but must remain ignored.
- `.env.example` may be tracked while `.env.local` must not be.
- Historical specs may mention predecessor projects as provenance without constituting an active copied corpus; active source and router language must not depend on them.

## Implementation Tasks

- [x] Audit all Git states and map useful deletions to canonical destinations.
  - Files: repository-wide tracked and untracked files.
  - Action: compare tree, diffs, content, and expected path transforms; identify gaps before editing.
  - User story link: prevents data loss.
  - Depends on: none.
  - Validate with: `git status --short --untracked-files=all`, `git diff --stat`, destination comparison.
- [x] Repair workspace structure and active configuration.
  - Files: root/app/site manifests, configs, CI, source imports, ignore rules.
  - Action: correct migration-caused paths, aliases, scripts, and residual legacy source.
  - User story link: makes canonical workspace operable.
  - Depends on: destination audit.
  - Validate with: focused searches and package checks.
- [x] Repair governance and router documentation.
  - Files: root router docs and canonical `shipglowz_data/` maps/docs.
  - Action: remove obsolete locations and keep one canonical corpus.
  - User story link: enables reliable maintenance.
  - Depends on: final structure known.
  - Validate with: legacy/path searches and metadata lint for touched governance artifacts.
- [x] Regenerate dependency metadata and run full verification.
  - Files: `pnpm-lock.yaml` and ignored generated outputs only.
  - Action: install appropriately, run diff/hygiene checks, typecheck, lint, tests, and builds from root.
  - User story link: proves the migrated workspace is usable.
  - Depends on: repairs complete.
  - Validate with: exact commands in Execution Notes.

## Acceptance Criteria

- [x] Given the dirty migration, when every tracked deletion is reviewed, then each useful item has a canonical destination or a documented intentional consolidation.
- [x] Given the repository root, when `pnpm install --lockfile-only` or the appropriate install runs, then the workspace lockfile is coherent for `app` and `site`.
- [x] Given root orchestration, when typecheck, lint, tests, and builds run, then app and site scripts pass.
- [x] Given repository searches, when legacy corpus and obsolete active-root paths are scanned, then no prohibited active source/corpus remains.
- [x] Given local env and generated outputs, when Git tracking/ignore status is checked, then `.env.local` and outputs are ignored and untracked.
- [x] Given the final diff, when `git diff --check` runs, then it reports no whitespace errors.

## Test Strategy

Use Git and hash/path comparison for migration integrity, static `rg` searches for obsolete paths/corpora, `pnpm install --lockfile-only`, package/root scripts for TypeScript/ESLint/Vitest/build proof, and Git ignore/tracking checks for outputs and local env files.

## Risks

- High data-loss risk if untracked destinations are mistaken for disposable files.
- Medium CI risk from path and cache changes.
- Medium secret risk from local env files; mitigated by ignore/tracking checks without reading values.
- Low product-behavior risk because repairs are constrained to migration effects.

## Execution Notes

- Read first: root/package manifests, `.gitignore`, workflows, app/site configs, `shipglowz_data/technical/code-docs-map.md`, and router docs.
- Prefer content-preserving path corrections and do not normalize unrelated source.
- Commands: `pnpm install --lockfile-only`, `git diff --check`, legacy `rg` scans, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, plus focused package scripts when root aggregation obscures a failure.
- Stop if useful deleted content has no recoverable destination, a suspected secret is tracked, or a required repair would alter product scope.

## Open Questions

None.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
| --- | --- | --- | --- | --- | --- |
| 2026-07-12 21:48:39 UTC | 100-sg-spec | GPT-5 Codex | Formalized the user-supplied migration contract after initial tree and Git-state audit. | Draft spec created. | `/101-sg-ready shipglowz_data/workflow/specs/temuglowz-workspace-root-migration.md` |
| 2026-07-12 21:50:00 UTC | 101-sg-ready | GPT-5 Codex | Reviewed structure, user-story fit, linked systems, migration/secret risks, adversarial cases, and proof contract. | ready | `/102-sg-start shipglowz_data/workflow/specs/temuglowz-workspace-root-migration.md` |
| 2026-07-12 22:41:10 UTC | 102-sg-start | unknown | Completed the root-to-workspace migration with canonical app, site, and governance paths and no active root source. | implemented | `/103-sg-verify shipglowz_data/workflow/specs/temuglowz-workspace-root-migration.md` |
| 2026-07-12 22:41:10 UTC | 103-sg-verify | unknown | Verified install, typecheck, lint, 102 app tests, 2 site tests, app build, 9-page site build, residue scans, ignore state, and diff whitespace. | verified | `/104-sg-end shipglowz_data/workflow/specs/temuglowz-workspace-root-migration.md` |
| 2026-07-12 22:41:10 UTC | 104-sg-end | unknown | Synchronized the spec, task history, and changelog for local closure while preserving the separate open Android bug boundary. | closed | `/005-sg-ship shipglowz_data/workflow/specs/temuglowz-workspace-root-migration.md` |
| 2026-07-12 22:46:55 UTC | 005-sg-ship | unknown | full-close ship | shipped | `/405-sg-prod temuglowz` |
| 2026-07-12 23:29:59 UTC | 405-sg-prod | unknown | post-ship production verification | partial | Vercel production `https://temuglowz-site.vercel.app/` READY; deployment `main` SHA `8134e453e54f25757fe2e69fab60486d963fdefc` has `d7cb609a5a98fdcfd83276b9472a6ee451ed9d74` as its direct parent; Vercel build: 9 pages in 16s, no error or warning; HTTP 200 without redirect with `TemuGlowz` marker; Android CI success; GitHub `site-checks` failed because Node 20.19 is unsupported by Astro (requires >=22.12); Vercel preview check suite for SHA `d7cb609` queued without deployment. Next: `/106-sg-fix aligner site-checks sur Node >=22.12 puis revalider`. |
| 2026-07-12 23:47:41 UTC | 106-sg-fix | unknown | bounded CI runtime repair | fix-attempted | Updated `.github/workflows/site-checks.yml`, `.github/workflows/dev-builds.yml`, root `package.json`, and `site/package.json` from Node 20.19 to Node 22.12 / `>=22.12.0 <23`; local site typecheck, 2 tests, 9-page build, and diff hygiene passed. Bug dossier created; hosted CI retest remains pending push. Next: `/005-sg-ship` then `/405-sg-prod` then `/107-sg-test --retest BUG-2026-07-12-001`. |
| 2026-07-13 07:07:41 UTC | 001-sg-build | gpt-5.4-mini | Orchestrated bounded closure and ship preparation for the Node runtime repair; local proof is complete, hosted CI proof remains pending. | partial | `/104-sg-end` then `/005-sg-ship` |
| 2026-07-13 07:07:41 UTC | 104-sg-end | gpt-5.4-mini | Synchronized closure bookkeeping and retained partial status because hosted CI retest is not yet available. | deferred | `/005-sg-ship` |
| 2026-07-13 07:09:31 UTC | 005-sg-ship | gpt-5.4-mini | Shipped the bounded Node runtime repair and closure bookkeeping on `preview` as commit `d024877`; checks passed and push succeeded. | shipped | `/405-sg-prod` then `/107-sg-test --retest BUG-2026-07-12-001` |
| 2026-07-13 07:13:38 UTC | 405-sg-prod | gpt-5 | Verified Vercel preview for HEAD `3036de9` (`READY`, exact preview build, Astro 9 pages, Node 22.x) and production `https://temuglowz-site.vercel.app/` (`READY`, SHA `8134e45`, HTTP 200, no redirect, public TemuGlowz markers); GitHub site and Android checks for `d024877` are green; static runtime logs returned no events/errors. | implemented | `/107-sg-test --retest BUG-2026-07-12-001` |
| 2026-07-13 07:15:00 UTC | 405-sg-prod | gpt-5 | Retested the pushed repair at `d0248771a3e14965be69691e75aa5cf4c474b8e8`: Vercel preview `https://temuglowz-site-nss2jg757-diane-ds-projects.vercel.app/` is READY with Astro and Node 24.x runtime; production `https://temuglowz-site.vercel.app/` returns HTTP 200 with zero redirects and public `TemuGlowz` content; GitHub Site Checks run `29231129575` and Android run `29231129638` are successful. | success | `/103-sg-verify` then `/104-sg-end`; final closure intentionally remains pending |
| 2026-07-13 07:18:53 UTC | 103-sg-verify | GPT-5 | Verified the Node 22.12 repair against the user story and closure criteria. | verified: local typecheck/lint/tests pass; GitHub Site Checks and Android checks pass on exact SHA `d0248771a3e14965be69691e75aa5cf4c474b8e8`; Vercel preview is READY; production is HTTP 200 with zero redirects and `TemuGlowz` marker. | verified | `/104-sg-end` |
| 2026-07-13 07:21:09 UTC | 104-sg-end | GPT-5 | Closed the Node runtime repair and the workspace-migration chantier after the current 103 verification gate. | closed: implementation, local checks, hosted CI retest, Vercel preview, production HTTP/content proof, bug record, tracker, and changelog framing are synchronized. | closed | `/005-sg-ship` |

## Current Chantier Flow

- `100-sg-spec`: complete
- `101-sg-ready`: ready
- `102-sg-start`: implemented
- `103-sg-verify`: verified; the Node runtime repair satisfies the current proof contract and the earlier migration verification remains preserved above
- `104-sg-end`: closed; current 103 verification and all closure criteria are explicit
- `005-sg-ship`: pending documentary closure push
- Post-ship verification (`405-sg-prod`): complete; exact preview deployment for HEAD `3036de9` is READY and built successfully with Node 22.x, production is READY/live on `8134e45`, public HTTP/content checks pass, and static runtime logs show no events/errors.
- `106-sg-fix`: closed; CI runtime and package engine constraints are aligned on Node 22.12, local site proof passes, and hosted `405-sg-prod` evidence is successful. `103-sg-verify` and `104-sg-end` are complete.
- Remaining out of scope: `BUG-2026-06-11-001` stays open (`high`, `fix-attempted`) pending separate Android retest.
- Next: `/005-sg-ship` for the bounded documentary closure push; no `107-sg-test` run is claimed because it was not required by the verified proof contract.
