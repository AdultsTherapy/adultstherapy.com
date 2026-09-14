You are reviewing a website migration. Compare two versions of the same site, page by
page, and find what the migration LOST or BROKE.

  LOCAL (new, under review):  http://localhost:8766
  LIVE  (old, in production): https://adultstherapy.com

Background: the live site is a raw WordPress static export. The local site is that same
content rebuilt onto one shared template — no WordPress markup, no inline styles, no
third-party CDNs. The content is supposed to be identical. Your job is to catch anything
that silently went missing or now renders wrong.

Compare these 16 route pairs, in this order:

  /                          /therapy/                  /therapy/talk-therapy/
  /therapy/cbt/              /therapy/dbt/              /therapy/gottman/
  /therapy/mindfulness/      /therapy/eft/              /therapy/emdr/
  /therapy/military/         /skills/                   /education/
  /about/                    /terms/                    /privacy/
  /sitemap/

For each pair, open both and check:

1. COPY — Is every paragraph, list item, heading, figure caption, and button label on the
   live page also on the local page? Read them side by side. Quote anything missing.
2. IMAGES — Same images, in the same places, not stretched or cropped oddly? Any image
   that renders live but is broken/absent locally?
3. LINKS — Same set of links, pointing to the same destinations? Click the internal ones
   locally and confirm none 404. Check external links (counseling.org, energypsych.org,
   the Oregon licence lookup, gottman.com, emdria.org) survived.
4. FACTS — Phone number, email, business hours, credentials, licence number, professional
   memberships, insurance/payment wording. Any disagreement between the two is a bug,
   and say which version says what.
5. METADATA — Compare <title> and <meta name="description">. Flag any local title that
   lost meaningful keywords the live one had.
6. LAYOUT — Anything visually broken locally: overflowing text, collapsed grid, unreadable
   contrast, an element off the edge. Check at both ~1280px and ~500px browser width.

Also check these behaviours on the local site only:
  - Below ~960px wide a hamburger appears, opens the menu, and the Therapy submenu nests.
  - /education/ and /therapy/military/ have YouTube embeds behind a "Load video" button —
    confirm the button loads the video.
  - The analytics consent panel: "Continue without analytics" dismisses it and no Google
    request is made; "Allow analytics" loads it. The "Privacy choices" button reopens it.
  - Visit http://localhost:8766/does-not-exist — confirm a real 404 page with working links.

DO NOT flag these — every one is a deliberate decision, not an oversight:
  - Missing wp-block-* classes, wp-content/ or wp-includes/ paths, Yoast comments
  - No inline <style> blocks or inline <script> tags
  - Font Awesome self-hosted instead of loaded from cdnjs; images local instead of Unsplash
  - Google Analytics not loading until the visitor consents
  - The homepage h1: live has a hidden h1 plus a visible h2; local promotes the visible
    heading to h1. One h1 per page is intended.
  - The removed AggregateRating (4.8/5, 25 reviews) and FAQPage schema — removed on purpose
  - Removed BreadcrumbList / SearchAction / duplicate ImageObject structured data
  - Missing srcset image variants
  - The preview.adultstherapy.com link-rewriting script being gone
  - Different fonts loading mechanism (self-hosted Alike/Lexend)

THE DESIGN IS NOT EXEMPT. The local site must look like the live site. Report every
visual difference you can see: colours, button styling, spacing, type size and weight,
alignment, section backgrounds, header and footer layout, hero treatment, card styling,
and any element present on one and absent on the other. Treat a visual difference as a
MAJOR finding, not a cosmetic one, unless it is one of the exemptions listed above.

Report as a table, most severe first:

  | Severity | Page | What's wrong | Evidence (quote or URL) |

Severity: BLOCKER (content or a working link is gone), MAJOR (visibly broken layout, wrong
fact, meaningful SEO loss), MINOR (cosmetic).

If a page is genuinely equivalent, say so in one line — do not invent findings. Finish with
a one-paragraph verdict: is this safe to deploy over the live site?