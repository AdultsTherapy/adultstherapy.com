# **Adultstherapy.com Migration Review**

**Scope:** 16 route pairs compared page by page — local rebuild (http://localhost:8766) against live WordPress static export (https://adultstherapy.com).

**Date:** 14 September 2026

**Method:** Every text block, link, image and meta tag extracted from both sites and diffed programmatically; visual layer verified with computed styles and side-by-side screenshots at 1534px and 500px.

**Verdict:** **Not safe to deploy as-is** — 1 blocker, 9 major findings.

## **Findings**

| Severity | Page | What's wrong | Evidence&nbsp;&nbsp; |
| :---- | :---- | :---- | :---- |
| **BLOCKER** | /therapy/gottman/ | The entire closing CTA section is gone. Heading, both paragraphs and **both conversion links** (the only mailto: on the page) are absent locally. Local's page now ends at "Transform Your Relationship with Gottman Method Therapy" and goes straight into the footer. | Live only: \<h2\>Save Your Relationship Today\!; "Don't let another day go by feeling disconnected from your partner. The Gottman Method has helped thousands of couples rebuild their relationships and find lasting love. Get started now with your free consultation\!"; "Same-week appointments available • Telehealth sessions throughout Oregon • CIGNA, Moda, CHA, TriWest, Atrio accepted"; tel: "Call Now: 541-363-8817"; mailto:elaine@adultstherapy.com "Get Your Free Consultation" |
| **MAJOR** | talk-therapy, cbt, dbt, emdr, military, skills, education, about | Body images are **flush against the left viewport edge**, \~340px left of the centred text column, leaving a large white gap on the right. They also lost their fixed banner crop, so heights now vary wildly. | /skills/ live: 1411x350 @x54-1465 (centred, centre 760). Local: 840x530 @x0-840 (centre 420\) while the h1 centre is 743\. /education/ local 840x473 @x0-840, heading at x340-1180 |
| **MAJOR** | All 16 (footer) | Footer restyled and broken: background changed, separator rules gone, credential list now renders with **visible disc bullets**, and logos are shrunk and unaligned so text and logos collide. | Live: panel rgb(153, 180, 223), 4 × \<hr\>, logos right-aligned (ACEP 336x130, badge/seal 150x150), footer 1241px tall. Local: rgb(126, 103, 155), hr count 0, ul list-style: disc, ACEP 217x84, badge/seal 84x84 at ragged x822/925/897/729, footer 570px tall |
| **MAJOR** | /therapy/gottman/, /therapy/talk-therapy/ | CTA buttons lost all button styling and render as plain inline text — on Gottman the two run together as "Schedule Your First SessionContact Me". | Live "Schedule Your Consultation": 261x44 bg:rgb(102,175,165) pad:12px 24px rad:9999px fw:700. Local: 213x20 bg:transparent pad:0px rad:0px. Same for "Schedule Your First Session" (260x44 → 212x20) and "Contact Me" (137x44 → 89x20) |
| **MAJOR** | All 16 (header) | Type scale reduced and vertical rhythm compressed throughout the masthead; breadcrumb is smaller and lower contrast. | Site title 42px → 38px (width 1058 → 957); tagline 16px → 15px; credentials 13.28px → 13px; nav y211 → y180 (header 31px shorter); breadcrumb 16px/rgb(73,80,87) → 14px/rgb(108,108,114) |
| **MAJOR** | / | Hero column narrowed 800 → 736px so the subtitle wraps to 3 lines instead of 2; CTA buttons enlarged and filled; the "Therapy I practice" pill's text flipped black → white. | Hero \<h2\> 800x120 → \<h1\> 736x125; subtitle 800x58 → 736x87; buttons 270x54 pad:12px 24px fw:600 bg:transparent → 286x65 pad:16px 32px fw:700 bg:rgba(255,255,255,0.1); pill col:rgb(0,0,0) → col:rgb(255,255,255) |
| **MAJOR** | / | "Get Your Freedom from Depression and Anxiety Now\!" now wraps to two lines and the two-column split changes — text column narrows, image grows. | Live h2 w1411 (one line); local w840 (two lines). Body column 490px → 404px |
| **MAJOR** | /sitemap/ | Page is now excluded from search indexing; live was indexable. | Live robots: index, follow, max-image-preview:large… → Local robots: noindex, follow |
| **MAJOR** | /therapy/eft/ | \<title\> drops "Evidence-Based", the site's core positioning keyword used in most other titles. | Live: "…Therapy in Oregon | **Evidence-Based** Energy Psychology" → Local: "…Therapy in Oregon | Energy Psychology" |
| **MAJOR** | Therapy pages | Heading icons lost their brand colour and their gap, so the icon is glued to the heading text; divider icons shrank. | h1 icon live col:rgb(126,103,155) mr:12px fs:28.8px → local col:rgb(108,108,114) mr:0px fs:32px. Live markup had style="color:\#7e679b; margin-right:12px; font-size:0.9em"; local \<i class="fas fa-brain"\> with no replacement rule. Divider icons 24px → 19px |
| MINOR | /terms/, /privacy/, /therapy/cbt/, /sitemap/, all | Heading levels shifted (copy intact) — consistent with the intended one-h1-per-page rule. | /terms/ H2 Web Site Terms and Conditions of Use → H1, H3 1\. Terms → H2; /privacy/ H2 Privacy Policy → H1; cbt H3 Break Free… → H2; hero tagline/credentials H4/H5 → \<p\> (text verbatim) |
| MINOR | /therapy/eft/, /therapy/emdr/ | A credential claim is softened in metadata only. Local is the more accurate of the two (the site's own credential line says "Professionally Trained Emotional Freedom Therapist"), but the public claim did change. | Live desc "**Certified** EFT therapy in Oregon" → Local "**Trained** EFT therapy in Oregon". EMDR og:desc drops "Certified EMDR Level 2 therapist" |
| MINOR | /terms/ | Title drops "Website". | Live "…of Oregon **Website**" → Local "Terms and Conditions of Use | Adults and Couples Therapy of Oregon" |
| MINOR | /sitemap/ | Link label changed and apostrophe restyled. | "Therapy" → "Therapy I practice"; "Gottman's" → "Gottman’s" |
| MINOR | /does-not-exist | The three recovery links run together with no separators. | Renders as "Home Therapy I practice Site navigation" |
| MINOR | / | The consent panel overlays the hero CTA buttons on first load at desktop width. | Panel covers "Call Now: 541-363-8817" / "Email for Appointment" |

## **Genuinely equivalent**

/therapy/, /therapy/mindfulness/, /therapy/eft/, /therapy/emdr/, /therapy/dbt/, /terms/ and /privacy/ carry every paragraph, list item, heading, caption and button label from live, with matching images and links — they are affected only by the site-wide design findings above.

## **Verified intact**

> * All 16 routes return 200 on both sites.  
> * Every fact matches exactly: phone 541-363-8817, elaine@adultstherapy.com, "LPC, License \# C5403", ACA/ACEP memberships, Star Behavioral Health badge, and the full insurance list ("Cascade Health Alliance (CHA), Oregon Health Plan (OHP), Atrio, Aetna, Moda, Providence, Regence, Cigna, TriWest, and Evernorth").  
> * All images present with identical filenames and order; none broken.  
> * All five external links survive: counseling.org, energypsych.org, oregon.gov/oblpct, the OBLPCT licence lookup for C5403, and gottman.com/blog/what-is-the-sound-relationship-house/. (emdria.org appears on neither site.)  
> * All 16 internal links resolve 200; /does-not-exist returns a real 404 with a working page.  
> * Hamburger appears at ≤959px as a 44×44 target, opens, and nests all eight Therapy sub-items.  
> * Both "Load video" buttons swap data-external-src into a live 560×315 youtube-nocookie frame, with nothing requested from YouTube beforehand.  
> * "Continue without analytics" dismisses the panel and stores denied with zero Google requests; "Allow analytics" loads gtag with npa=1 and anonymize\_ip=true; "Privacy choices" reopens it.  
> * No horizontal overflow at 500px on any page.

## **Fixes the migration introduced**

> * Alt text added to all four footer credential logos (live had alt="").  
> * Missing EMDR nav item added on /therapy/eft/, and the EFT entry added to the sitemap.  
> * Repaired live's broken header on /therapy/mindfulness/, where the logo link and hidden h1 both read "Mindfulness" instead of the site title.  
> * Normalised tel:+1 541-363-8817 (which contains a space) to tel:+15413638817 throughout.  
> * SBHP badge added to the footer on /therapy/dbt/ and /sitemap/, where live omitted it.  
> * \~17 empty \<h3\> elements removed from /skills/, /about/ and /education/.  
> * Explicit width/height added to images, improving cumulative layout shift.

## **Verdict**

Not safe to deploy as-is. The content side of the migration is almost perfect — one missing block out of sixteen pages, every fact, image and external link preserved, and several genuine fixes — but that one omission is the Gottman page's closing call-to-action, including its only email conversion link, on the page most likely to convert couples. The design side is the bigger problem: the claim that the rebuild matches the live site doesn't hold. Body images sit flush against the left edge of the viewport on eight pages, the footer's credential block has lost its styling entirely and now renders as a bulleted list with colliding logos on every page, and three CTA buttons render as plain text. Those are not subtle regressions; a visitor would notice them immediately. Restore the Gottman section, fix the image centring and banner crop, rebuild the footer memberships block, and add the missing .btn styling to the three orphaned CTAs — then this is ready. The header type scale, hero width and /sitemap/ noindex are worth a deliberate yes/no from whoever owns the design, since they may well be intentional.