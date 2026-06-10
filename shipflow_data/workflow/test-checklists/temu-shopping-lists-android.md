# Temu Shopping Lists Android - Test Checklist

| Scenario ID | Surface | Scenario | Required | Expected | Status | Observed | Evidence pointer | Notes | Bug Link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-AUTO-001 | TypeScript | Typecheck | yes | `pnpm typecheck` exits 0 | PASS | Passed on 2026-06-10 | command-output-local | Static TS check passed |  |
| TC-AUTO-002 | URL parser | Temu URL normalization and unsafe URL rejection | yes | Valid Temu links accepted; unsafe links rejected | PASS | Covered by test suite | src/utils/url.test.ts | Included in `pnpm test:once` |  |
| TC-AUTO-003 | Import parser | Shared text parser extracts Temu URL/title | yes | Temu URL/title extracted; non-Temu returns null | PASS | Covered by test suite | src/lib/importParser.test.ts | Included in `pnpm test:once` |  |
| TC-AUTO-004 | Snapshot validation | Validators and duplicate detection | yes | Invalid fields rejected; duplicates detected | PASS | Covered by test suite | src/lib/validators.test.ts | Included in `pnpm test:once` |  |
| TC-AUTO-005 | Local persistence | Store CRUD and backup roundtrip | yes | List CRUD, duplicate merge, snapshot retention, backup serialization pass | PASS | Covered by test suite | src/stores/localPersistence.test.ts | Included in `pnpm test:once` |  |
| TC-AUTO-006 | Convex | Optional schema check | no | Convex schema parses in Convex-enabled setup | NOT_RUN | Optional sync scaffold only | convex/schema.ts | No Convex functions or sync runtime implemented yet |  |
| TC-MANUAL-001 | Android device | Sharesheet target appears for Temu product text share | yes | App appears as Android destination | NOT_RUN | Not executed | shipflow_data/technical/platforms/android.md | Requires compatible Android build/device |  |
| TC-MANUAL-002 | Android device | Shared payload opens import review | yes | Import review opens with parsed Temu URL and editable title fallback | NOT_RUN | Not executed | shipflow_data/technical/platforms/android.md | Native runtime share payload bridge not proven |  |
| TC-MANUAL-003 | Browser UI | Manual URL paste import | yes | Draft created and import-review opens | PASS | Playwright proved manual URL to review flow | playwright-local | Browser proof, not Android device proof |  |
| TC-MANUAL-004 | Persistence | Save product in Cuisine, restart/offline reopen | yes | Product remains readable with title/url | NOT_RUN | Browser reload proved persistence, Android airplane-mode not executed | playwright-local | Required Android offline proof still pending |  |
| TC-MANUAL-005 | Image failure | Image absent is acceptable | yes | Item saves with missing-image state | NOT_RUN | Not executed | shipflow_data/workflow/specs/temu-shopping-lists-android-app.md | UI/state proof pending |  |
| TC-MANUAL-006 | Invalid URL | Unsafe/non-Temu URL rejected | yes | No product saved; recoverable error | PASS | Automated URL tests cover unsafe protocols and non-Temu hosts | src/utils/url.test.ts | Android share version still pending |  |
| TC-MANUAL-007 | Duplicate import | Import same Temu URL twice into same list | yes | User can update/add quantity/cancel | NOT_RUN | Store duplicate merge tested; Android/UI duplicate decision not executed | src/stores/localPersistence.test.ts | Required UX proof pending |  |

## Notes

- This MVP does not implement cart import; this is an explicitly deferred spike.
- The app must not collect cookies/session state and does not include anti-fingerprint WebView code.
- Android runtime proof is blocked in this workspace by the detected Android NDK host mismatch: `linux-x86_64` clang cannot execute on the current `aarch64` host.

