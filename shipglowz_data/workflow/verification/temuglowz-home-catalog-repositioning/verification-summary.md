# Homepage catalogue-first verification summary

Date UTC: 2026-07-13
Proof path: evidence-first
Target: `http://127.0.0.1:4321/` from the built static site
Development mode: hybrid; local browser proof is authoritative for this static UI slice.

## Outcome

The homepage now presents TemuGlowz as an independent catalogue of useful, unusual and playful Temu gadget discoveries. Primary navigation and calls to action lead to published guides. The application remains a discreet secondary destination. Price tracking, price alerts, automatic extraction, unsupported plans, anonymous testimonials and simulated newsletter confirmation are absent from the active homepage and generated HTML.

## Automated and static proof

- `pnpm --filter @temuglowz/site typecheck`: pass, 0 errors; four hints exist only in concurrently modified out-of-scope `ProductCard.astro`.
- `pnpm --filter @temuglowz/site test:once`: pass, 1 file and 2 tests.
- `pnpm build:site`: pass, 9 static pages built.
- Focused forbidden-claim scan across active homepage source and `site/dist/index.html`: pass, no match.
- Legacy-island/schema scan for Pricing, Testimonials, Newsletter, `client:only`, WebApplication and Offer: pass, no match.
- Built metadata inspection: catalogue-first title and description, canonical/OG image, and JSON-LD types WebSite, Organization and CollectionPage with ItemList.
- Built href inspection: only intended catalogue, guide, trust, secondary app, asset and font destinations; no computing-guide CTA.
- `git diff --check` on the owned slice: pass.
- ShipGlowz metadata lint on the spec and changed governance authorities: pass.

## Design-system proof

The homepage uses the existing semantic Tailwind/token vocabulary and required focus/reduced-motion behavior. The changed homepage files produced no drift finding. The repository-wide `--changed` scan returned 18 candidates exclusively in concurrently modified, out-of-scope PillarPage, ProductCard and ProductReviews files; these are not owned or altered by this homepage chantier.

## Browser proof

Playwright MCP runtime: `executable-path /home/claude/.cache/ms-playwright/chromium-1228/chrome-linux/chrome`.

- Desktop 1440×1000 and mobile 390×844: no horizontal overflow, clipped controls or broken critical visuals.
- Generated SVG category icons render consistently; the initial missing-emoji-glyph issue was corrected before final capture.
- Mobile menu opens with labelled catalogue links; theme control responds.
- Keyboard focus reaches the skip link with a visible outline.
- Interactive controls without an accessible name: 0.
- Heading order: one H1 followed by coherent H2/H3 sections.
- Console: 0 errors and 0 warnings.
- Network: page, CSS, scripts and fonts all returned 200.
- Reduced motion: the central stylesheet shortens animations/transitions and the layout reveals essential content immediately when the preference is active.

Evidence:

- `home-desktop.png`
- `home-mobile.png`
- `home-desktop-snapshot.md`
- `baseline.md`
- `../../test-checklists/temuglowz-home-catalog-repositioning.md`

## Scope and risk notes

No scraper, Temu session access, affiliate identifier, data collection, payment or application feature was added. The five explicitly excluded guide component files remain outside this mission's edit ledger. Their worktree fingerprints changed concurrently under another owner, so this summary makes no repository-wide unchanged-state claim.

This verifies the homepage child chantier only. It does not establish Temu affiliate approval or global affiliate readiness, and it does not authorize commit, push or deployment.

Verification verdict: pass for the bounded local homepage catalogue-first scope.

## Consumer-copy refinement — 2026-07-13

Following operator feedback, the homepage was rewritten to address everyday shoppers rather than sound like a company explaining its positioning. The visible journey now uses ordinary language around useful finds, gifts, kitchen shortcuts, hot days and small daily problems. Governance-heavy terms were removed from the browsing copy and necessary safeguards were translated into simple pre-purchase reminders.

- Homepage-specific card titles now favor natural discovery language while canonical guide titles remain available for guide/schema contracts.
- Navigation, footer, title, description and default WebSite schema copy were aligned.
- The Open Graph artwork was edited with the exact consumer-facing line “Les gadgets qu’on ne cherchait pas… mais qu’on veut déjà.” using the built-in image generation workflow; final asset saved at `site/public/og-image.png` (1728×910).
- Typecheck, tests and static build pass.
- Focused forbidden-claim and entrepreneur-jargon scans pass for active homepage source.
- Desktop and mobile browser captures show coherent wrapping, no horizontal overflow, zero console errors and zero unnamed controls.

Additional evidence:

- `home-desktop-consumer-copy.png`
- `home-mobile-consumer-copy.png`
