# ShopGlowz public rebrand and multi-merchant verification summary

Date UTC: 2026-07-13
Proof path: evidence-first
Development mode: hybrid; local checks are authoritative for this static-site migration slice.
Target surface: built static site and public machine-readable assets under `site/`

## Outcome

The active public site now behaves as a ShopGlowz gadget-discovery surface rather than a Temu-first application homepage. The current proof supports the implemented public rebrand wave, the merchant-neutral card contract, and the repaired machine-readable SEO surface.

This summary does not claim the entire chantier is complete. It only records the local proof already achieved for the currently implemented wave.

## Automated and static proof

- `pnpm --dir site test:once`: pass, 1 file and 2 tests.
- `pnpm --dir site typecheck`: pass, 0 errors; remaining diagnostics are non-blocking hints only.
- `pnpm --dir site build`: pass, static routes generated successfully.
- `python3 /home/claude/shipglowz/tools/design_system_drift_check.py --changed --format markdown`: pass for the changed rebrand slice, with no new drift finding in the owned files.
- Sitemap/noindex parity fix: `/guides/gadgets-informatique` was removed from `site/public/sitemap.xml` because `site/src/pages/guides/gadgets-informatique.astro` still declares `noIndex={true}`.
- `site/public/llms.txt` was expanded to match the currently published public article corpus and published guide set.
- `site/src/site/lib/publicSeo.test.ts` now enforces that every `status: published` article appears in both `sitemap.xml` and `llms.txt`, and that the intentionally noindexed informatique guide stays out of the sitemap.
- `shipglowz_data/workflow/seo/shopglowz-legacy-url-map.md` records the current legacy-route strategy: all existing public routes remain live at the same URL and self-canonicalize because neither the domain nor route slugs move in this wave.
- Three usage hubs now build as `/guides/gifts`, `/guides/camping` and `/guides/tech-gadgets`; each exposes Temu and Amazon through the same typed destination contract with checked dates, destination notes and volatility reminders.

## Browser proof

Local browser proof already captured the main public scenarios on the built site served locally.

- Homepage `/`: ShopGlowz branding is visible, with discovery-first copy and no public TemuGlowz lead branding.
- Guides hub `/guides`: ShopGlowz guide hub loads correctly.
- Guide `/guides/kitchen-gadgets`: merchant disclosure cues are visible on product cards.
- Legacy public article route `/blog/ajustement-prix-temu`: live content still loads instead of breaking.
- Console: no error observed on the checked public routes.

## Merchant and volatility proof

The current public guide contract now exposes merchant-specific cues instead of pretending the site is tied to one merchant identity:

- merchant label on cards (`Marchand : ...`)
- checked date (`Vérifié : ...`)
- merchant CTA (`Voir chez <merchant>`)
- volatility reminder telling readers to verify price, stock, variants or seller on the merchant page

## Evidence files

- `shopglowz-home-desktop.png`
- `shopglowz-guides-desktop.png`
- `shopglowz-guide-kitchen-desktop.png`
- `shopglowz-guide-kitchen-mobile.png`
- `../../test-checklists/shopglowz-public-rebrand-and-multi-merchant.md`

## Scope limits

This proof confirms the implemented public rebrand wave only.

It does not prove:

- that all remaining multi-merchant guide pages are written
- that the dated educational guide wave is finished
- a future domain or slug migration; that work would require explicit 301 rules and post-deploy HTTP proof
- browser interaction and outbound-link behavior on the three newly added usage hubs; route this to `/108-sg-browser` before ship readiness
- that governance and historical archives are globally renamed from TemuGlowz

For those remaining items, the chantier still depends on further `102-sg-start` implementation before a clean `103-sg-verify` verdict is realistic.
