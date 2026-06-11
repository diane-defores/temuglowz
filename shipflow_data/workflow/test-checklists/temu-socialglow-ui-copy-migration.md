---
artifact: manual_test_checklist
metadata_schema_version: "1.0"
artifact_version: "0.1.0"
project: "temu"
created: "2026-06-10"
updated: "2026-06-11"
status: draft
source_skill: sf-docs
scope: "temu-socialglow-ui-copy-migration"
owner: "Diane"
confidence: medium
risk_level: high
security_impact: yes
docs_impact: yes
target_scope: "SocialGlow-derived Temu shopping-session shell on Android"
stack_profile: "Vue 3 + Tauri 2 Android + Kotlin WebView plugin + Pinia persisted state"
proof_profile: "automated Vue/store/bridge checks, Blacksmith debug APK build, and Android real-device smoke"
linked_systems:
  - "shipflow_data/workflow/specs/temu-socialglow-ui-copy-migration.md"
  - "src/ui/temu-shell/"
  - "src/stores/shoppingSessions.ts"
  - "src/lib/temuWebview.ts"
  - "src-tauri/plugins/android-temu-webview"
depends_on:
  - artifact: "shipflow_data/workflow/specs/temu-socialglow-ui-copy-migration.md"
    artifact_version: "1.0.1"
    required_status: "implemented"
supersedes: []
evidence:
  - "Implemented spec requires a manual Android checklist for TC-UI-COPY-001 through TC-UI-COPY-010 before the migration can be verified on device."
  - "User decision 2026-06-10: migration is copy-first from SocialGlow/Social News, profiles are hidden in v1, and Codex Spark is not used."
next_step: "/sf-verify Temu SocialGlow UI copy migration"
---

# Temu SocialGlow UI Copy Migration - Test Checklist

This checklist tracks Android proof for the SocialGlow-derived UI migration. It remains `NOT_RUN` until a new debug APK is available and the scenarios are run on a real Android device.

| Scenario ID | Surface | Scenario | Required | Expected | Status | Observed | Evidence pointer | Notes | Bug Link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-UI-COPY-001 | App launch | First launch opens the SocialGlow-derived shopping dashboard | yes | The first screen is a polished shopping-session launcher based on the copied shell, not the old rough dashboard | NOT_RUN | Local source integration complete; Android APK/device proof pending | Android screenshot/video; route smoke note | Do not mark pass until the mounted app shell is verified on device |  |
| TC-UI-COPY-002 | Profiles hidden | No visible profiles appear on dashboard, settings, onboarding, or bottom-bar menu | yes | No profile entry, profile switcher, profile sheet, onboarding profile step, or native profile menu item is visible | NOT_RUN | Local grep passed; Android visual proof pending | Android screenshots; grep/manual note | Internal default profile code is acceptable only if non-visible |  |
| TC-UI-COPY-003 | Sessions | Create and rename sessions `Cuisine` and `Voiture` | yes | Both sessions are created, renamed, persisted, and shown as shopping sessions | NOT_RUN | Store and bridge tests pass; Android creation/rename proof pending | Android/manual QA note; store test output | Session labels replace social-network labels in user-facing UI |  |
| TC-UI-COPY-004 | Native bottom bar | Open both sessions and switch between them from the native bottom bar | yes | Bottom-bar switcher shows `Cuisine` and `Voiture`; switching keeps browsing/capture state usable | NOT_RUN | Kotlin compile passed; Android interaction proof pending | Android video/manual QA note | Record any device WebView isolation limitation if present |  |
| TC-UI-COPY-005 | Native quick menu | Bottom-bar quick menu toggles dark mode | yes | Dark mode control is available and the shell/bottom bar remain usable after toggling | NOT_RUN | Kotlin compile passed; Android interaction proof pending | Android screenshot/manual QA note | Must not expose profile controls |  |
| TC-UI-COPY-006 | Native quick menu | Bottom-bar quick menu changes text size | yes | Text-size control changes WebView readability without crash or layout breakage | NOT_RUN | Kotlin compile passed; Android interaction proof pending | Android screenshot/manual QA note | Verify at least smaller/default/larger states if available |  |
| TC-UI-COPY-007 | Capture/import | Capture current Temu product into import review and save to a list | yes | Captured product opens import review, saves to a chosen list, and remains visible after returning home | NOT_RUN | Bridge tests pass; Android Temu capture proof pending | Android manual QA note; list screenshot | Do not capture account, address, checkout, or payment data in evidence |  |
| TC-UI-COPY-008 | Existing app routes | Existing list, manual import, share import, and sync pages remain reachable from the copied shell | yes | User can reach list/detail/manual import/import review/sync surfaces without breaking session dashboard navigation | NOT_RUN | Web build and route integration pass; Android route proof pending | Android/browser route smoke note | These routes must not imply active cloud sync beyond current fail-closed status |  |
| TC-UI-COPY-009 | User-facing copy | No user-facing SocialGlow social-network copy remains | yes | Visible copy uses shopping/session language and independent Temu Shopping Lists wording | NOT_RUN | Focused grep passed for copied shell; Android screenshot review pending | Screenshot review; focused text grep | SocialGlow may remain as source attribution in implementation reports, not product UI |  |
| TC-UI-COPY-010 | Naming policy | No route/component introduced for this migration contains `legacy` | yes | New migration routes/components use direct Temu shell/session naming and avoid compatibility-wrapper naming | NOT_RUN | `rg -n "legacy" src src-tauri` returned no hits | `rg -n "legacy" src src-tauri` after integration | This is the spec prohibition; existing unrelated hits must be triaged separately |  |

## Preconditions

- The SocialGlow-derived Vue shell and Android bottom-bar menu changes have been merged.
- Local checks for the migration have passed: `pnpm typecheck`, `pnpm lint:check`, `pnpm test:once`, and `pnpm build`.
- A GitHub Actions Blacksmith debug APK build is available for the commit under test.
- Android real-device proof is available unless the implementation report records an approved exception.

## Safety Notes

- Temu Shopping Lists is an independent user tool and must not claim partnership, certification, or authorization by Temu.
- Do not record Temu cookies, passwords, account pages, addresses, checkout content, order history, or payment details in evidence.
- WebView session cookies, account state, and browser storage stay local and must not sync to cloud.
- The v1 product hides profile management. If copied profile code remains internally, it must not be reachable from visible UI.
- Do not use Codex Spark for this migration; the ready spec assigns GPT-5.5 medium/high implementation workers.
