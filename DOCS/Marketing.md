# Structured Data

What this site tells search engines about the practice, where it comes from, and
how to change it.

## Where it is generated

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
amenities     Wheelchair accessible, free parking, telehealth available
```

**When any of these change in real life, change them in `schemaGraph` in the
same commit as the page copy.** A hours change that lands in the footer but not
in the schema puts the wrong hours in Google's knowledge panel.

## Two things this site deliberately does not emit

Both were present in the WordPress export and were removed during
normalization. Do not add them back without the conditions below.

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

### `FAQPage`

The export carried 67 `Question`/`Answer` pairs across 12 pages. **Zero** of
them appeared anywhere in the visible page content. Google requires FAQ content
to be present and visible on the page it is marked up on; invisible FAQ markup
is hidden content.

**Condition to add it back:** write the questions and answers into the page copy
first, where a visitor reads them. Then mark up that visible text. FAQ answers
are also genuinely useful content for this practice — the loss here is the
markup, not the idea.

## What was kept from the earlier schema work

The 2025 schema pass is why this site has real `Organization` detail, per-page
typing, and credential markup at all. Carried forward: medical business
classification, per-modality `knowsAbout`, the full credential list, address and
hours, service area, and page-level typing. Dropped alongside the two items
above: `BreadcrumbList` (no breadcrumb trail is rendered), `SearchAction` (there
is no site search), and duplicated `ImageObject` nodes.

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
