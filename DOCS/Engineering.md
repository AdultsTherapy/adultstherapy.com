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
| check | `npm run check:components` | The four shared blocks (masthead with its navigation, breadcrumbs, footer, bottom bar) are byte-identical on every route |
| check | `npm run check:site` | Title and description presence and length, canonicals, JSON-LD, link targets, sitemap membership, the one allowed external origin, no WordPress markup |
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

A page has three parts, and only one of them is edited in the page:

| Part | Where it lives |
| --- | --- |
| Body copy inside `<main>` | The route's `index.html` at the repository root — `about/index.html`, `therapy/cbt/index.html`, and so on. Edit it here. |
| `<title>`, meta description, the `h1` | The route's entry in `PAGES` in `SCRIPTS/normalize-export.mjs`. See DOCS/Marketing.md. |
| The four marked shared blocks | `SCRIPTS/page-shell.mjs`, installed by `npm run sync:components`. |

Editing the head metadata or the `h1` inside a page looks like it works and is
the wrong place — it is regenerated from `PAGES`, and `check:site` will not
catch the divergence because it only reads what is in the file.

## Changing the shared chrome

Every page carries four marked blocks:

```html
<!-- shared-masthead:start -->     …  <!-- shared-masthead:end -->
<!-- shared-breadcrumbs:start -->  …  <!-- shared-breadcrumbs:end -->
<!-- shared-footer:start -->       …  <!-- shared-footer:end -->
<!-- shared-bottombar:start -->    …  <!-- shared-bottombar:end -->
```

The primary navigation lives inside `shared-masthead`; there is no separate
nav block. Do **not** edit between the markers. Edit `SCRIPTS/page-shell.mjs`, then:

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
4. Add the route to `ROUTE_LABELS` in `SCRIPTS/page-shell.mjs`.
5. Add it to `NAV_ITEMS` in the same file if it belongs in the menu. A therapy
   approach also needs `MODALITY_ROUTES` in `SCRIPTS/normalize-export.mjs` —
   see "What links to what" in DOCS/Marketing.md.
6. Run `npm run sync:components` to install the shared chrome.
7. Run `npm run build`.

The page count is deliberately a load-bearing constant: a page that nobody
registered is a page nobody checked.

Step 4 is the one that fails quietly. Without a `ROUTE_LABELS` entry the
breadcrumb renders the literal word "Page" and the page's `BreadcrumbList`
markup is skipped altogether. Nothing fails the build; the page is just worse.

## The normalizer, and why you probably should not run it

`SCRIPTS/normalize-export.mjs` is the tool that produced every page in this
repository from the WordPress export. It is a migration tool, not part of the
build, and `npm run build` never calls it.

It is still wired up as `npm run normalize:export`, and **running it with its
defaults damages the tree.** Both `--source` and `--out` default to the
repository root, so it reads the already-normalized pages as if they were a
fresh export and writes the result back over them. Tried against the current
tree it rewrites fifteen of the seventeen pages and drops the `h1` from
`/sitemap/`. Nothing warns you.

The export it expects no longer exists in the working tree — it was replaced by
the normalized site. It survives in git history, at the last commit before the
migration:

```bash
# reconstruct the export somewhere outside the repository
mkdir -p /tmp/export
for f in $(git ls-tree -r f9426b9 --name-only | grep '\.html$'); do
  mkdir -p "/tmp/export/$(dirname "$f")"
  git show "f9426b9:$f" > "/tmp/export/$f"
done

# copy assets in first: the normalizer reads width and height off the image
# files themselves, and silently omits both if they are not there
mkdir -p /tmp/check && cp -r assets /tmp/check/
node SCRIPTS/normalize-export.mjs --source /tmp/export --out /tmp/check
```

Writing to a scratch `--out` and diffing against the repository is also the way
to confirm a change to the normalizer does what you meant, before it touches
any page. Done correctly, sixteen of the seventeen pages come back
byte-identical; `sitemap/index.html` is the exception, because its index block
is filled in afterwards by `npm run sync:components`.

Two reasons to go near it at all: a fresh export to re-import, or a change to
something it generates for every page — the head metadata in `PAGES`, the
JSON-LD in `schemaGraph`, or the internal linking in `MODALITY_ROUTES` and
`relatedFor`. For those, regenerate from the reconstructed export as above,
then `npm run sync:components` and `npm run build`.

## The one external origin

Pages reach exactly one host other than this domain: `fonts.googleapis.com`,
for the Alike and Lexend typefaces, with `fonts.gstatic.com` serving the WOFF2
files themselves. `check:site` enforces both ends of that — the stylesheet list
must be exactly the Google Fonts URL plus the two local stylesheets, and the
only `preconnect` hints allowed are those two origins, both of which must be
present. Anything else fails the build.

Font Awesome stays local on purpose. Its CDN serves the identical
`fa-solid-900.woff2` this repository already has, byte for byte, behind a
`all.min.css` of 73,890 bytes against the 2,309-byte subset in
`assets/fontawesome.css` — so moving it out would cost about 72 KB per page and
a second origin, and save nothing.

Because a font host receives a request from every visitor on every page load,
before any consent choice, Google Fonts is listed as a processor in
`privacy/data-events.json`, and `check:site` fails if it is removed from there.
If the fonts ever come back in-house, that entry and the preconnect allowlist
come out in the same commit.

## The other scripts

Not part of `npm run build`; reach for them when the situation calls for it.

| Script | When |
| --- | --- |
| `SCRIPTS/optimize-images.py` | `check:performance` rejected an image for exceeding the byte budget. This is the fix — the budget exists because one unoptimized photograph outweighed every page on the site put together. |
| `SCRIPTS/fetch-remote-images.mjs` | New copy references a remotely hosted image. Pulls it into `assets/img` so no page depends on a third-party host at render time, which `check:site` requires. |
| `SCRIPTS/build-favicon.mjs` | The practice mark changed. Rebuilds `assets/img/favicon.ico` from the source PNGs. |

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
