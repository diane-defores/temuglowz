---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.3.0"
project: "temuglowz"
created: "2026-07-13"
created_at: "2026-07-13 11:36:26 UTC"
updated: "2026-07-13"
updated_at: "2026-07-13 14:12:08 UTC"
status: reviewed
source_skill: 100-sg-spec
source_model: "GPT-5 Codex"
scope: "public homepage catalogue-first positioning, identity and copy"
owner: "Diane"
confidence: high
user_story: "En tant que visiteuse francophone, je veux découvrir rapidement des sélections de gadgets Temu utiles, malins, mignons ou insolites par usage, afin de trouver des idées adaptées à mon quotidien sans être conduite vers des promesses d'application ou de suivi non disponibles."
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "site/src/pages/index.astro"
  - "site/src/layouts/Layout.astro"
  - "site/src/components/**"
  - "site/src/site/components/Navbar.vue"
  - "site/src/styles/global.css"
  - "site/src/pages/guides/index.astro"
  - "site/src/site/data/guideIndex.ts"
  - "site/src/site/data/kitchen-gadgets.json"
  - "site/src/site/data/summer-cooling.json"
  - "site/public/og-image.png"
  - "site/public/llms.txt"
  - "shipglowz_data/editorial/claim-register.md"
  - "shipglowz_data/editorial/content-map.md"
  - "shipglowz_data/editorial/page-intent-map.md"
  - "shipglowz_data/technical/guidelines.md"
depends_on:
  - artifact: "shipglowz_data/business/business.md"
    artifact_version: "0.3.0"
    required_status: draft
  - artifact: "shipglowz_data/branding/branding.md"
    artifact_version: "0.1.0"
    required_status: draft
  - artifact: "shipglowz_data/editorial/claim-register.md"
    artifact_version: "1.0.1"
    required_status: reviewed
  - artifact: "shipglowz_data/editorial/content-map.md"
    artifact_version: "1.1.0"
    required_status: reviewed
  - artifact: "shipglowz_data/editorial/page-intent-map.md"
    artifact_version: "1.2.0"
    required_status: reviewed
  - artifact: "shipglowz_data/technical/guidelines.md"
    artifact_version: "1.0.0"
    required_status: reviewed
  - artifact: "shipglowz_data/technical/site/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: reviewed
  - artifact: "shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md"
    artifact_version: "1.0.0"
    required_status: ready
  - artifact: "Temu Terms of Use"
    artifact_version: "effective 2025-10-11; checked 2026-07-13"
    required_status: reviewed
  - artifact: "Temu Affiliate Program"
    artifact_version: "checked 2026-07-13"
    required_status: reviewed
supersedes: []
evidence:
  - "The current homepage is application-first and repeatedly promotes price history, price alerts, automated or broad shopping organization, pricing tiers and app-centric calls to action."
  - "The current business context already positions TemuGlowz as an independent Temu product-discovery and comparison project for themed selections, gifts and practical accessories."
  - "The current homepage includes anonymous five-star testimonials and savings claims without repository evidence, plus a newsletter form that simulates confirmation without a subscription backend."
  - "The active global navbar is site/src/site/components/Navbar.vue through site/src/layouts/Layout.astro, while similarly named legacy component copies also exist."
  - "The existing guide index exposes two substantive catalogue destinations: kitchen gadgets and summer cooling."
next_step: "/104-sg-end shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md"
---

# Spec: TemuGlowz Homepage Catalogue-First Repositioning

🟢 [temuglowz] spec: homepage catalogue-first repositioning | status: reviewed (verification passed) | path: `shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` | next: `/104-sg-end shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md`

## Title

TemuGlowz Homepage Catalogue-First Repositioning: Fun Product Discovery, Evidence-Safe Copy, And A Subtle App Path

## Status

Verified locally after implementation, automated/static checks and desktop/mobile browser proof. The canonical content map and page-intent map define the homepage as a catalogue-first discovery surface, `shipglowz_data/technical/guidelines.md` owns the project language/public-copy doctrine, and all implementation and handoff evidence resolves under `shipglowz_data/workflow/verification/temuglowz-home-catalog-repositioning/`.

Implementation is authorized through `/102-sg-start` within this specification's bounded source and evidence scope. This specification does not authorize publication, affiliate enrollment, affiliate links, product scraping, new product claims, commit, push, or deployment.

The existing `temuglowz-temu-affiliate-readiness` chantier remains the umbrella trust and GO/NO-GO authority. This specification owns only the homepage's catalogue-first identity and copy, so it must not be used to close the wider affiliate-readiness chantier.

## User Story

En tant que visiteuse francophone, je veux découvrir rapidement des sélections de gadgets Temu utiles, malins, mignons ou insolites par usage, afin de trouver des idées adaptées à mon quotidien sans être conduite vers des promesses d'application ou de suivi non disponibles.

Primary actors:

- A visitor looking for gift ideas, practical accessories, kitchen discoveries, seasonal products, camping gadgets or computing accessories.
- A reader who needs to understand how TemuGlowz selects products and what remains to verify on Temu.
- The operator maintaining a playful discovery surface without implying Temu authorization, hands-on tests or live product knowledge.

Trigger: the visitor opens `/` or follows a TemuGlowz homepage result from search or social sharing.

Observable result: the first viewport identifies TemuGlowz as an independent, friendly catalogue of useful and unusual Temu discoveries; the primary calls to action open published guides or catalogue categories; the application is present only as a low-emphasis path for visitors who specifically need shopping-list organization.

## Minimal Behavior Contract

The homepage accepts the current set of published guide-index entries and renders a static, catalogue-first discovery journey in French: a playful hero, browse-by-use sections, cards leading only to substantive published guides, a concise selection/transparency method, and guide-focused calls to action. It removes app-first pricing, price tracking, price alerts, automated extraction, fabricated social proof and fake newsletter success. If a desired category has no substantive published destination, it may appear only as an explicitly non-clickable future theme or must be omitted; it must never lead to a thin, empty or invented catalogue page. The easy-to-miss case is a visually playful redesign that still embeds unsupported claims in metadata, JSON-LD, navigation, footer copy, structured data or an apparent testimonial.

## Success Behavior

- Given the homepage loads, when the visitor scans the first viewport, then the headline and supporting copy describe independent gadget discovery rather than an application, price tracker or order archive.
- Given published guides exist, when the visitor browses categories or featured selections, then every enabled card and primary CTA leads to a substantive public guide or `/guides`.
- Given a theme such as gifts, camping or computing has no substantive published guide, when the homepage renders, then it does not imply that a complete selection already exists behind a clickable CTA.
- Given the visitor wants to understand recommendation quality, when they reach the method section, then they see that products are curated from stated use cases and visible information, are not presented as hands-on tested without evidence, and require checking price, variant, availability, delivery and reviews on Temu.
- Given the visitor is interested in the application, when they inspect secondary navigation or the lower-page utility area, then a discreet `/app` link remains available without competing with guide discovery.
- Given metadata or social previews are generated, when they are inspected, then they describe the catalogue and independent editorial posture rather than price tracking, cloud behavior, paid plans or a public production web application.

## Error Behavior

- Missing or empty guide data: omit the affected featured card or render a truthful non-clickable theme label; do not invent products, rankings, links, images or availability.
- Unsupported product or platform claim: block verification until the copy is removed or tied to evidence recorded in the claim register.
- Missing product imagery: use an honest neutral visual treatment that does not imply a real product photo; do not copy a significant amount of Temu content or bulk-download assets.
- Broken, unsafe or unpublished destination: suppress the CTA and fail link-integrity proof.
- Newsletter without a real subscription backend: do not collect the email and do not display a simulated success message; replace the surface with a non-form CTA or remove it.
- App availability uncertainty: keep the link descriptive and low-emphasis; do not use “commencer”, “essai gratuit”, pricing or production-readiness language.
- Metadata/schema mismatch: fail verification if homepage HTML still presents TemuGlowz primarily as a `WebApplication` or exposes an unsupported `Offer`.

## Problem

The current homepage tells the story of a shopping-list application. Its title, description, hero, problem framing, feature grid, testimonials, pricing, final CTA, newsletter, navigation and footer repeatedly promote order archiving, price history, price alerts, automatic or advanced tracking, cloud posture, Android availability and paid plans. This conflicts with the current business direction: TemuGlowz is first an independent discovery catalogue for themed, useful and unusual Temu products. Several current claims are not supported by the repository's public claim register, and some features depend on behavior that should not be promised without approved official access or implementation proof.

The page also lacks the delight and browsing cues expected from a “caverne d'Ali Baba” of discoveries. Existing guide content is available but buried behind app-oriented sections and calls to action.

## Solution

Recompose the public homepage as a static editorial discovery surface. Lead with a fun but credible French hero, show use-case/category entry points, feature the existing kitchen and summer guides from the canonical guide index, explain the selection method and limitations, and send primary traffic to `/guides` and published guide routes. Retain the application only as a small contextual link to `/app`.

Remove the current app-pricing funnel, price-monitoring narrative, anonymous testimonials and fake newsletter confirmation. Align homepage metadata and structured data with a website/editorial catalogue. Reuse the existing public-site token authority and components where they fit; change `global.css` only when the new composition cannot be expressed with existing semantic tokens and utilities.

## Scope In

- Homepage information architecture and French copy in `site/src/pages/index.astro`.
- Homepage title, description, Open Graph/Twitter preview inputs and homepage-specific JSON-LD behavior in `site/src/pages/index.astro` and `site/src/layouts/Layout.astro`.
- Active homepage sections under `site/src/components/`: hero, discovery/category blocks, featured guide cards, selection method/transparency, final guide CTA and footer.
- Active global navigation in `site/src/site/components/Navbar.vue`, with guide discovery as the primary route family and `/app` as a discreet secondary link.
- Removal from the homepage composition of `Pricing.vue`, `Testimonials.astro` and the simulated `Newsletter.vue` form; components may be left unused if deleting them would broaden risk, but no active homepage path may render their misleading content.
- `site/src/components/Footer.astro` alignment with catalogue navigation, trust pages and a subtle app link.
- Reuse of `site/src/site/data/guideIndex.ts` and its two current substantive guide routes for featured catalogue cards.
- Conditional adjustments to `site/src/styles/global.css` only if existing semantic tokens/utilities cannot support the approved layout and delight cues.
- Update of `site/public/og-image.png` and `site/public/llms.txt` only if the rendered homepage or machine-readable summary would otherwise contradict the new public positioning.

## Scope Out

- Adding new products, product URLs, prices, ratings, seller claims or unverified product images.
- Creating new gift, camping, computing or other guide routes without a separate substantive content contract and evidence.
- Editing `site/src/site/components/AffiliateGuideTemplate.astro`, `PillarPage.vue`, `PillarPageLoader.vue`, `ProductCard.astro`, or `ProductCard.vue`; these files already contain unrelated working-tree changes and are explicitly outside this slice.
- Scraping, crawling, spidering, bulk-copying or automating retrieval from Temu.
- Implementing price history, price alerts, automatic availability checks, automatic product extraction or Temu account/session access.
- Affiliate application submission, affiliate identifier insertion, outbound message sending, or any claim of Temu approval or partnership.
- Building a newsletter backend, payment system, subscription tiers, application features or app deployment.
- Redesigning guide detail pages, legal pages or the application itself except where a homepage link label must remain truthful.
- Deploying or shipping without the later lifecycle owner's approval and proof.

## Constraints

- TemuGlowz remains independent. No homepage wording may imply Temu endorsement, authorization, sponsorship, certification or partner status before written approval.
- Curation is not testing. Use “sélection”, “repéré”, “à comparer”, “pour tel usage” and “à vérifier” according to the claim register; do not use “testé”, “approuvé”, “garanti”, “meilleur prouvé”, “qualité sûre” or equivalent without evidence.
- Price, variant, availability, delivery, seller information, ratings and product performance are volatile or unverified unless a current dated source record proves the exact claim. The homepage should avoid displaying product-level price and rating data.
- Temu Terms of Use effective 2025-10-11 prohibit crawl/scrape/spider behavior and significant-content copying, and describe limited personal/non-commercial use absent permission. This slice must use repository-curated summaries and existing links only; it must not introduce automated Temu retrieval or reproduce substantial Temu content.
- The Temu Affiliate Program describes promotion through content/channels after approval. Until approval is documented, calls to action remain ordinary editorial navigation or direct product verification links under the separate guide contract, and no commission/partner status is implied.
- Official-source freshness verdict: `fresh-docs checked 2026-07-13` for Temu Terms of Use and Temu Affiliate Program. Recheck both before affiliate enablement or if implementation changes outbound commercial behavior.
- Use `site/src/styles/global.css` as the token authority, semantic Tailwind utilities, the existing reduced-motion behavior and the visible focus treatment from `Layout.astro`.
- Preserve French as the homepage language and keep copy natural, friendly and concrete. “Fun” must come from wording, rhythm, visual hierarchy and honest category framing, not exaggerated claims.
- Static catalogue content should remain crawlable. Avoid new client hydration unless the interaction requires it and the benefit is proven.
- Preserve `/guides`, `/app`, `/terms` and `/privacy` route reachability.

## Security Contract

- Homepage guide links must resolve to repository-owned relative routes. Do not add user-controlled HTML, `set:html`, `innerHTML`, executable URLs or inline event-handler content.
- Do not introduce Temu credentials, cookies, session state, authenticated requests, affiliate identifiers, third-party scraper services, proxy rotation or CAPTCHA bypass.
- Treat guide-index content as repository-curated text rendered through normal escaping. Do not render arbitrary HTML from data.
- If any external image is proposed for the homepage, verify its source, permission posture and failure behavior before use; do not mirror or bulk-copy Temu assets in this slice.
- The page must not collect email or personal data through a non-functional form. If the existing newsletter is removed from composition, no replacement data collection is authorized.
- Keep outbound product-link security under the existing affiliate guide contract; this homepage should prefer internal guide routes and must not bypass `toTrustedTemuUrl` through new direct product CTAs.
- Do not log full affiliate URLs, personal data or copied product content as part of homepage diagnostics.

## Test Contract

Surface: public Astro homepage, shared layout metadata/structured data, active global navbar, homepage footer and static links to published guides.

proof_profile: mixed automated static proof, claim-policy scans, design-system validation and browser proof on desktop and mobile.

proof_order: source and policy review -> implementation -> typecheck/unit/build -> generated-HTML claim/metadata/link inspection -> design-system drift check -> desktop/mobile browser and accessibility smoke -> umbrella readiness handoff.

checklist_path: `shipglowz_data/workflow/test-checklists/temuglowz-home-catalog-repositioning.md`; create it during implementation before browser proof and record scenario, route, viewport, evidence and result.

required_scenario_ids: `TC-HOME-CAT-001` through `TC-HOME-CAT-012`.

Required automated proof:

- `pnpm build:site`
- `pnpm --filter @temuglowz/site typecheck`
- `pnpm --filter @temuglowz/site test:once`
- `python3 /home/claude/shipglowz/tools/design_system_drift_check.py --changed --format markdown`
- focused source and generated-HTML scans for forbidden or removed claims, including price tracking, price alerts, automatic extraction, fabricated testimonials, unproved savings, unsupported pricing/plan claims, hands-on tests and Temu partnership language
- generated homepage inspection for title, meta description, canonical, Open Graph, Twitter data and JSON-LD types/claims
- static link and anchor inspection for every homepage CTA, navigation item and footer link
- generated homepage inspection confirming that app-pricing/testimonial/newsletter islands or sections are absent and that catalogue content remains available without unnecessary hydration

Required scenario results:

- `TC-HOME-CAT-001`: the first desktop and mobile viewport identifies TemuGlowz as an independent gadget-discovery catalogue and exposes a guide-focused primary CTA.
- `TC-HOME-CAT-002`: the homepage displays useful, unusual, cute or practical discovery themes without claiming unavailable guide content.
- `TC-HOME-CAT-003`: current featured cards resolve only to `/guides`, `/guides/kitchen-gadgets` or `/guides/summer-cooling`, unless another substantive route is separately proven before implementation.
- `TC-HOME-CAT-004`: a visible method/transparency section distinguishes editorial curation from hands-on testing and tells readers to verify volatile product details on Temu.
- `TC-HOME-CAT-005`: no homepage source or generated HTML promotes price history, price alerts, live/automatic monitoring, automatic extraction or a way to determine whether a discount is “real”.
- `TC-HOME-CAT-006`: anonymous five-star testimonials, unsupported savings claims, “most popular” pricing, subscription tiers, trial CTAs and simulated newsletter confirmation are absent from the homepage.
- `TC-HOME-CAT-007`: `/app` remains reachable through a visually secondary, accurately labelled link and is not the hero or final primary CTA.
- `TC-HOME-CAT-008`: homepage title, description, social metadata and JSON-LD describe the website/editorial catalogue; no unsupported global `WebApplication` or `Offer` claim is emitted for `/`.
- `TC-HOME-CAT-009`: all homepage internal links and section anchors resolve; no CTA points to a thin, empty, missing or noindexed route.
- `TC-HOME-CAT-010`: desktop and mobile browser proof shows no overflow, clipped card, obscured CTA, broken critical image, failed critical request or console error.
- `TC-HOME-CAT-011`: keyboard navigation reaches all interactive controls in a logical order, focus is visibly apparent, controls have accessible names, headings remain hierarchical and reduced-motion behavior is preserved.
- `TC-HOME-CAT-012`: the implementation leaves the five explicitly out-of-scope dirty guide component files untouched and records the homepage slice for the umbrella readiness owner without claiming global affiliate readiness.

exception_with_proof:

- Sentry/observability instrumentation is not required for this static public homepage because the slice adds no authentication, checkout, payment, protected data workflow or server-side transaction. Build output, browser console/network inspection and static-host production proof are the appropriate evidence.
- Native Android/Tauri proof is not required because the application is not changed; only a secondary link to `/app` remains.
- A new product photo shoot or local product-image library is not required. Honest abstract/category visuals and existing verified assets may be used, provided browser proof shows graceful rendering.

exception_without_proof:

- Do not mark verified from copy review or screenshots alone; automated build, metadata, generated-HTML, link, claim and browser evidence are all required.
- Do not pass a homepage that merely hides prohibited text visually while leaving it in metadata, JSON-LD, accessible labels or generated HTML.
- Do not pass if a CTA leads to the empty/noindexed computing guide or any other thin route.
- Do not pass if the page simulates newsletter subscription, user reviews, popularity, savings or paid-plan availability.
- Do not pass if the five excluded dirty guide components are modified as part of this slice.

## Dependencies

- `shipglowz_data/business/business.md` version `0.3.0`: audience, discovery themes, independent positioning and conditional business model.
- `shipglowz_data/branding/branding.md` version `0.1.0`: practical, trustworthy voice and evidence-safe vocabulary.
- `shipglowz_data/editorial/claim-register.md` version `1.0.1`: claim families, allowed wording and evidence requirements.
- `shipglowz_data/technical/site/design-system-authority.md` version `1.0.0`: public-site token source, focus/reduced-motion expectations and drift proof.
- `shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md` version `1.0.0`: umbrella public-site trust, affiliation and production-proof gates.
- `shipglowz_data/editorial/content-map.md` version `1.1.0`: catalogue-first homepage job and update triggers.
- `shipglowz_data/editorial/page-intent-map.md` version `1.2.0`: homepage audience, everyday-shopper voice, primary/secondary CTAs, required content and forbidden shortcuts.
- `shipglowz_data/technical/guidelines.md` version `1.0.0`: internal language doctrine, French public-copy rules and project-wide claim boundaries.
- `site/src/site/data/guideIndex.ts`: canonical list of guides safe to feature without duplicating guide content in the homepage.
- Temu Terms of Use, effective 2025-10-11 and checked 2026-07-13: restrictions against crawl/scrape/spider behavior and significant-content copying; limited use absent permission.
- Temu Affiliate Program, checked 2026-07-13: programme participation and promotional content/channel framing apply after approval.

Fresh external documentation verdict: `fresh-docs checked 2026-07-13`.

## Invariants

- The homepage never claims Temu partnership, sponsorship, authorization, approval, certification or official status without written evidence.
- Editorial selection is never represented as a hands-on test unless linked evidence exists in the claim register.
- No live price, guaranteed availability, verified seller, guaranteed quality or automatic Temu monitoring claim is introduced.
- No scraper, crawler, spider, authenticated Temu automation, significant-content copying or session extraction is added.
- Published-guide data remains the source for featured guide destinations; the homepage does not fork product facts into a second catalogue dataset.
- The application remains reachable but secondary to catalogue discovery.
- Static public content remains useful without client-side JavaScript except for genuinely interactive controls such as the existing theme/menu behavior.
- Existing legal/trust routes and non-affiliation posture remain intact.
- The five excluded guide component files retain their pre-existing contents and worktree state.

## Links & Consequences

- `site/src/pages/index.astro`: changes from an app feature/pricing funnel to the catalogue composition and owns homepage-specific metadata/schema inputs.
- `site/src/layouts/Layout.astro`: may need schema props or path-aware defaults so `/` can emit `WebSite`/`Organization` catalogue truth while `/app` retains any separately justified application schema. A global schema change must not regress guides or trust pages.
- `site/src/components/Hero.astro`: becomes the discovery-led first viewport with guide CTAs.
- `site/src/components/ProblemSection.astro`, `SolutionSection.astro`, `Benefits.astro` and `BentoGrid.astro`: may be rewritten or replaced with category, featured-guide and method sections. Avoid preserving misleading class names as conceptual authority if replacement improves maintainability.
- `site/src/components/Testimonials.astro`, `Pricing.vue` and `Newsletter.vue`: removed from active homepage composition; deletion is optional and should occur only if usage inspection proves they are dead and the implementation owner keeps the slice safe.
- `site/src/components/FinalCTA.astro`: becomes a guide-discovery CTA, not an app/pricing CTA.
- `site/src/site/components/Navbar.vue`: the actual active navbar must prioritize guides/categories; similarly named components elsewhere are not automatically authoritative.
- `site/src/components/Footer.astro`: catalogue/trust navigation replaces product-pricing emphasis; `/app` remains subtle.
- `site/src/styles/global.css`: changes only when needed for reusable semantic primitives; avoid page-local visual literals and preserve existing theme behavior.
- `site/public/og-image.png`: update only if the current artwork materially presents the old app-first identity.
- `site/public/llms.txt`: update only if it contradicts the catalogue-first public truth after implementation.
- SEO consequence: title, description, headings, internal links and structured data must shift together. A copy-only hero change would leave contradictory machine-readable claims.
- Performance consequence: removing pricing/newsletter hydration should reduce homepage JavaScript; the redesign must not replace it with unnecessary client islands.

## Documentation Coherence

- Do not rewrite `business.md`, `branding.md` or the claim register in this slice; they already define the target posture. If implementation reveals a true policy conflict, stop and route it to the document owner.
- Create and populate `shipglowz_data/workflow/test-checklists/temuglowz-home-catalog-repositioning.md` during implementation.
- Store the dated baseline, scoped-diff notes, browser screenshots and final verification summary under `shipglowz_data/workflow/verification/temuglowz-home-catalog-repositioning/`; `baseline.md` and `verification-summary.md` are the canonical text evidence files.
- Record the implementation and verification handoff in this specification's Skill Run History through the owning lifecycle skills.
- Update `site/public/llms.txt` only if needed to keep machine-readable public positioning coherent.
- The umbrella `temuglowz-temu-affiliate-readiness` history/verdict must be updated by its owner after homepage proof; this child spec must not claim that the full affiliate surface is ready.
- README changes are not required unless the homepage architecture introduces a new developer workflow or data source.

## Edge Cases

- Only two guide routes are substantive, while desired future themes include gifts, camping and computing.
- The computing guide route exists but is empty/noindexed and must not become a homepage destination.
- Guide-index data imports product-guide JSON containing volatile prices/ratings, but the homepage needs only guide-level title, description, category and route.
- A playful visual card could look like a product recommendation even when it links only to a category; labels must make the destination clear.
- A category card has no local image or its remote image fails.
- The current OG image still depicts the application after visible copy changes.
- Layout schema is shared by guides, legal pages and `/app`; homepage schema correction must not overwrite route-specific truth.
- The active Navbar resides under `site/src/site/components/`, while another `site/src/components/Navbar.vue` exists.
- Removing Vue homepage islands changes hydration and reveal timing; the page must still reveal content with reduced motion or JavaScript disabled where applicable.
- Theme persistence uses local storage; a theme-control failure must not hide catalogue content or navigation.
- A future affiliate approval changes disclosure needs; that later change requires fresh programme terms and a separate evidence-backed update.
- Existing unrelated worktree modifications overlap guide components; implementation must avoid them and prove scoped file changes.

## Implementation Tasks

- [x] Task 1: Establish the homepage claim and destination baseline.
  - Files: `site/src/pages/index.astro`, `site/src/layouts/Layout.astro`, `site/src/components/Hero.astro`, `site/src/components/ProblemSection.astro`, `site/src/components/SolutionSection.astro`, `site/src/components/Benefits.astro`, `site/src/components/BentoGrid.astro`, `site/src/components/Testimonials.astro`, `site/src/components/Pricing.vue`, `site/src/components/FinalCTA.astro`, `site/src/components/Newsletter.vue`, `site/src/components/Footer.astro`, `site/src/site/components/Navbar.vue`, `site/src/site/data/guideIndex.ts`.
  - Action: inventory visible and machine-readable app-first, tracking, pricing, testimonial, newsletter and affiliation-sensitive claims; map every current CTA and anchor; record which components are active versus legacy duplicates.
  - Depends on: this spec passing `101-sg-ready`.
  - User story link: prevents misleading legacy copy from surviving outside the visible hero.
  - Validate with: a dated source/HTML claim scan and link map in `shipglowz_data/workflow/verification/temuglowz-home-catalog-repositioning/baseline.md`.

- [x] Task 2: Recompose the homepage around catalogue discovery.
  - Files: `site/src/pages/index.astro`, `site/src/components/Hero.astro`, and whichever of `site/src/components/ProblemSection.astro`, `SolutionSection.astro`, `Benefits.astro`, `BentoGrid.astro`, `FinalCTA.astro` are retained or replaced.
  - Action: implement a fun discovery hero, browse-by-use/category presentation, featured current-guide cards, method/transparency content and guide-first final CTA. Remove `Testimonials`, `Pricing` and `Newsletter` from active homepage composition.
  - Depends on: Task 1.
  - User story link: makes useful and unusual gadget discovery the immediate visitor experience.
  - Validate with: `TC-HOME-CAT-001` through `TC-HOME-CAT-007`, build and desktop/mobile visual proof.

- [x] Task 3: Bind featured content to substantive guide data.
  - Files: `site/src/pages/index.astro`, `site/src/site/data/guideIndex.ts`, and any new homepage-only static Astro component created under `site/src/components/`.
  - Action: reuse the canonical guide index for featured kitchen and summer cards; represent unbuilt themes honestly without enabled destinations or omit them. Do not import or duplicate product-level price/rating data into the homepage.
  - Depends on: Task 2 composition.
  - User story link: gives visitors real destinations without promising empty catalogue depth.
  - Validate with: generated HTML and internal-link proof for `TC-HOME-CAT-002`, `TC-HOME-CAT-003` and `TC-HOME-CAT-009`.

- [x] Task 4: Align the active navigation and footer.
  - Files: `site/src/site/components/Navbar.vue`, `site/src/components/Footer.astro`.
  - Action: replace feature/pricing/review navigation with guide/category/trust-oriented labels; keep `/app` as one low-emphasis contextual link; remove pricing/app-first footer language.
  - Depends on: Tasks 2 and 3.
  - User story link: preserves the catalogue-first path beyond the hero and on all Layout-backed routes.
  - Validate with: desktop/mobile navbar behavior, keyboard navigation, link integrity and `TC-HOME-CAT-007`/`009`/`011`.

- [x] Task 5: Correct homepage metadata and structured data.
  - Files: `site/src/pages/index.astro`, `site/src/layouts/Layout.astro`, optionally `site/public/og-image.png` and `site/public/llms.txt` if their current content contradicts the new positioning.
  - Action: set catalogue-first title/description/social copy and emit evidence-safe homepage schema. Remove unsupported homepage `WebApplication`/`Offer` claims while preserving route-specific metadata contracts.
  - Depends on: approved visible positioning from Task 2.
  - User story link: ensures search, social and machine readers receive the same truthful identity.
  - Validate with: `TC-HOME-CAT-008`, generated HTML inspection and build.

- [x] Task 6: Apply bounded visual identity polish.
  - Files: retained/new homepage components under `site/src/components/`; `site/src/styles/global.css` only if necessary.
  - Action: use playful category cues, friendly microcopy, honest abstract/product-independent visuals and clear card hierarchy while keeping semantic tokens, dark/light modes, reduced motion and focus states. Do not source new Temu product assets through crawling or bulk copying.
  - Depends on: Tasks 2-5.
  - User story link: creates the desired warm “caverne d'Ali Baba” feeling without weakening trust.
  - Validate with: drift check and `TC-HOME-CAT-010`/`011` desktop and mobile evidence.

- [x] Task 7: Prove claims, links, accessibility and scoped changes.
  - Files: generated `site/dist/**`, `shipglowz_data/workflow/test-checklists/temuglowz-home-catalog-repositioning.md`, and `shipglowz_data/workflow/verification/temuglowz-home-catalog-repositioning/**`; do not edit the five excluded guide component files.
  - Action: run all automated commands and static scans, inspect rendered metadata/JSON-LD, complete browser/console/network/keyboard/focus proof, and compare git scope against the explicit file boundary.
  - Depends on: Tasks 1-6.
  - User story link: proves the new identity is usable, truthful and safely bounded.
  - Validate with: all `TC-HOME-CAT-*` results and a clean scoped-diff report.

- [x] Task 8: Hand verified homepage evidence to the umbrella readiness owner.
  - Files: this spec's Skill Run History and `shipglowz_data/workflow/verification/temuglowz-home-catalog-repositioning/verification-summary.md`; the umbrella spec may be updated only by its owning lifecycle flow.
  - Action: summarize implemented positioning, claim removals, remaining catalogue gaps and proof status without declaring affiliate readiness or sending/applying to Temu.
  - Depends on: Task 7 and `103-sg-verify` verdict for this spec.
  - User story link: keeps the public-homepage improvement coherent with wider partnership readiness.
  - Validate with: explicit child-spec verdict and next owner command.

## Acceptance Criteria

- [x] AC1: Given a visitor opens `/`, when the first viewport renders, then the primary headline, supporting copy and CTA present independent Temu gadget discovery and link toward guides rather than the application.
- [x] AC2: Given the homepage offers categories or use cases, when a visitor selects an enabled item, then it opens a substantive published guide or `/guides`; no enabled item points to an empty, missing or noindexed route.
- [x] AC3: Given the current guide index contains kitchen and summer guides, when featured selections render, then their guide-level title, category, description and route come from the canonical guide index or a typed derivative without duplicating volatile product prices/ratings.
- [x] AC4: Given a visitor reads the method section, when they evaluate a selection, then the page states that TemuGlowz curates by use case and visible information, does not imply hands-on tests, and asks readers to verify price, variant, availability, delivery and reviews on Temu.
- [x] AC5: Given homepage source, accessible content, metadata, JSON-LD and generated HTML are scanned, when verification runs, then price tracking, price alerts, live/automatic monitoring, automatic extraction and “real discount” claims are absent.
- [x] AC6: Given current testimonials, pricing and newsletter behavior lack evidence or backend support, when the redesigned homepage builds, then anonymous five-star reviews, savings claims, “most popular” plans, trial/subscription offers and simulated subscription success are not rendered.
- [x] AC7: Given a visitor specifically wants the app, when they inspect secondary navigation or the footer, then `/app` remains reachable through a discreet truthful label without becoming a primary CTA or promising public production availability.
- [x] AC8: Given the homepage is shared or indexed, when its metadata and JSON-LD are inspected, then they consistently describe an independent editorial discovery website and contain no unsupported homepage `WebApplication`, `Offer`, partner or affiliate-status claim.
- [x] AC9: Given the homepage renders in light/dark mode at desktop and mobile widths, when browser proof runs, then content is readable, playful and coherent with no overflow, clipped controls, broken critical image, console error or failed critical request.
- [x] AC10: Given a keyboard-only visitor uses the homepage, when focus moves through navigation, cards, CTAs and theme/menu controls, then order is logical, focus is visible, names are accessible and headings are hierarchical.
- [x] AC11: Given reduced motion is requested, when the homepage loads, then essential content is visible without requiring animations and no interaction depends on motion.
- [x] AC12: Given the implementation diff is reviewed, when scoped files are compared, then the five excluded dirty guide components are unchanged by this slice and no app, payment, affiliate-enrollment or scraping code was added.
- [x] AC13: Given all local proof passes, when the child chantier is handed off, then the result is reported to the affiliate-readiness owner without claiming that the full site is affiliate-ready or contacting Temu.

## Test Strategy

1. Before editing, capture the scoped git status and identify pre-existing changes, especially the five excluded guide components.
2. Run focused `rg` scans across active homepage source for old claim families and record the baseline.
3. Implement the catalogue-first composition with static Astro content and the smallest necessary client behavior.
4. Run `pnpm --filter @temuglowz/site typecheck`, `pnpm --filter @temuglowz/site test:once` and `pnpm build:site`.
5. Run the design-system drift check against changed files.
6. Inspect generated homepage HTML for forbidden claim terms, absent pricing/testimonial/newsletter surfaces, hydration, title/meta/social tags, canonical and JSON-LD.
7. Validate every navigation, category, featured-card, CTA and footer href/anchor against built routes and indexability intent.
8. Use browser proof at representative desktop and mobile widths. Capture the first viewport, featured guide area, method block, final CTA and navigation states; inspect console and failed network requests.
9. Complete keyboard, visible-focus, accessible-name, heading-order and reduced-motion scenarios.
10. Review the final diff against the allowed surface and record all `TC-HOME-CAT-*` outcomes in the checklist.

## Risks

- High trust risk: playful copy can slide into unsupported “best”, test, safety, savings or quality claims. Mitigation: claim-register language, generated-HTML scan and adversarial editorial review.
- High platform-policy risk: acquiring visuals or product content by scraping/copying would violate the stated constraints. Mitigation: no automated Temu retrieval, no bulk content copying and explicit asset provenance review.
- High positioning risk: leaving app-first metadata, schema, navbar or footer copy would create a split identity even if the visible hero changes. Mitigation: treat visible and machine-readable surfaces as one acceptance contract.
- Medium SEO risk: future categories could create thin or misleading routes. Mitigation: enabled CTAs only for substantive published guides and link/indexability proof.
- Medium legal/commercial risk: affiliate wording before approval could imply a relationship. Mitigation: independent posture and no affiliate status/commission claim beyond the existing separately governed disclosure context.
- Medium accessibility risk: decorative, animated category presentation could obscure hierarchy or focus. Mitigation: semantic markup, reduced motion, keyboard proof and visible focus.
- Medium performance risk: a visual redesign could add remote images or client islands. Mitigation: static-first components, asset review and generated hydration/network inspection.
- Medium maintenance risk: duplicated component trees can lead implementation to edit the wrong Navbar or legacy Vue components. Mitigation: trace imports from `index.astro` and `Layout.astro` before changes.
- Medium worktree risk: unrelated edits already exist in five guide components. Mitigation: explicit scope exclusion and final file-level diff proof.

## Execution Notes

Read first:

- `CLAUDE.md`
- `site/README.md`
- `shipglowz_data/business/business.md`
- `shipglowz_data/branding/branding.md`
- `shipglowz_data/editorial/claim-register.md`
- `shipglowz_data/editorial/page-intent-map.md`
- `shipglowz_data/editorial/content-map.md`
- `shipglowz_data/technical/site/design-system-authority.md`
- `shipglowz_data/workflow/specs/temuglowz-temu-affiliate-readiness.md`
- `site/src/pages/index.astro`
- `site/src/layouts/Layout.astro`
- all active `site/src/components/*` imported by `index.astro`
- `site/src/site/components/Navbar.vue`
- `site/src/site/data/guideIndex.ts`
- `site/public/llms.txt`

Execution order: baseline and import tracing -> catalogue IA/copy -> canonical guide binding -> active navbar/footer -> metadata/schema -> visual polish -> automated/static proof -> browser/a11y proof -> independent verification -> umbrella handoff.

Canonical evidence path: `shipglowz_data/workflow/verification/temuglowz-home-catalog-repositioning/`. Write the pre-edit claim/link inventory to `baseline.md`, browser images into the same directory with descriptive viewport names, and the integrated local proof/handoff record to `verification-summary.md`.

Fresh-docs posture: Temu Terms of Use effective 2025-10-11 and Temu Affiliate Program were checked on 2026-07-13. Recheck before introducing affiliate tracking, direct commercial CTAs, new Temu-derived assets or any automated data access. The present implementation must remain within the non-scraping, non-copying, independent editorial boundary.

Adversarial review performed while drafting:

- Corrected the initial temptation to reuse the umbrella readiness spec directly; a dedicated child spec avoids changing a partially verified outreach chantier's user story and acceptance contract.
- Added metadata/JSON-LD because visible copy alone would leave app-first machine-readable claims.
- Added an explicit no-destination rule for gifts, camping and computing because those desired categories do not yet have substantive published guides.
- Added fake-newsletter and anonymous-testimonial removal because merely changing price-tracking copy would preserve unsupported conversion signals.
- Added the active Navbar path and five dirty-file exclusions to prevent edits in duplicate or unrelated component surfaces.
- Added a static-site Sentry exception, hydration inspection and scoped-diff proof so validation matches the actual risk profile.

Stop conditions:

- The target positioning conflicts with a newer approved business, brand or claim-register artifact.
- Implementation would require scraping/crawling/spidering Temu, significant-content copying, authenticated Temu access, a third-party scraper or unapproved affiliate credentials.
- A requested category lacks a substantive guide but is required to be presented as available or clickable.
- Product imagery cannot be used with a clear provenance or truthful fallback.
- The implementation needs to modify any of the five excluded dirty guide components or cannot separate new changes from pre-existing worktree edits.
- A material claim about price, availability, testing, safety, seller quality, ratings, partnership, app production readiness or paid plans cannot be evidenced or removed.
- The shared Layout schema cannot be changed without regressing other public routes and no route-specific safe design is available.
- Build, typecheck, unit, claim, metadata, link, design-system, browser, console/network, keyboard/focus or reduced-motion proof fails.
- The next action would deploy, contact Temu, apply to the affiliate programme, add tracking identifiers, commit or push without the owning lifecycle authorization.

## Open Questions

None block readiness review. The implementation should use the two currently substantive guides as enabled destinations and treat gifts, camping and computing as non-clickable inspiration or omit them until their own content exists. A later content chantier may decide which category to build next.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|---|---|---|---|---|---|
| 2026-07-13 11:36:26 UTC | 100-sg-spec | GPT-5 Codex | Created a dedicated catalogue-first homepage specification from the operator's repositioning request; bounded app de-emphasis, prohibited/unsupported claim removal, existing-guide reuse, active component paths, policy constraints and full proof requirements. | draft | `/101-sg-ready shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 11:36:26 UTC | 100-sg-spec | GPT-5 Codex | Performed an internal adversarial review covering machine-readable claims, empty future categories, fake conversion proof, duplicate component paths, dirty-file isolation, static-site observability and verification shortcuts; repaired the draft before saving. | reviewed internally; not readiness-approved | `/101-sg-ready shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 11:41:47 UTC | 101-sg-ready | GPT-5 Codex | Ran an independent strict readiness, adversarial, freshness, documentation, language-doctrine and proportional security review; confirmed the product/security boundary but found unresolved documentation-authority and evidence-location contracts. | not ready | `/100-sg-spec shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 11:43:56 UTC | 300-sg-docs | GPT-5 Codex | Aligned the canonical homepage content and page-intent maps with the catalogue-first direction and created the missing project language/public-copy authority. | implemented | `/100-sg-spec shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 11:45:05 UTC | 100-sg-spec | GPT-5 Codex | Repaired all readiness blockers by binding the updated editorial authorities and language doctrine, then fixing one canonical baseline/browser/handoff evidence directory and exact evidence files. | reviewed | `/101-sg-ready shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 11:48:30 UTC | 101-sg-ready | GPT-5 Codex | Re-ran a fresh strict structure, user-story, adversarial, security, documentation-coherence and official-source freshness review after blocker repair; confirmed executable tasks, canonical evidence paths, scoped dirty-file isolation and complete static/browser proof obligations. | ready | `/102-sg-start shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 12:12:32 UTC | 102-sg-start | GPT-5 Codex | Implemented the catalogue-first homepage composition, guide binding, active navigation/footer, catalogue metadata/schema, OG artwork and bounded visual identity; removed misleading app/pricing/testimonial/newsletter surfaces from active composition. | implemented | `/108-sg-browser http://127.0.0.1:4321/ homepage catalogue desktop/mobile` |
| 2026-07-13 12:14:00 UTC | 108-sg-browser | GPT-5 Codex | Verified the built homepage at desktop and mobile widths, corrected missing emoji glyphs with code-native SVG icons, then rechecked responsive layout, navigation/theme controls, accessibility structure, console and network. | pass | `/103-sg-verify shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 12:16:46 UTC | 103-sg-verify | GPT-5 Codex | Verified the user story, success/error behavior, 12 required checklist scenarios, build/typecheck/tests, claim/schema/link scans, metadata coherence, scoped design-system findings and durable browser evidence. | verified | `/104-sg-end shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |
| 2026-07-13 14:12:08 UTC | 200-sg-redact | GPT-5 Codex | Rewrote the complete homepage journey after operator feedback to replace entrepreneur-facing strategy language with everyday shopper language focused on useful finds, simple pleasures, gift ideas and daily-life problems; aligned homepage card titles, metadata, navigation, footer and social artwork. | implemented and browser-checked | `/104-sg-end shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md` |

## Current Chantier Flow

| Stage | Status | Notes |
|---|---|---|
| 100-sg-spec | completed | Dedicated spec created and internally reviewed for completeness and adversarial gaps. |
| 101-sg-ready | ready | Fresh independent re-review passed after canonical documentation and evidence-path repairs. |
| 102-sg-start | implemented | Catalogue-first homepage, navigation, metadata, OG artwork and evidence artifacts implemented within the bounded slice. |
| 103-sg-verify | verified | Automated, static, browser, accessibility, claim, metadata, link and scoped-diff proof passed. |
| 104-sg-end | pending | Closure waits for verified implementation and umbrella handoff. |
| 005-sg-ship | pending | No commit, push, deployment, affiliate application or Temu contact authorized by this spec. |

Next command: `/104-sg-end shipglowz_data/workflow/specs/temuglowz-home-catalog-repositioning.md`
