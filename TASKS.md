# Tasks - temu

> Operational task records follow `$SHIPFLOW_ROOT/skills/references/operational-record-format.md`.

---

## Audit Findings

🔴 [temu] task: Enforce version-aware cloud sync conflict and tombstone handling in live paths | status: todo | area: cloud-sync | id: TASK-2026-06-12-401-001 | next: wire runtime hydration/push paths through version-aware merge or reject stale server writes and deletes | notes: code audit found Convex writes and client hydration bypass the conservative merge contract already modeled in src/lib/syncMerge.ts
🟠 [temu] task: Replace Convex auth token localStorage persistence with a more secure app-owned session path | status: todo | area: auth | id: TASK-2026-06-12-401-002 | next: move JWT/refresh handling out of web localStorage and prove sign-in refresh/sign-out behavior again | notes: current client persists bearer and refresh tokens in localStorage, which is a weak storage boundary for a Tauri WebView app
