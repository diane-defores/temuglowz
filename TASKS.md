# Tasks - temu

> Operational task records follow `$SHIPFLOW_ROOT/skills/references/operational-record-format.md`.

---

## Audit Findings

🔴 [temu] task: Enforce version-aware cloud sync conflict and tombstone handling in live paths | status: todo | area: cloud-sync | id: TASK-2026-06-12-401-001 | next: wire runtime hydration/push paths through version-aware merge or reject stale server writes and deletes | notes: code audit found Convex writes and client hydration bypass the conservative merge contract already modeled in src/lib/syncMerge.ts
🟠 [temu] task: Replace Convex auth token localStorage persistence with a more secure app-owned session path | status: todo | area: auth | id: TASK-2026-06-12-401-002 | next: move JWT/refresh handling out of web localStorage and prove sign-in refresh/sign-out behavior again | notes: current client persists bearer and refresh tokens in localStorage, which is a weak storage boundary for a Tauri WebView app
🟢 [temu] task: Browser extension overlay for web parity | status: done | area: web-extension | id: TASK-2026-06-22-602-001 | next: none | notes: created extensionBridge.ts, ExtensionOverlay.vue, manifest.json, overlay.js, extensionBridge.test.ts; integrated into App.vue; pending browser proof blocked by NDK host mismatch
🟠 [temu] task: Paginate cloud sync pulls and return a continuation cursor | status: todo | area: performance | id: TASK-2026-06-25-403-001 | next: spec or implement paginated hydration contract after backend/client sync API decision | notes: perf audit capped Convex sync reads at 500 records to prevent unbounded pulls, but full correctness for large accounts needs cursor pagination and client replay loops
🟡 [temu] task: Reduce static site hydration and asset weight | status: todo | area: performance | id: TASK-2026-06-25-403-002 | next: convert guide ProductCard islands to static Astro markup where no client interactivity is needed and replace oversized PNG portraits with responsive WebP/AVIF assets | notes: perf audit found guide pages hydrate every product card, load Lenis on all non-reduced-motion visits, and ship duplicate 736KB-1.6MB PNG portraits in public and site/public
