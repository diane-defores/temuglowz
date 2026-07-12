---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temuglowz"
created: "2026-07-12"
created_at: "2026-07-12 15:21:07 UTC"
updated: "2026-07-12"
updated_at: "2026-07-12 15:39:37 UTC"
status: ready
source_skill: 100-sg-spec
source_model: "GPT-5 Codex"
scope: "public-site and affiliate-partnership readiness before Temu outreach"
owner: "Diane"
confidence: high
user_story: "En tant que porteuse de TemuGlowz, je veux présenter à Temu un site public crédible, honnête et techniquement solide, afin de demander une affiliation sans promesse trompeuse ni faiblesse évidente dans l'expérience visiteur."
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "site/src/pages/**"
  - "site/src/components/**"
  - "site/src/content/**"
  - "site/src/pages/terms.astro"
  - "site/src/pages/privacy.astro"
  - "site/public/sitemap.xml"
  - "site/public/llms.txt"
  - "shipglowz_data/workflow/TASKS.md"
  - "shipglowz_data/workflow/specs/temu-affiliate-guide-template-upgrade.md"
depends_on:
  - artifact: "shipglowz_data/business/business.md"
    artifact_version: "0.2.0"
    required_status: draft
  - artifact: "shipglowz_data/technical/site/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: active
  - artifact: "Temu Affiliate Program"
    artifact_version: "accessed 2026-07-12"
    required_status: reviewed
  - artifact: "FTC Endorsement Guides: What People Are Asking"
    artifact_version: "accessed 2026-07-12"
    required_status: reviewed
  - artifact: "Google Search Central: Reviews system"
    artifact_version: "accessed 2026-07-12"
    required_status: reviewed
supersedes: []
evidence:
  - "The canonical task tracker records unresolved public-site SEO, link-integrity, image, and browser-verification work."
  - "The existing affiliate-guide-template spec is not ready and is narrower than overall partnership readiness."
  - "The currently indexed /guides/gadgets-informatique route renders an empty-product placeholder."
  - "ProductCard renders any supplied productUrl without a scheme/host allowlist."
  - "Temu's official affiliate page asks applicants to provide the channel links used for promotion."
next_step: "/103-sg-verify shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md"
---

# Spec: TemuGlowz — Readiness Before Temu Affiliate Outreach

🟠 [temuglowz] spec: Temu affiliate readiness | status: ready | path: shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md | next: /103-sg-verify Temu affiliate readiness

## Title

TemuGlowz — Readiness Before Temu Affiliate Outreach

## Status

Ready for execution. This is an umbrella readiness chantier: it does not authorize an affiliate application, an email, publication of a partnership claim, or use of affiliate tracking links. It first establishes a measurable public-site quality bar and routes each finding to its owner.

## User Story

En tant que porteuse de TemuGlowz, je veux présenter à Temu un site public crédible, honnête et techniquement solide, afin de demander une affiliation sans promesse trompeuse ni faiblesse évidente dans l'expérience visiteur.

Primary actors: a French-speaking guide reader, a Temu affiliate-program reviewer, and the operator maintaining the public site.

Trigger: the operator wants to contact Temu about becoming an affiliate.

Observable result: a dated readiness dossier exists; every public page promoted to Temu is useful, reachable, safe, evidence-backed, and verified. Only then is a concise outreach draft prepared for operator approval.

## Minimal Behavior Contract

Before any outreach, the public TemuGlowz site is audited against trust, disclosure, technical quality, performance, accessibility, SEO and product-link safety. Each blocking finding is either fixed and proven or explicitly keeps the readiness verdict at NO-GO; the easy-to-miss case is a polished page that still makes an unsupported product claim, indexes thin content, or lets an unsafe/non-Temu outbound URL become a CTA.

## Success Behavior

- Given a public guide is discoverable, when a reader opens it, then it offers substantive, evidence-safe help rather than a placeholder, broken route, or implied personal test.
- Given a product recommendation has a commercial relationship, when the reader reaches a recommendation and CTA, then a clear, understandable disclosure is visible close enough to inform the decision.
- Given a guide outputs a product CTA, when its URL is missing, malformed, non-HTTPS, or not an approved Temu host, then no CTA is rendered.
- Given a Temu reviewer receives the proposed site URL, when they browse its public routes, then core paths work, legal/trust context is coherent, and no page implies an existing Temu partnership.
- Given all readiness gates have evidence, when the operator asks for outreach, then the dossier contains a truthful, non-binding contact draft and the exact channel URL(s) to present for review.

## Error Behavior

- A failing audit, missing proof, thin indexable guide, broken internal link, unresolved security risk, or unsupported claim produces NO-GO; outreach is not drafted as ready-to-send.
- If a Temu rule, applicable local disclosure rule, or partner term cannot be verified from a current primary source, mark the item as a research gap rather than assuming compliance.
- If a live page differs from the reviewed build or its canonical public URL is unknown, stop before outreach and route to browser/deployment proof.
- If the program rejects or does not support the project surface, preserve independent, non-affiliation wording and do not alter product behavior to evade platform rules.

## Problem

The repository has strong intent but does not yet support an excellence claim for the public affiliate surface. The canonical tracker already identifies thin/indexed guide content, route-integrity risk, unverified browser/build proof, image work, and a degraded sourcing path. The existing guide-template chantier is useful but remains not ready and cannot by itself establish global readiness. The business context also claims independent tests while the existing guide spec states that hands-on proof is unavailable.

## Solution

Run a staged, evidence-first readiness program focused on the public Astro site. Fix high-impact gaps through the appropriate owner skills, verify the deployed/public surface, then assemble a short factual contact draft for explicit operator approval. The product app's independent security/debt work remains visible but is not silently folded into this public-site GO/NO-GO unless it affects claims made to Temu.

## Scope In

- A baseline audit matrix: public routes, technical checks, SEO/indexability, performance/CWV, accessibility/design, claims/disclosure, link safety, privacy/terms consistency, and affiliate-program fit.
- Resolution or explicit blocking of all public-site P0/P1 findings before outreach.
- The existing `temu-affiliate-guide-template-upgrade` chantier, including shared template, conservative claims, disclosure, methodology and CTA safety, as a dependent workstream.
- Correction of the empty `/guides/gadgets-informatique` indexing problem and public route/link integrity.
- A source-of-truth review for the business proposition so it does not promise independent tests that the site cannot prove.
- A read-only, dated readiness dossier plus an outreach draft after GO; the draft describes the actual public channel and does not claim approval, sales, followers, traffic, product testing, or partnership status that cannot be substantiated.

## Scope Out

- Submitting an affiliate application, emailing Temu, accepting terms, creating an affiliate account, or inserting affiliate identifiers.
- Claiming legal compliance in every jurisdiction; jurisdiction-specific review remains a professional/legal decision if required for the chosen market.
- Solving unrelated app cloud-sync, entitlement, or Android proof debt, unless it is mentioned publicly in the outreach or on a promoted page.
- Scraping Temu, extracting credentials/cookies, or automating an authenticated Temu session.
- Manufacturing reviews, ratings, testimonials, traffic, social followers, product tests, or partnership evidence.

## Constraints

- TemuGlowz remains independent and must not imply Temu authorization before written approval.
- Public product language may describe curation, observed criteria and limitations; it must not say tested, approved, guaranteed, live-priced, or endorsed without evidence.
- Product content is static/public and must remain crawlable without unnecessary client hydration.
- Affiliate CTAs retain `target="_blank"` and `rel="noopener noreferrer sponsored"`; safety validation must reject unsafe schemes and non-approved hosts.
- The public site has no confirmed production URL in `CLAUDE.md`; no GO verdict may use local build proof as a substitute for live-route proof.
- UI changes must use the declared design-system authority and drift check.
- Fresh-docs checked: Temu's current affiliate page states applicants provide the promotion channel link(s); FTC guidance calls for clear, conspicuous disclosure near affiliate recommendations; Google's reviews guidance rewards original, insightful analysis rather than thin summaries.

## Test Contract

Surface: public Astro guide and trust pages, plus their static assets and metadata.

proof_profile: audit-driven, automated build/static checks, browser proof, and a final independent readiness review.

proof_order: audit baseline -> remediation -> automated build/type/lint/static checks -> visual/accessibility/browser proof -> production/public-route proof -> GO/NO-GO review.

required_scenario_ids: `TC-READY-001` through `TC-READY-010`.

Required proof:

- `pnpm build:site`, `pnpm typecheck`, `pnpm lint:check`, and applicable unit tests pass.
- `design_system_drift_check.py --changed --format markdown` passes for UI changes.
- Static checks prove no unsafe CTA, no new unverified claim vocabulary, correct canonical/meta/robots output, and no unintended hydration in guide cards.
- A browser owner proves every promoted public route, disclosure placement, links, mobile layout, keyboard/focus basics, and console/network health.
- A deploy/production owner proves the actual public URL, sitemap/robots behavior, and the rendered pages used in the outreach.

checklist_path: `shipglowz_data/workflow/test-checklists/temuglowz-temu-affiliate-readiness.md`; create it before browser proof and record each scenario, route, viewport, evidence link and result.

required_results:

- `TC-READY-001`: every promoted route returns its intended public page; no footer, guide index, sitemap or llms link points to a broken route.
- `TC-READY-002`: a guide with empty product sections is noindexed or removed from all promotion/index sources until substantive content is verified.
- `TC-READY-003`: disclosure appears before or beside the first affiliate recommendation and explains plainly that qualifying purchases may earn a commission.
- `TC-READY-004`: guide copy contains no unsubstantiated test, approval, guarantee, partnership, real-time price or availability claim.
- `TC-READY-005`: each rendered affiliate CTA is HTTPS, points to an approved Temu host, and carries `noopener noreferrer sponsored`; invalid/missing URLs render no CTA.
- `TC-READY-006`: guide HTML remains static for product cards and contains the expected canonical, robots, structured data and accessible heading structure.
- `TC-READY-007`: desktop and mobile browser checks show no overflow, obscured disclosure/CTA, broken image, console error or failed critical request on promoted routes.
- `TC-READY-008`: keyboard navigation exposes a visible focus path and interactive controls have accessible names on promoted routes.
- `TC-READY-009`: the actual deployment matches the reviewed build, with sitemap and robots directives matching the intended public route set.
- `TC-READY-010`: the final dossier contains a dated audit summary, resolved/accepted finding list, public URL evidence, claim/source evidence and a GO/NO-GO verdict; only GO permits an unsent outreach draft.

Exceptions with proof:

- Native Android/Tauri proof is not required for a public-site-only claim unless the outreach promotes the app as production-ready.
- Legal counsel is outside the repository workflow; any market-specific legal conclusion is a stated proof gap, not an inferred pass.

exception_without_proof:

- Never report affiliate readiness from local tests alone when a promoted production URL exists or will be supplied to Temu.
- Never treat a generic footer, terms link, or the words "affiliate link" alone as sufficient disclosure.
- Never pass a guide with inferred product evidence, a placeholder product section, a broken public route, or a CTA that bypasses the approved URL contract.

## Dependencies

- `shipglowz_data/workflow/specs/temu-affiliate-guide-template-upgrade.md` must pass readiness and verification before its guide pages can count as affiliate-ready.
- `shipglowz_data/workflow/TASKS.md` is the execution tracker for technical readiness work; public-content tasks belong in the editorial roadmap when that surface is governed.
- Official sources accessed 2026-07-12: Temu Affiliate Program, FTC Endorsement Guides FAQ, and Google Search Central Reviews System. Fresh-docs verdict: `fresh-docs checked`.

## Invariants

- No public page claims Temu partnership, certification, approval, endorsement, or affiliate status before approval.
- No product recommendation is presented as hands-on tested unless repository evidence documents that test.
- No unsafe, third-party, or malformed product URL becomes a clickable CTA.
- No thin/empty guide is deliberately exposed for indexing or included in the channel presented to Temu.
- The outreach draft is never sent automatically and remains subject to operator approval.

## Links & Consequences

- `site/src/pages/guides/gadgets-informatique.astro` currently renders empty guide sections while `site/public/sitemap.xml` includes the route; this is a readiness blocker.
- `site/src/site/components/ProductCard.astro` currently checks only whether `productUrl` exists; it needs the link-safety contract already specified by the affiliate-guide chantier.
- `shipglowz_data/business/business.md` says "tests indépendants" although the guide spec requires non-test wording; this conflict must be resolved before it informs public copy or outreach.
- `site/src/pages/terms.astro` and `site/src/pages/privacy.astro` are trust surfaces and must match the real site/public/app status without overclaiming legal completeness.
- Existing app security tasks stay separate; public claims about cloud, accounts or production availability must remain conservative until their own proof exists.

## Documentation Coherence

- Update the project business context and any public editorial guidance once the evidence standard is decided.
- Add a dated readiness dossier and a claim register/source log for promoted guides if absent.
- Update `README.md`, legal/trust pages, sitemap/robots and `llms.txt` only where the audited public truth requires it.
- Do not add an affiliate-partnership announcement before approval.

## Edge Cases

- A guide is technically reachable but has no products, no methodology, or a stale update date.
- A disclosure is present only in a footer, terms page, or after the CTA.
- A data URL uses `javascript:`, `data:`, `http:`, an unknown redirect host, or a malformed URL.
- A reviewer accesses a locale/device layout different from the local desktop build.
- The known sourcing account cannot supply fresh product facts; content must be held back rather than padded with assumptions.
- Temu's current program conditions or eligible countries differ from historic notes.

## Implementation Tasks

- [ ] Task 1: Establish the public-site readiness baseline.
  - Files: `shipglowz_data/workflow/AUDIT_LOG.md`, readiness dossier path to be created by the audit owner.
  - Action: Run focused SEO, code/security, performance, accessibility/design and browser audits; rank findings against the GO/NO-GO gates.
  - Depends on: this readiness spec passing `101-sg-ready`.
  - User story link: establishes the factual baseline needed to present the site responsibly.
  - Validate with: dated audit records, no invented pass/fail status.

- [ ] Task 2: Remove or complete thin and broken public surfaces.
  - Files: `site/src/pages/guides/gadgets-informatique.astro`, `site/src/site/data/guideIndex.ts`, `site/public/sitemap.xml`, `site/public/llms.txt`, relevant footer/navigation files.
  - Action: Keep only substantive, reachable public guide routes indexable; repair or remove broken internal references.
  - Depends on: Task 1 finding set.
  - User story link: ensures the channel sent to Temu helps a real reader instead of exposing unfinished pages.
  - Validate with: built-route scan and browser smoke.

- [ ] Task 3: Complete the dependent affiliate-guide trust template.
  - Files: those owned by `temu-affiliate-guide-template-upgrade.md`.
  - Action: ready, implement and verify its shared template, honest content contract, disclosure, methodology, card rationale and CTA safety.
  - Depends on: Task 1 baseline and the dependent spec's own readiness gate.
  - User story link: makes recommendations understandable and commercially transparent.
  - Validate with: that spec's full test contract and verification artifact.

- [ ] Task 4: Align claims, legal/trust pages and product sourcing evidence.
  - Files: `shipglowz_data/business/business.md`, `site/src/pages/terms.astro`, `site/src/pages/privacy.astro`, guide data/source-log artifacts.
  - Action: remove unsupported test/partnership claims; define evidence and freshness fields for every promoted product.
  - Depends on: Task 1 claim audit and Task 3 content contract.
  - User story link: prevents the operator and reader from relying on unproved claims.
  - Validate with: claim scan, editorial review and source-log completeness.

- [ ] Task 5: Meet technical quality and accessibility gates.
  - Files: changed public-site components/styles/assets only.
  - Action: address audit findings for performance, responsive layout, image strategy, accessibility, safe outbound links and client-hydration budget.
  - Depends on: Tasks 1-4 where relevant.
  - User story link: makes the promoted channel reliable and pleasant to use.
  - Validate with: checks, drift scan, lighthouse/CWV-oriented browser evidence and mobile/keyboard smoke.

- [ ] Task 6: Verify the actual public channel and make the outreach decision.
  - Files: readiness dossier and operator-approved outreach draft path to be created after GO.
  - Action: prove the production URL and pages, summarize truthful assets/traffic facts available, then produce GO/NO-GO and a non-sent draft only on GO.
  - Depends on: Tasks 1-5 and zero unresolved public-site P0/P1 findings.
  - User story link: turns verified quality into a safe contact decision.
  - Validate with: `004-sg-deploy`/`405-sg-prod` evidence and `103-sg-verify` verdict.

## Acceptance Criteria

- [ ] CA1: Given a page is included in sitemap or presented to Temu, when a reader opens it, then it is substantive, reachable, and free from unresolved placeholder content.
- [ ] CA2: Given a guide recommends products, when a reader sees a CTA, then disclosure, methodology, limitations and price-freshness context are clear and evidence-safe.
- [ ] CA3: Given a product URL is invalid or outside the allowlist, when the card renders, then no CTA is present.
- [ ] CA4: Given a public claim is scanned, when it implies testing, guarantee, live price, partnership or approval, then it is backed by documented evidence or removed.
- [ ] CA5: Given the production URL is known, when the readiness review runs, then all promoted routes, metadata, robots/sitemap and mobile layouts have browser-level proof.
- [ ] CA6: Given any P0/P1 readiness gate fails or lacks proof, when outreach is considered, then the verdict is NO-GO and no send-ready message is produced.
- [ ] CA7: Given every required gate passes, when the operator asks for the message, then the proposed outreach accurately identifies the site/channel and asks for review without claiming approval.

## Test Strategy

- Automated: build, typecheck, lint, unit/static URL and claim scans, metadata and design-system checks.
- Browser: desktop/mobile guide, index, terms and privacy routes; keyboard/focus; disclosure/CTA ordering; console and failed-request review.
- Audit: `406-sg-seo`, `403-sg-perf`, `409-sg-audit-a11y`, `401-sg-audit-code`, and `108-sg-browser`, sequenced through the maintenance master.
- Production: `004-sg-deploy` and `405-sg-prod` after a known public target is available.

## Risks

- High: presenting a thin, misleading or unsafe public guide can damage reader trust and the affiliate application.
- High: current business wording can overstate independent product tests.
- High: partner terms and eligibility can change by market; current official program details must be rechecked immediately before outreach.
- Medium: a local-only build can hide routing, metadata, CSP, asset or responsive-production defects.
- Medium: broadening scope into unrelated app debt could delay the focused public readiness outcome; separate work unless it affects the public claim.

## Execution Notes

Read first: `shipglowz_data/business/business.md`, `shipglowz_data/workflow/TASKS.md`, `shipglowz_data/workflow/specs/temu-affiliate-guide-template-upgrade.md`, `site/src/pages/guides/gadgets-informatique.astro`, `site/src/site/components/ProductCard.astro`, `site/public/sitemap.xml`, and `shipglowz_data/technical/design-system-authority.md`.

Execution order: baseline audit -> public-surface blockers -> affiliate-guide dependency -> claims/trust alignment -> technical/a11y/performance proof -> production proof -> independent verification -> operator-reviewed outreach draft. Do not begin outreach work while any NO-GO gate remains.

Stop conditions: unknown production URL; unsupported claims that cannot be evidenced or removed; missing ownership for a material audit finding; open P0/P1 public finding; unknown regional affiliate conditions; failed browser/deploy proof; or any request to submit/send without explicit operator approval.

## Open Questions

None required to initialize the readiness program. The exact country/channel URL and any real traffic or audience numbers will be requested only when the verified outreach draft is ready, because they cannot be inferred safely from the repository.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|---|---|---|---|---|---|
| 2026-07-12 15:21:07 UTC | 100-sg-spec | GPT-5 Codex | Created a dedicated, evidence-first public-site readiness contract before Temu affiliate outreach; separated it from the narrower legacy guide-template spec and from unrelated app debt. | draft | /101-sg-ready shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md |
| 2026-07-12 15:21:07 UTC | 309-sg-tasks | GPT-5 Codex | Added the active affiliate-readiness work item to the canonical execution tracker without duplicating the existing individual public-site blockers. | tracker synchronized | /101-sg-ready shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md |
| 2026-07-12 15:21:07 UTC | 100-sg-spec | GPT-5 Codex | Repaired the proof contract after strict readiness review by adding scenario-level results, a required checklist artifact, prohibited proof shortcuts, and task dependencies. | reviewed | /101-sg-ready shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md |
| 2026-07-12 15:23:48 UTC | 101-sg-ready | GPT-5 Codex | Confirmed structure, task ordering, adversarial safeguards, static-site exception, current official-source freshness and executable proof obligations. | ready | /102-sg-start shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md |
| 2026-07-12 15:39:00 UTC | 102-sg-start | GPT-5 Codex | Implemented the local public-guide trust, indexability, claim, outbound-link and governance slices; recorded the executed checklist and audit baseline. | partial | /103-sg-verify shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md |
| 2026-07-12 15:39:37 UTC | 001-sg-build | GPT-5 Codex | Orchestrated the ready chantier through its autonomous local implementation, validation and evidence capture; stopped before browser/production proof and any Temu contact. | partial | /103-sg-verify shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md |

## Current Chantier Flow

| Stage | Status | Notes |
|---|---|---|
| 100-sg-spec | completed | Readiness scope, gates, dependencies and stop conditions recorded. |
| 101-sg-ready | ready | Independent readiness gate passed; public-site audits and remediation may start. |
| 102-sg-start | partial | Local implementation and static proof complete; source evidence, browser and production proof remain. |
| 103-sg-verify | pending | Independent GO/NO-GO review after external proof gaps are resolved or recorded. |
| 104-sg-end | pending | Close readiness dossier when outcome is verified. |
| 005-sg-ship | pending | Ship only approved repository changes; outreach is a separate external action. |

Next command: `/103-sg-verify shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md`
