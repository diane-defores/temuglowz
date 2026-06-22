---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-21"
created_at: "2026-06-21 00:00:00 UTC"
updated: "2026-06-22"
updated_at: "2026-06-22 05:05:00 UTC"
status: implemented
source_skill: 602-sf-platform-parity
source_model: "GPT-5 Codex"
scope: "web parity for Temu shopping sessions via mandatory browser extension overlay"
owner: "unknown"
confidence: medium
user_story: "En tant qu'utilisatrice de Temu Shopping Lists sur le web, je veux installer une extension navigateur obligatoire qui affiche un widget overlay sur Temu avec mes listes et des boutons d'ajout rapides, afin d'obtenir une expérience proche de la version mobile sans dépendre d'un iframe ou d'une webview."
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - "src/lib/temuWebview.ts"
  - "src/lib/extensionBridge.ts"
  - "src/ui/temu-shell/components/ExtensionOverlay.vue"
  - "src/ui/temu-shell/App.vue"
  - "extension/manifest.json"
  - "extension/content/overlay.js"
  - "shipflow_data/workflow/specs/temu-shopping-webview-sessions.md"
  - "shipflow_data/workflow/specs/temu-canonical-page-design-system-alignment.md"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-shopping-webview-sessions.md"
    artifact_version: "1.0.0"
    required_status: "implemented"
  - artifact: "shipflow_data/workflow/specs/temu-canonical-page-design-system-alignment.md"
    artifact_version: "1.1.0"
    required_status: "ready"
supersedes: []
evidence:
  - "Current codebase already treats native WebView as the primary in-app Temu surface and exposes capture/sync bridge behavior through src/lib/temuWebview.ts."
  - "src/ui/temu-shell/components/NetworkWebviewHost.vue currently degrades to a placeholder outside Tauri, which confirms the web product path needs a separate browser-native contract."
  - "Temu browsing inside an iframe is not a reliable foundation because cross-origin embedding and page policy may block the experience or reduce control."
  - "The user explicitly requested an installed extension plus overlay widget that can show shopping lists and quick-add actions on top of the Temu page."
next_step: "/104-sf-end shipflow_data/workflow/specs/temu-web-platform-parity-extension-overlay.md"
---

# Title

Temu Web Platform Parity with Mandatory Extension Overlay

## Status

Implemented locally. This spec defines the web-platform contract for Temu Shopping Lists when no native webview exists. The web experience uses a browser extension plus app surface arrangement that restores the highest practical parity with the mobile flow.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-21 | 602-sf-platform-parity | GPT-5 Codex | spec drafted | Web parity chantier defined with mandatory extension overlay and explicit iframe rejection | /101-sf-ready shipflow_data/workflow/specs/temu-web-platform-parity-extension-overlay.md |
| 2026-06-21 | 101-sf-ready | GPT-5 Codex | readiness review | Added Edge Cases, Implementation Tasks, Acceptance Criteria, Test Strategy, Risks; dependencies verified complete; spec ready for build | /102-sf-start shipflow_data/workflow/specs/temu-web-platform-parity-extension-overlay.md |
| 2026-06-22 | 102-sf-start | GPT-5 Codex | implementation | Created extensionBridge.ts, ExtensionOverlay.vue, manifest.json, overlay.js, extensionBridge.test.ts; integrated into App.vue; added degraded message to ManualImportPage.vue | /103-sf-verify shipflow_data/workflow/specs/temu-web-platform-parity-extension-overlay.md |
| 2026-06-22 | 103-sf-verify | GPT-5 Codex | verification | Local validation passed: typecheck partial (pre-existing vite.config.ts issues), lint partial (pre-existing ecosystem.config.cjs issue), tests 98 passed, build succeeded; browser extension proof and manual QA remain blocked | /104-sf-end shipflow_data/workflow/specs/temu-web-platform-parity-extension-overlay.md |
| 2026-06-22 | 104-sf-end | GPT-5 Codex | closure | Local work complete; browser extension proof blocked by aarch64 host NDK mismatch; spec status remains implemented pending CI/validation | /005-sf-ship shipflow_data/workflow/specs/temu-web-platform-parity-extension-overlay.md |

## Current Chantier Flow

Flux: 100-sf-spec ✅ -> 101-sf-ready ✅ -> 102-sf-start ✅ -> 103-sf-verify ⚠️ -> 104-sf-end ✅ -> 005-sf-ship ⏳