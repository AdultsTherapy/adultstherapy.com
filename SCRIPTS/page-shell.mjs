#!/usr/bin/env node

/**
 * The shared page shell, matching the site's existing design: one purple
 * masthead band carrying the title, credentials and centred navigation, a
 * breadcrumb strip, a blue membership footer, and the floating contact button.
 *
 * Every marker block below is written into every page by
 * SCRIPTS/sync-shared-page-components.mjs, so the chrome cannot drift from one
 * route to the next — the failure this site had before it was normalized.
 */

export const TELEPHONE = "+15413638817";
export const TELEPHONE_LABEL = "541-363-8817";
export const EMAIL = "elaine@adultstherapy.com";
export const PRACTICE = "Adults and Couples Therapy of Oregon";

export const NAV_ITEMS = Object.freeze([
  {
    href: "/therapy/",
    label: "Therapy",
    children: [
      { href: "/therapy/talk-therapy/", label: "Talk Therapy" },
      { href: "/therapy/cbt/", label: "Cognitive Behavioral Therapy" },
      { href: "/therapy/dbt/", label: "Dialectical Behavior Therapy" },
      { href: "/therapy/gottman/", label: "Gottman&#8217;s Couple Therapy" },
      { href: "/therapy/mindfulness/", label: "Mindfulness" },
      { href: "/therapy/eft/", label: "Emotional Freedom Technique" },
      { href: "/therapy/emdr/", label: "EMDR Therapy" },
      { href: "/therapy/military/", label: "Military" },
    ],
  },
  { href: "/skills/", label: "Skills" },
  { href: "/education/", label: "Education" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
]);

export const LEGAL_ITEMS = Object.freeze([
  { href: "/terms/", label: "Terms" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/sitemap/", label: "Sitemap" },
]);

/** Breadcrumb label for each route, matching the export's own trail. */
export const ROUTE_LABELS = Object.freeze({
  "/": "Home",
  "/therapy/": "Therapy",
  "/therapy/talk-therapy/": "Talk Therapy",
  "/therapy/cbt/": "Cognitive Behavioral Therapy",
  "/therapy/dbt/": "Dialectical Behavior Therapy",
  "/therapy/gottman/": "Gottman&#8217;s Couple Therapy",
  "/therapy/mindfulness/": "Mindfulness",
  "/therapy/eft/": "Emotional Freedom Technique",
  "/therapy/emdr/": "EMDR Therapy",
  "/therapy/military/": "Military",
  "/skills/": "Skills",
  "/education/": "Education",
  "/about/": "About",
  "/contact/": "Contact",
  "/terms/": "Terms",
  "/privacy/": "Privacy",
  "/sitemap/": "Sitemap",
  "/404.html": "Page not found",
});

const currentAttribute = (href, route) => (href === route ? ' aria-current="page"' : "");

const navMarkup = (route) => {
  const items = NAV_ITEMS.map((item) => {
    if (!item.children) {
      return `          <li><a href="${item.href}"${currentAttribute(item.href, route)}>${item.label}</a></li>`;
    }
    const children = item.children
      .map((child) => `              <li><a href="${child.href}"${currentAttribute(child.href, route)}>${child.label}</a></li>`)
      .join("\n");
    const parent =
      route.startsWith(item.href) && route !== item.href
        ? ' aria-current="true"'
        : currentAttribute(item.href, route);
    return [
      '          <li class="has-sub">',
      `            <a href="${item.href}"${parent}>${item.label}</a>`,
      '            <ul class="sub">',
      children,
      "            </ul>",
      "          </li>",
    ].join("\n");
  }).join("\n");

  return `      <nav class="nav" aria-label="Primary">
        <div class="nav__inner">
          <button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">
            <span class="nav__toggle-icon" aria-hidden="true"></span>
          </button>
          <ul class="nav__menu" id="nav-menu">
${items}
          </ul>
        </div>
      </nav>`;
};

export const masthead = (route) => `  <!-- shared-masthead:start -->
  <header class="masthead">
    <div class="masthead__inner">
      <p class="masthead__title"><a href="/">${PRACTICE}: Evidence-Based</a></p>
      <p class="masthead__tagline">Specialized treatment for depression, anxiety, and relationship issues with proven therapeutic approaches</p>
      <p class="masthead__credentials">Gottman Couples Therapy Level 2 Practitioner <span aria-hidden="true">&bull;</span> EMDR Level 2 <span aria-hidden="true">&bull;</span> Certified Clinical Trauma Professional (CCTP I) <span aria-hidden="true">&bull;</span> Professionally Trained Emotional Freedom Therapist</p>
      <hr class="masthead__rule">
${navMarkup(route)}
    </div>
  </header>
  <!-- shared-masthead:end -->`;

export const breadcrumbs = (route) => {
  const trail = [{ href: "/", label: "Home" }];
  if (route !== "/") {
    const parent = route.startsWith("/therapy/") && route !== "/therapy/"
      ? [{ href: "/therapy/", label: "Therapy" }]
      : [];
    trail.push(...parent, { href: route, label: ROUTE_LABELS[route] || "Page" });
  }
  const items = trail
    .map(({ href, label }, index) =>
      index === trail.length - 1
        ? `      <li aria-current="page">${label}</li>`
        : `      <li><a href="${href}">${label}</a></li>`,
    )
    .join("\n");
  return `  <!-- shared-breadcrumbs:start -->
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumbs">
${items}
    </ol>
  </nav>
  <!-- shared-breadcrumbs:end -->`;
};

export const footer = () => `  <!-- shared-footer:start -->
  <footer class="footer">
    <div class="footer__contact">
      <a class="btn" href="tel:${TELEPHONE}">${TELEPHONE_LABEL}</a>
      <a class="btn" href="mailto:${EMAIL}">${EMAIL}</a>
    </div>
    <div class="footer__memberships">
      <ul>
        <li>
          <a href="https://www.counseling.org/" target="_blank" rel="noopener noreferrer">American Counseling Association member</a>
          <a href="https://www.counseling.org/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/ACA-logo-true.png" alt="American Counseling Association" width="230" height="84" loading="lazy" decoding="async"></a>
        </li>
        <li>
          <a href="https://energypsych.org/" target="_blank" rel="noopener noreferrer">Association for Comprehensive Energy Psychology (ACEP) member</a>
          <a href="https://energypsych.org/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/logo-ACEP-01.svg" alt="Association for Comprehensive Energy Psychology" width="336" height="130" loading="lazy" decoding="async"></a>
        </li>
        <li>
          <span>Trained Provider for Military-Focused Care</span>
          <img src="/assets/img/SBHP-Web-Badge-Provider.png" alt="Star Behavioral Health Providers trained provider badge" width="150" height="150" loading="lazy" decoding="async">
        </li>
        <li>
          <a href="https://oblpct.us.thentiacloud.net/webs/oblpct/register/#/profile/C5403/0/0/10/5f8a06ad0405c816a4245ae2" target="_blank" rel="noopener noreferrer">Licensed in the State of Oregon with the Board of Licensed Professional Counselors and Therapists as a LPC, License&nbsp;#&nbsp;C5403</a>
          <a href="https://www.oregon.gov/oblpct" target="_blank" rel="noopener noreferrer"><img src="/assets/img/oregon-seal-black.svg" alt="State of Oregon seal" width="150" height="150" loading="lazy" decoding="async"></a>
        </li>
      </ul>
    </div>
  </footer>
  <!-- shared-footer:end -->`;

export const bottombar = (route) => {
  const links = LEGAL_ITEMS.map(
    ({ href, label }) => `        <li><a href="${href}"${currentAttribute(href, route)}>${label}</a></li>`,
  ).join("\n");
  return `  <!-- shared-bottombar:start -->
  <div class="bottombar">
    <ul class="bottombar__links">
${links}
    </ul>
    <p class="bottombar__legal">&copy; Adults Therapy of Oregon</p>
  </div>
  <a class="floating-top" href="#top" aria-label="Back to top"><i class="fas fa-arrow-up" aria-hidden="true"></i></a>
  <a class="floating-contact" href="tel:${TELEPHONE}" aria-label="Call ${TELEPHONE_LABEL}"><span aria-hidden="true">&#128222;</span></a>
  <!-- shared-bottombar:end -->`;
};

/** The /sitemap/ page is generated from the same inventory the navigation uses. */
export const siteIndex = () => {
  const therapy = NAV_ITEMS.find((item) => item.href === "/therapy/");
  const primary = [{ href: "/", label: PRACTICE }, ...NAV_ITEMS.filter((item) => item.href !== "/therapy/")]
    .map(({ href, label }) => `        <li><a href="${href}">${label}</a></li>`)
    .join("\n");
  const approaches = therapy.children
    .map(({ href, label }) => `        <li><a href="${href}">${label}</a></li>`)
    .join("\n");
  const legal = LEGAL_ITEMS.map(
    ({ href, label }) => `        <li><a href="${href}">${label}</a></li>`,
  ).join("\n");

  return `      <!-- site-index:start -->
      <h2>Pages</h2>
      <ul>
${primary}
      </ul>
      <h2>Therapy approaches</h2>
      <ul>
        <li><a href="/therapy/">Therapy</a></li>
${approaches}
      </ul>
      <h2>Practice information</h2>
      <ul>
${legal}
      </ul>
      <!-- site-index:end -->`;
};

export const SHARED_BLOCKS = Object.freeze([
  { marker: "shared-masthead", render: masthead },
  { marker: "shared-breadcrumbs", render: breadcrumbs },
  { marker: "shared-footer", render: footer },
  { marker: "shared-bottombar", render: bottombar },
]);

/**
 * Which plans each page says are accepted.
 *
 * This was the same ten names pasted into five pages as prose, which is how the
 * site ended up with two different answers to the most consequential question a
 * visitor asks. /therapy/gottman/ names a shorter set, and that is preserved
 * rather than flattened: couples work is frequently covered by fewer plans, so
 * the difference may be correct and is Elaine's to confirm, not a formatting
 * detail to tidy away.
 */
const STANDARD_PLANS = Object.freeze([
  "Cascade Health Alliance (CHA)",
  "Oregon Health Plan (OHP)",
  "Atrio",
  "Aetna",
  "Moda",
  "Providence",
  "Regence",
  "Cigna",
  "TriWest",
  "Evernorth",
]);

const COUPLES_PLANS = Object.freeze(["Cigna", "Moda", "Cascade Health Alliance (CHA)", "TriWest", "Atrio"]);

export const INSURANCE_BY_ROUTE = Object.freeze({
  "/": STANDARD_PLANS,
  "/about/": STANDARD_PLANS,
  "/contact/": STANDARD_PLANS,
  "/therapy/eft/": STANDARD_PLANS,
  "/therapy/emdr/": STANDARD_PLANS,
  "/therapy/talk-therapy/": STANDARD_PLANS,
  "/therapy/gottman/": COUPLES_PLANS,
});

export const insuranceCover = (route) => {
  const plans = INSURANCE_BY_ROUTE[route];
  if (!plans) return null;
  const items = plans.map((plan) => `              <li>${plan}</li>`).join("\n");
  return `          <!-- insurance-cover:start -->
          <div class="cover">
            <h3 class="cover__title">Insurance accepted</h3>
            <ul class="cover__list">
${items}
            </ul>
            <p class="cover__note">If your plan is not listed, ask during the consultation call.</p>
          </div>
          <!-- insurance-cover:end -->`;
};
