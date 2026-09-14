# Deployment Workflow

How adultstherapy.com gets from an edit to the live site.

## The short version

Commit to `main`. GitHub Actions builds the artifact, runs every check, and
publishes to GitHub Pages. There is no second repository, no rsync, and no
manual promotion step.

```bash
# from the repository root
npm run build     # generate → check → build the _site artifact
git add -A
git commit -m "Describe the change"
git push          # main deploys itself
```

If `npm run build` fails locally, the push will fail in CI for the same reason.
Fix it before pushing — the build is the gate, not a formality.

## What `npm run build` does

| Stage | Command | What it enforces |
| --- | --- | --- |
| generate | `npm run social` | Open Graph PNGs for every social variant, rendered from `SCRIPTS/generate-social-images.mjs` |
| generate | `npm run sitemap` | `page-sitemap.xml`, `therapy-sitemap.xml`, and `sitemap_index.xml` from the pages that actually exist |
| check | `npm run check:components` | Shared chrome (topbar, nav, masthead, footer, legal bar) is byte-identical on every route |
| check | `npm run check:site` | Titles, canonicals, JSON-LD, link targets, sitemap membership, no WordPress markup |
| check | `npm run check:accessibility` | One `h1`, skip link, image alt text and dimensions, ARIA state on the menu, heading order |
| check | `npm run check:performance` | Page and asset byte budgets, no inline `<style>`, no inline scripts, no pre-consent analytics |
| deploy | `npm run deploy:artifact` | Copies only allowlisted files into `_site/` and re-verifies every link inside the artifact |

`_site/` is generated and gitignored. CI rebuilds it; never edit it by hand.

## The two workflows

- `.github/workflows/verify-static-export.yml` — runs on every push and pull
  request. Builds, then asserts `git status --porcelain` is empty, so generated
  files (sitemaps, social images, synced chrome) must already be committed and
  current.
- `.github/workflows/deploy-pages.yml` — runs on push to `main`. Same build,
  then uploads `_site/` as the Pages artifact and deploys it.

Both pin every action to a commit SHA. Update the SHA deliberately; do not
float to a tag.

## Changing a page

Page content lives in the route's `index.html` at the repository root
(`about/index.html`, `therapy/cbt/index.html`, and so on). Edit the content
inside `<main>` and leave the marked shared blocks alone.

## Changing the shared chrome

Every page carries marker comments:

```html
<!-- shared-nav:start -->  …  <!-- shared-nav:end -->
```

Do **not** edit between the markers. Edit `SCRIPTS/page-shell.mjs`, then:

```bash
npm run sync:components
```

That rewrites the block on all 17 pages. `npm run check:components` fails the
build if any page drifts from the shell — which is the failure this site had
before it was normalized, when every page carried a slightly different
hand-edited navigation.

## Adding a page

1. Create the route folder and `index.html`.
2. Add the route root to `ROUTE_ROOTS` in `SCRIPTS/static-site.mjs` if it is a
   new top-level section.
3. Bump `EXPECTED_SHARED_PAGE_COUNT` in the same file.
4. Run `npm run sync:components` to install the shared chrome.
5. Run `npm run build`.

The page count is deliberately a load-bearing constant: a page that nobody
registered is a page nobody checked.

## Previewing locally

```bash
npm run preview     # serves the repository root at http://127.0.0.1:8766
```

## Retired: the preview → production flow

Until September 2026 this site deployed by syncing a second repository,
`preview.adultstherapy.com`, into this one with `rsync` — via
`deploy-to-production.sh`, `deploy-via-pr.sh`, and
`cleanup-deployment-branches.sh`, all driven from hardcoded macOS paths.

That flow is gone. The preview repository had drifted out of sync, the scripts
referenced paths that no longer existed, and nothing verified what shipped. The
scripts were deleted along with this section of the old document. If you find a
reference to `preview.adultstherapy.com` anywhere, it is stale: `main` in this
repository is the only source of the live site.
