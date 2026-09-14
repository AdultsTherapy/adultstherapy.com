# Adults and Couples Therapy of Oregon

The website for Adults and Couples Therapy of Oregon — a trauma-informed,
resilience-oriented practice treating depression, anxiety, and relationship
issues, run by Elaine Dinwiddie, LPC (Oregon licence C5403).

Live at **[adultstherapy.com](https://adultstherapy.com)**.

## What this is

A normalized static site: 17 hand-editable HTML pages sharing one template, one
stylesheet, and one script, deployed to GitHub Pages by GitHub Actions. There is
no build framework and no dependency tree — every script in `SCRIPTS/` uses only
the Node standard library.

```
index.html          404.html            Home and not-found
therapy/            Talk therapy, CBT, DBT, Gottman, mindfulness, EFT, EMDR, military
skills/             Practical techniques to use between sessions
education/          The nervous system and the brain, explained
about/              Elaine's training, credentials, and approach
terms/  privacy/  sitemap/              Practice information
assets/             site.css, site.js, fontawesome.css, fonts, images, social cards
SCRIPTS/            Generators and checks — the whole toolchain
DOCS/               Deployment workflow, structured data, task list
```

## Working on it

```bash
npm run preview     # http://127.0.0.1:8766
npm run build       # generate, check, and build the deploy artifact
```

`npm run build` is the gate. It generates the social cards and sitemaps, runs
four checks, and assembles `_site/`. If it passes locally it passes in CI; if it
fails, the site does not deploy.

| Check | Enforces |
| --- | --- |
| `check:components` | The shared chrome is identical on every route |
| `check:site` | Titles, canonicals, JSON-LD, link targets, sitemap membership, no WordPress markup |
| `check:accessibility` | One `h1`, skip link, alt text, image dimensions, heading order, menu ARIA |
| `check:performance` | Page, asset, and image byte budgets; no inline styles or scripts; no analytics before consent |

**Editing page content:** edit the route's `index.html`, inside `<main>`.

**Editing the header, navigation, or footer:** edit `SCRIPTS/page-shell.mjs` and
run `npm run sync:components`. Never edit between the `<!-- shared-*:start -->`
markers in a page — the next sync overwrites it, and `check:components` fails
the build if a page has drifted.

See [DOCS/DEPLOYMENT_WORKFLOW.md](DOCS/DEPLOYMENT_WORKFLOW.md) for the full
workflow and [DOCS/SCHEMA_IMPROVEMENTS.md](DOCS/SCHEMA_IMPROVEMENTS.md) for what
the site's structured data claims and how to change it.

## Deploying

Commit to `main` and push. `.github/workflows/deploy-pages.yml` builds, checks,
and publishes. Nothing else is needed — no second repository, no rsync, no
manual promotion.

## Privacy posture

This is a therapy practice, so the site is deliberately quiet:

- No analytics load until a visitor explicitly allows them, and Global Privacy
  Control or Do Not Track keeps them off entirely.
- No forms, no chat widget, no intake fields — nothing a visitor types is
  collected, because there is nothing to type.
- YouTube embeds do not load until the visitor presses a button, so no request
  reaches Google before then.
- No third-party CDN, font host, or image host: every asset is served from this
  domain.

`privacy/data-events.json` is the machine-readable manifest of every event and
processor, and `check:site` fails if it drifts from that list.

## Credentials

Gottman Couples Therapy Level 2 Practitioner · EMDR Level 2 · Certified Clinical
Trauma Professional (CCTP I) · Professionally Trained Emotional Freedom
Therapist · Star Behavioral Health Providers trained provider for
military-focused care · Member, American Counseling Association (ACA) and the
Association for Comprehensive Energy Psychology (ACEP).
