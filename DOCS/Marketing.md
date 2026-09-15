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
are the towns under "Nearby Communities" on the home page. Change one and
change the other, or the site claims a service area it does not show.

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

Two of them are worth knowing about specifically:

- A session fee of **$120 for 50 minutes** is now published on `/`, `/therapy/cbt/`,
  `/therapy/eft/`, `/therapy/emdr/` and `/therapy/gottman/`. The `Organization`
  node still says `priceRange: "$$"`, which is consistent but vaguer; if a
  Google Business Profile publishes a price, it should agree with this number.
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

These come from `PAGES` at the top of `SCRIPTS/normalize-export.mjs` — one entry
per route, carrying `title`, `description`, `heading` (the `h1`), `social`, and
`schema`. The same rule as the JSON-LD applies and for the same reason:

**Editing a `<title>`, a `<meta name="description">`, or an `<h1>` inside a page
will be overwritten the next time the normalizer runs.** Change the `PAGES`
entry, run `npm run build`, and commit the regenerated page.

`check:site` holds them to lengths that survive a search result:

| | Range | Why |
| --- | --- | --- |
| `title` | 30–65 characters | A listing truncates on pixel width. Past this the title is not longer in the result, it is cut, and the cut lands wherever the width runs out. |
| `description` | 70–158 characters | Same truncation, more room. A search engine rewrites the snippet from page text whenever it judges the description unhelpful, and a very short one invites that. |

Four titles ran past this before the limits existed — one at 86 characters — so
the check is there to stop the drift returning, not as a style preference.

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
