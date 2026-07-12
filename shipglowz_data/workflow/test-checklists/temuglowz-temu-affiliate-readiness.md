---
artifact: manual_test_checklist
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temuglowz"
created: "2026-07-12"
updated: "2026-07-12"
status: draft
source_skill: 102-sg-start
scope: "temu-affiliate-readiness"
owner: "Diane"
confidence: high
risk_level: high
security_impact: yes
docs_impact: yes
target_scope: "Public Astro guide and trust surfaces before Temu outreach"
stack_profile: "Astro static site + JSON guide data"
proof_profile: "automated static checks, local route smoke, browser and production proof pending"
linked_systems:
  - shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md
  - src/site/components/AffiliateGuideTemplate.astro
  - src/site/components/ProductCard.astro
depends_on: []
supersedes: []
evidence:
  - "2026-07-12 local test/typecheck/build and static contract scans."
next_step: "/103-sg-verify Temu affiliate readiness"
---

# Temu Affiliate Readiness — Test Checklist

| Scenario ID | Surface | Expected | Status | Evidence / limit |
|---|---|---|---|---|
| TC-READY-001 | Local static routes | Promoted routes resolve; guide index contains only complete guides | PASS | Astro build and local preview returned 200 for guides, terms and privacy |
| TC-READY-002 | Indexability | Draft computing guide is absent from sitemap/index and noindexed | PASS | static scan: sitemap/index zero mentions; built route has `noindex, nofollow` |
| TC-READY-003 | Disclosure | Clear disclosure appears before guide CTAs | PASS | built kitchen and summer guide HTML contains the disclosure block |
| TC-READY-004 | Claims | No unsupported positive testing/partnership/guarantee claims remain in promoted guide data | PASS | focused source scan; remaining negative statements explain what is not claimed |
| TC-READY-005 | Outbound CTA | Invalid/non-Temu URLs render no CTA; valid CTAs retain sponsored attributes | PASS | `affiliate.test.ts`; static build retains sponsored link attributes |
| TC-READY-006 | Static guide architecture | Guide cards are static, with metadata and structured data preserved | PASS | Astro build; no guide-card island marker in generated HTML |
| TC-READY-007 | Responsive/browser | Desktop/mobile visual, console and failed-request review | NOT_RUN | browser owner and target URL needed |
| TC-READY-008 | Keyboard/accessibility | Full keyboard/focus and accessible-name review | NOT_RUN | browser owner needed; skip link remains present in built HTML |
| TC-READY-009 | Production parity | Actual deployment matches reviewed build and intended sitemap/robots | NOT_RUN | production target unknown; route through `405-sg-prod` |
| TC-READY-010 | Final readiness dossier | Dated evidence and GO/NO-GO verdict | NOT_RUN | source evidence and production proof remain open |

## Automated Proof

- `pnpm test:once -- src/site/lib/affiliate.test.ts` — 104 tests passed.
- `pnpm typecheck` — passed.
- `pnpm build:site` — passed.
- `design_system_drift_check.py --changed --format markdown` — passed.

## Safety Notes

- No affiliate application, email, tracking identifier or partnership claim was created.
- Local proof does not substitute for the production/browser evidence required before outreach.
