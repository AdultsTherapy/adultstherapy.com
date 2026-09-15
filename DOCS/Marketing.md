# What the Site Tells Search Engines

What this site tells search engines about the practice, where it comes from, and
how to change it.

## Structured data: where it is generated

Every page carries exactly **one** `application/ld+json` block containing one
`@graph`. It is generated, never hand-written:

- `SCRIPTS/normalize-export.mjs` → `schemaGraph(page)` builds the graph.
- `SCRIPTS/check-site.mjs` fails the build if a page has zero or more than one
  block, if the JSON does not parse, or if the graph is missing `Organization`
  or `WebSite`.
- `SCRIPTS/generate-sitemaps.mjs` reads `dateModified` out of the graph, and
  `check-site.mjs` fails if a page's sitemap `lastmod` and its JSON-LD date
  disagree.

To change what the site claims, edit `schemaGraph`, run `npm run build`, and
commit the regenerated pages. Editing the JSON inside a page by hand will be
overwritten and will not survive review.

## What the graph asserts

| Node | Scope | Carries |
| --- | --- | --- |
| `Organization` / `MedicalBusiness` / `ProfessionalService` | every page | Name, URL, telephone, email, address, geo, opening hours, price range, payment methods, accessibility features, area served, `knowsAbout` for each modality |
| `WebSite` | every page | Site name, publisher, language |
| `WebPage` / `MedicalWebPage` / `CollectionPage` / `ProfilePage` | per page | Canonical URL, name, description, `dateModified`, membership in the site |
| `Person` | `/about/` only | Elaine Dinwiddie, LPC — job title, employer, and each credential as `EducationalOccupationalCredential` |
| `Service` | the eight therapy pages | The approach as a service the practice offers — name, `serviceType`, provider, area served, and how to reach it |
| `FAQPage` | 12 routes | The "Common questions" block as rendered, from `SCRIPTS/faq.mjs` |
| `BreadcrumbList` | every page but `/` | The same trail the page renders, from `ROUTE_LABELS` |

Therapy pages use `MedicalWebPage`; `/therapy/`, `/skills/`, `/education/`, and
`/sitemap/` use `CollectionPage`; `/about/` uses `ProfilePage`; everything else
uses `WebPage`.

## The business facts, and where they live

These are asserted site-wide from one place, so they cannot drift between pages
the way they did in the export (`/` and `/about/` carried two different
longitudes):

```
telephone     +1-541-363-8817
email         elaine@adultstherapy.com
address       Klamath Falls, OR 97601, US
hours         Tuesday–Friday, 11:00–18:00
priceRange    $$
payment       Cash, Credit Card, Debit Card, Insurance
amenities     Telehealth available
delivery      Telehealth only — there is no office and no in-person session
areaServed    Oregon, Klamath Falls, and the nine towns the home page lists
```

`areaServed` is the one that is also visible copy: the towns in `schemaGraph`
are the towns in the reach block. That block is rendered from `reachBlock` in
`SCRIPTS/page-shell.mjs` and appears twice — as a band under the home page hero
where it is positioning, and as prose on `/contact/` where it is one practical
fact among several. Both presentations share one wording, so the towns can only
be changed in one place. Change that and `schemaGraph` together, or the site
claims a service area it does not show.

It leads on what the reach means rather than on the geography: "There is no
office to travel to", then the towns as evidence. That order is deliberate — a
list of place names that leads reads as keyword stuffing, and the sentence is
the reason a reader in Bly or Sprague River can use this practice at all.

**The practice is telehealth only.** The address is where it is based, not
somewhere a client goes. The schema used to claim wheelchair access and free
parking, which described premises that do not exist — an accessibility claim is
the worst kind to get wrong, because someone who needs it plans around it. If
in-person work ever starts, the amenities, the `/contact/` copy and the Google
Business Profile all change together.

**When any of these change in real life, change them in `schemaGraph` in the
same commit as the page copy.** A hours change that lands in the footer but not
in the schema puts the wrong hours in Google's knowledge panel.

## What this site deliberately does not emit

`AggregateRating` and `FAQPage` were both present in the export and both removed
during normalization. `FAQPage` has since come back, in full and visibly.
`AggregateRating` has not, and should not without the condition below.

### `AggregateRating`

The export's homepage asserted:

```json
"aggregateRating": { "ratingValue": "4.8", "reviewCount": "25", "bestRating": "5" }
```

There are no reviews anywhere on the site, and no review source behind that
number. Self-serving `AggregateRating` on a `LocalBusiness` is disallowed by
Google's review-snippet policy, the markup risks a manual action against the
domain, and for a licensed counselor an unsupported outcome claim is a
professional-conduct exposure, not just an SEO one.

**Condition to add it back:** real, attributable reviews, displayed on the page
they are marked up on, sourced from a platform whose terms permit re-marking
them. Then mark up what is visible — nothing more.

### `FAQPage` — restored

The export carried 67 `Question`/`Answer` pairs across twelve pages and **zero**
of them appeared in the visible page content, which is hidden content and earns
no credit. The condition for restoring them was to put the text on the page
first and then mark up what a visitor can read.

All 67 are now visible. They live in `SCRIPTS/faq.mjs`; `faqSection()` renders
them as a "Common questions" block and `schemaGraph()` marks up the same source.
`check:site` fails the build on any divergence — markup with no visible block, a
visible block with no markup, or marked-up text the page does not show.

These are the practice's own claims, written by the practice: session fees,
insurers accepted, records handling, HIPAA, and how long a course of treatment
usually runs. **They are now public, which means they have to stay true.** When
a fee changes, an insurer is added or dropped, or a policy shifts, edit
`SCRIPTS/faq.mjs` and rebuild — the page copy and the structured data both
follow from that one file.

Three of them are worth knowing about specifically:

- **The accepted insurance list is not in the FAQ alone.** The visible list on
  seven pages comes from `INSURANCE_BY_ROUTE` in `SCRIPTS/page-shell.mjs` and
  renders through the `insurance-cover` marker, so one edit lands everywhere and
  `sync:components --check` sees drift. Two FAQ answers also name the plans, and
  those are in `SCRIPTS/faq.mjs`. **Changing the plans means both files.** The
  site previously carried two different answers — ten plans in most places, five
  on `/therapy/gottman/` and in part of `/about/`, so `/about/` contradicted
  itself — and the five turned out to be stale rather than a real difference for
  couples work.

- Sessions **start at $150 for 50 minutes**, published on `/`, `/therapy/cbt/`,
  `/therapy/eft/` and `/therapy/emdr/`; couples are **$160 for 60 minutes** on
  `/` and `/therapy/gottman/`. Written as a floor because that is how Elaine put
  it. The `Organization` node still says `priceRange: "$$"`, which is consistent
  but vaguer; if a Google Business Profile publishes a price, it should agree
  with these. **The $160 has not been confirmed since the individual rate moved
  from $120 to $150** — it is above the floor, so it is not contradictory, but
  nobody has said it is current.
- The `/privacy/` answers describe records the **practice** keeps — health
  history, session notes, seven-year retention. The rest of that page describes
  what the **website** collects, which is nothing. Both are true and they are
  about different things; if a reader could confuse them, the fix is a sentence
  of framing on the page, not removing either.

## What was kept from the earlier schema work

The 2025 schema pass is why this site has real `Organization` detail, per-page
typing, and credential markup at all. Carried forward: medical business
classification, per-modality `knowsAbout`, the full credential list, address and
hours, service area, and page-level typing. Also dropped: `SearchAction`
(there is no site search) and duplicated `ImageObject` nodes.

`BreadcrumbList` was dropped too, because at the time no breadcrumb trail was
rendered. A trail is now rendered on every page, so the markup describes
something a visitor can see and click, and it is emitted again — built from the
same `ROUTE_LABELS` the visible trail uses, so the two cannot disagree. The home
page carries none: a one-item trail tells a search engine nothing.

If the visible breadcrumbs are ever removed, remove this markup in the same
commit.

## Titles, descriptions, and headings

`PAGES` at the top of `SCRIPTS/normalize-export.mjs` holds one entry per route —
`title`, `description`, `heading` (the `h1`), `social`, `schema` — but that file
is the migration tool, not part of the build. `npm run build` never runs it, so
**edit the title, description or `h1` in the page itself.** Keep the `PAGES`
entry in step in the same commit if you are changing something the normalizer
would need to reproduce; it is the record of intent, not the source the build
reads. See "The normalizer, and why you probably should not run it" in
DOCS/Engineering.md before running it against this tree.

A description quoted in more than one place — the `<meta>`, `og:description`,
`twitter:description` and the JSON-LD `description` — has to change in all of
them together. `check:site` compares them, so a partial edit fails the build
rather than shipping.

`check:site` holds them to lengths that survive a search result:

| | Range | Why |
| --- | --- | --- |
| `title` | 30–65 characters | A listing truncates on pixel width. Past this the title is not longer in the result, it is cut, and the cut lands wherever the width runs out. |
| `description` | 70–158 characters | Same truncation, more room. A search engine rewrites the snippet from page text whenever it judges the description unhelpful, and a very short one invites that. |

Four titles ran past this before the limits existed — one at 86 characters — so
the check is there to stop the drift returning, not as a style preference.

`check:site` also holds three things that a search result or a ranking depends
on, each added after the fault had already shipped:

| Check | The fault it stops |
| --- | --- |
| A description ending in an ellipsis | WordPress auto-excerpts cut mid-sentence. Thirty-nine pages shipped one, so the snippet Google printed was a fragment that restated the title and stopped. |
| British spellings | "The therapy approaches practised in Oregon" was the displayed description for `/therapy/`. This is an Oregon practice writing for Oregon readers. The pattern is narrow: `analyses` is deliberately absent, being the correct US plural. |
| A lazy first in-content image | That image is the likely Largest Contentful Paint element, so `loading="lazy"` defers the thing the score measures. Pages that preload an image instead are exempt, which is why `/` passes. |

## What links to what

Two generated structures carry the internal linking, both in
`SCRIPTS/normalize-export.mjs`:

- **`MODALITY_ROUTES`** turns each approach heading on `/therapy/` into a link
  to that approach's page. It is keyed on the heading text the export already
  wrote, so the copy stays as it is and only the destination is added.
- **`relatedFor(route)`** builds the closing "Other therapy approaches" list on
  each therapy page, the approach list on `/skills/` and `/education/`, and the
  practice list on `/about/` and `/therapy/`. Its items come from `NAV_ITEMS` in
  `SCRIPTS/page-shell.mjs`.

**Adding a therapy page takes two edits, not one.** Adding it to `NAV_ITEMS`
puts it in the navigation, the sitemap page, and every sibling's closing list
automatically — but its heading on `/therapy/` stays unlinked until the heading
text is also added to `MODALITY_ROUTES`.

Before this existed, every page carried exactly sixteen internal links and all
sixteen were the shared chrome: `/therapy/` described all seven approaches and
linked to none of their pages.

## The share cards

Each `PAGES` entry names a `social` key — one of `practice`, `therapy`,
`couples`, `military`, `skills`, `education`, `about`. It selects
`assets/social/<key>.png` as the Open Graph and Twitter image, and its alt text
from `SOCIAL_ALT` in the same file. The images are generated by
`SCRIPTS/generate-social-images.mjs` and `check:site` fails if any page is
missing an image or its alt text.

This is what renders when someone pastes a link into a message or a post, so it
is worth looking at rather than assuming.

## Crawling: robots and sitemaps

- `robots.txt` allows everything and points at `sitemap_index.xml`.
- `SCRIPTS/generate-sitemaps.mjs` writes two maps: `therapy-sitemap.xml` for the
  approach pages and `page-sitemap.xml` for everything else, with
  `sitemap_index.xml` over them.
- `head()` writes the per-page `robots` value. Every page is `index, follow,
  max-image-preview:large, max-snippet:-1, max-video-preview:-1`; a `PAGES`
  entry with `noindex: true` gets `noindex, follow` instead. Only `404.html`
  uses it, and `check:site` fails if the 404 is ever indexable.

`lastmod` in the sitemaps is read from each page's `dateModified`, which comes
from a single constant — `MODIFIED` at the top of `SCRIPTS/normalize-export.mjs`
— shared by all seventeen pages. **It does not update itself.** Bump it when a
change to the copy is worth telling a crawler about; leaving it alone means
every page keeps claiming the same modification date.

## Verifying a change

```bash
npm run check:site     # parse, single block, required nodes, date agreement
```

Then, for anything that changes a public claim:

- [Google Rich Results Test](https://search.google.com/test/rich-results) on the
  changed URL.
- [Schema.org validator](https://validator.schema.org/) for type correctness.
- Google Search Console → Enhancements, a few days after deploy, to confirm
  nothing regressed.
