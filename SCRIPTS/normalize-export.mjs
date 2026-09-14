#!/usr/bin/env node

/**
 * Normalize a WordPress export into the shared static template: read the
 * exported pages, keep the content, and re-emit every route onto one semantic
 * shell with no WordPress payload.
 *
 *   node SCRIPTS/normalize-export.mjs [--source <dir>] [--out <dir>]
 *
 * Both default to the repository root, so a fresh export dropped in place is
 * rewritten where it stands. Remote images are expected under assets/img
 * already; run scripts/fetch-remote-images.mjs first.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ORIGIN, ROOT } from "./static-site.mjs";
import { NAV_ITEMS, ROUTE_LABELS, bottombar, breadcrumbs, footer, masthead } from "./page-shell.mjs";

const flag = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : resolve(process.argv[index + 1]);
};

const SOURCE = flag("--source", ROOT);
const OUTPUT = flag("--out", ROOT);
const IMAGES = resolve(OUTPUT, "assets/img");
const MODIFIED = "2026-09-14";

// Alike and Lexend come from Google's CDN, which serves WOFF2 split by
// unicode-range: an English visitor fetches the Latin subsets only, 39 KB
// against the 146 KB of unhinted TTF this site used to carry. The preconnects
// are what make that a win — without them the fonts wait on a DNS lookup and a
// TLS handshake to an origin the browser has not met.
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Alike&family=Lexend:wght@400&display=swap";

/* -------------------------------------------------------------------------
 * Page inventory: route, source file, and the metadata the shell needs.
 * ---------------------------------------------------------------------- */

const PAGES = [
  {
    file: "index.html",
    route: "/",
    bodyClass: "home",
    title: "Therapy for Adults & Couples in Klamath Falls, Oregon",
    description:
      "Evidence-based therapy in Klamath Falls and across Oregon for anxiety, depression, trauma, and relationships, with Elaine Dinwiddie, LPC.",
    heading: "Helping those who wish to be free of depression and anxiety",
    dropHeading: "Adults and Couples Therapy of Oregon",
    social: "practice",
    schema: "WebPage",
  },
  {
    file: "therapy/index.html",
    route: "/therapy/",
    title: "Therapy Approaches for Adults & Couples in Oregon",
    description:
      "The therapy approaches practised in Oregon: talk therapy, CBT, DBT, the Gottman Method, mindfulness, EFT, EMDR, and military-focused trauma care.",
    heading: "Therapy I practice",
    social: "therapy",
    schema: "CollectionPage",
  },
  {
    file: "therapy/talk-therapy/index.html",
    route: "/therapy/talk-therapy/",
    title: "Talk Therapy in Oregon | Individual Counseling Services",
    description:
      "Evidence-based talk therapy in Oregon for anxiety, depression, and stress management. Learn how psychotherapy supports lasting change.",
    heading: "Talk Therapy",
    social: "therapy",
    schema: "MedicalWebPage",
  },
  {
    file: "therapy/cbt/index.html",
    route: "/therapy/cbt/",
    title: "Cognitive Behavioral Therapy (CBT) in Oregon | CBT for Anxiety",
    description:
      "Expert cognitive behavioral therapy in Oregon helps transform negative thought patterns into positive ones. Evidence-based CBT for anxiety and depression.",
    heading: "Cognitive Behavioral Therapy (CBT)",
    social: "therapy",
    schema: "MedicalWebPage",
  },
  {
    file: "therapy/dbt/index.html",
    route: "/therapy/dbt/",
    title: "Dialectical Behavior Therapy (DBT) in Oregon | DBT Skills",
    description:
      "Master emotional regulation with DBT therapy in Oregon. Learn mindfulness, distress tolerance, and interpersonal effectiveness skills for lasting change.",
    heading: "Dialectical Behavior Therapy (DBT)",
    social: "therapy",
    schema: "MedicalWebPage",
  },
  {
    file: "therapy/gottman/index.html",
    route: "/therapy/gottman/",
    title: "Gottman Method Couples Therapy in Oregon | Level 2 Trained",
    description:
      "Gottman Method Couples Therapy uses research-based interventions to help couples rebuild friendship, manage conflict, and create shared meaning.",
    heading: "Gottman Method Couples Therapy",
    social: "couples",
    schema: "MedicalWebPage",
  },
  {
    file: "therapy/mindfulness/index.html",
    route: "/therapy/mindfulness/",
    title: "Mindfulness Therapy Oregon | Present-Focused Anxiety Relief",
    description:
      "Mindfulness therapy in Oregon teaches practical present-focused techniques that reduce anxiety and stress and steady emotional regulation.",
    heading: "Mindfulness Therapy",
    social: "therapy",
    schema: "MedicalWebPage",
  },
  {
    file: "therapy/eft/index.html",
    route: "/therapy/eft/",
    title: "EFT Tapping Therapy in Oregon | Emotional Freedom Technique",
    description:
      "Certified EFT therapy in Oregon for trauma, anxiety, pain, and addictions. Learn how Emotional Freedom Technique tapping supports nervous-system healing.",
    heading: "Emotional Freedom Technique (EFT) Therapy",
    social: "therapy",
    schema: "MedicalWebPage",
  },
  {
    file: "therapy/emdr/index.html",
    route: "/therapy/emdr/",
    title: "EMDR Therapy in Oregon | Trauma and PTSD Treatment",
    description:
      "EMDR therapy in Oregon for trauma recovery and PTSD treatment. Learn how Eye Movement Desensitization and Reprocessing resolves stuck traumatic memory.",
    heading: "EMDR Therapy",
    social: "therapy",
    schema: "MedicalWebPage",
  },
  {
    file: "therapy/military/index.html",
    route: "/therapy/military/",
    title: "Therapy for Veterans & Military in Oregon | PTSD Care",
    description:
      "Specialized trauma therapy for veterans and military personnel in Oregon. Evidence-based PTSD treatment from a Star Behavioral Health trained provider.",
    heading: "Therapy for Military-Veterans: Combat Trauma & PTSD Treatment",
    service: "Military and Veteran Trauma Therapy",
    social: "military",
    schema: "MedicalWebPage",
  },
  {
    file: "skills/index.html",
    route: "/skills/",
    title: "Therapy Skills for Adults | Practical Mental Health Techniques",
    description:
      "Practical therapy skills you can use between sessions: breathing, grounding, distress tolerance, and emotion-regulation techniques explained step by step.",
    heading: "Therapy Skills for Adults: Practical Tools for Mental Wellness",
    social: "skills",
    schema: "CollectionPage",
  },
  {
    file: "education/index.html",
    route: "/education/",
    title: "Mental Health Education & Resources | Adults Therapy Oregon",
    description:
      "Educational resources on the nervous system, the brain model, and therapeutic technique, written to make what happens in therapy understandable.",
    heading: "Mental Health Education Resources",
    social: "education",
    schema: "CollectionPage",
  },
  {
    file: "about/index.html",
    route: "/about/",
    title: "About Elaine Dinwiddie | Licensed Gottman Therapist in Oregon",
    description:
      "Elaine Dinwiddie, LPC, is an Oregon therapist trained in the Gottman Method, EMDR, EFT, and trauma-informed care for adults and couples.",
    heading: "About Elaine Dinwiddie, LPC",
    social: "about",
    schema: "ProfilePage",
  },
  {
    file: "terms/index.html",
    route: "/terms/",
    title: "Terms and Conditions | Adults and Couples Therapy of Oregon",
    description:
      "The terms and conditions that govern use of the Adults and Couples Therapy of Oregon website, including licence, disclaimer, and governing law.",
    heading: "Web Site Terms and Conditions of Use",
    dropHeading: "Web Site Terms and Conditions of Use",
    social: "practice",
    schema: "WebPage",
  },
  {
    file: "privacy/index.html",
    route: "/privacy/",
    title: "Privacy Policy | Adults and Couples Therapy of Oregon",
    description:
      "How this site handles information: what is collected, what is never collected, the processors involved, and the analytics choice every visitor controls.",
    heading: "Privacy Policy",
    dropHeading: "Privacy Policy",
    social: "practice",
    schema: "WebPage",
  },
  {
    file: "sitemap/index.html",
    route: "/sitemap/",
    title: "Site Navigation | Adults Therapy Oregon Treatment Options",
    description:
      "Every page on the Adults and Couples Therapy of Oregon site, grouped by therapy approach, practical skills, education, and practice information.",
    heading: "Site Navigation",
    social: "practice",
    schema: "CollectionPage",
  },
  {
    target: "404.html",
    route: "/404.html",
    title: "Page not found | Adults and Couples Therapy of Oregon",
    description:
      "That page is not here. Reach the therapy approaches, practical skills, education, and contact details for the practice from the links on this page.",
    heading: "That page is not here",
    social: "practice",
    schema: "WebPage",
    noindex: true,
    markup: `<p>The page you asked for has moved or no longer exists. The links below cover everything on this site.</p>
      <p class="actions"><a class="btn" href="/">Home</a> <a class="btn" href="/therapy/">Therapy I practice</a> <a class="btn" href="/sitemap/">Site navigation</a></p>
      <p>If you were trying to reach Elaine, call <a href="tel:+15413638817">(541)&nbsp;363-8817</a> or email <a href="mailto:elaine@adultstherapy.com">elaine@adultstherapy.com</a>.</p>`,
  },
];

/** Alt text for export images that shipped with an empty alt attribute. */
const ALT_TEXT = Object.freeze({
  "Elaine-Dinwiddie-1-225x300.jpeg":
    "Elaine Dinwiddie, Licensed Professional Counselor, smiling outdoors",
  "AdobeStock_445552369-1024x955.jpeg":
    "Diagram of the four components of Dialectical Behavioral Therapy: mindfulness, emotional regulation, interpersonal effectiveness, and distress tolerance",
  "AdobeStock_336147018-300x300.jpeg":
    "Illustration of a person in a telehealth counseling session with a therapist on a laptop screen",
  "AdobeStock_403278580-300x300.jpeg":
    "The cognitive behavioral therapy triangle: thoughts, emotion, and behavior linked in a cycle",
  "AdobeStock_106766632-1024x681.jpeg":
    "An open notebook, pen, and cup of coffee on a table, set out for reflective practice",
  "ACA-logo-true.png": "American Counseling Association member",
  "logo-ACEP-01.svg": "Association for Comprehensive Energy Psychology (ACEP) member",
  "oregon-seal-black.svg": "State of Oregon seal",
});

const SOCIAL_ALT = Object.freeze({
  practice: "Adults and Couples Therapy of Oregon — evidence-based therapy in Oregon",
  therapy: "Therapy approaches at Adults and Couples Therapy of Oregon",
  couples: "Gottman Method couples therapy at Adults and Couples Therapy of Oregon",
  military: "Military and veteran trauma care at Adults and Couples Therapy of Oregon",
  skills: "Practical therapy skills from Adults and Couples Therapy of Oregon",
  education: "Mental health education from Adults and Couples Therapy of Oregon",
  about: "Elaine Dinwiddie, LPC — Adults and Couples Therapy of Oregon",
});

/* -------------------------------------------------------------------------
 * Minimal HTML parser: tokens to a tree, void elements respected.
 * ---------------------------------------------------------------------- */

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);
const RAW_TEXT = new Set(["script", "style", "noscript"]);

const parseAttributes = (source) => {
  const attributes = new Map();
  for (const match of source.matchAll(/([a-zA-Z_:@][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    const [, name, doubleQuoted, singleQuoted, bare] = match;
    attributes.set(name.toLowerCase(), doubleQuoted ?? singleQuoted ?? bare ?? "");
  }
  return attributes;
};

const parse = (html) => {
  const root = { type: "element", name: "#root", attributes: new Map(), children: [] };
  const stack = [root];
  const pattern = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!doctype[^>]*>|<\/([a-zA-Z][-a-zA-Z0-9]*)\s*>|<([a-zA-Z][-a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  let cursor = 0;

  const push = (node) => stack.at(-1).children.push(node);
  const addText = (value) => {
    if (value) push({ type: "text", value });
  };

  let match;
  while ((match = pattern.exec(html)) !== null) {
    addText(html.slice(cursor, match.index));
    cursor = pattern.lastIndex;

    const [token, closing, opening, attributeSource] = match;
    if (!closing && !opening) continue; // comment, doctype, CDATA

    if (closing) {
      const name = closing.toLowerCase();
      const depth = stack.findLastIndex((node) => node.name === name);
      if (depth > 0) stack.length = depth;
      continue;
    }

    const name = opening.toLowerCase();
    const node = {
      type: "element",
      name,
      attributes: parseAttributes(attributeSource || ""),
      children: [],
    };
    push(node);

    if (VOID_ELEMENTS.has(name) || /\/\s*$/.test(attributeSource || "")) continue;

    if (RAW_TEXT.has(name)) {
      const end = html.toLowerCase().indexOf(`</${name}`, cursor);
      const stop = end === -1 ? html.length : end;
      node.children.push({ type: "text", value: html.slice(cursor, stop) });
      const closeEnd = html.indexOf(">", stop);
      cursor = closeEnd === -1 ? html.length : closeEnd + 1;
      pattern.lastIndex = cursor;
      continue;
    }

    stack.push(node);
  }
  addText(html.slice(cursor));
  return root;
};

/* -------------------------------------------------------------------------
 * Intrinsic image dimensions, read straight from the file header.
 * ---------------------------------------------------------------------- */

const dimensionCache = new Map();

const pngSize = (buffer) => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20),
});

const jpegSize = (buffer) => {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
};

const svgSize = (buffer) => {
  const text = buffer.toString("utf8", 0, 2048);
  const viewBox = text.match(/viewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i);
  if (viewBox) return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
  const width = text.match(/\bwidth=["']([\d.]+)/i);
  const height = text.match(/\bheight=["']([\d.]+)/i);
  return width && height ? { width: Math.round(Number(width[1])), height: Math.round(Number(height[1])) } : null;
};

const imageSize = (file) => {
  if (dimensionCache.has(file)) return dimensionCache.get(file);
  let result = null;
  if (existsSync(file)) {
    const buffer = readFileSync(file);
    if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") result = pngSize(buffer);
    else if (buffer[0] === 0xff && buffer[1] === 0xd8) result = jpegSize(buffer);
    else if (file.endsWith(".svg")) result = svgSize(buffer);
  }
  dimensionCache.set(file, result);
  return result;
};

/* -------------------------------------------------------------------------
 * URL rewriting: every asset lands under /assets/img, every route is relative.
 * ---------------------------------------------------------------------- */

const usedImages = new Map();

const registerImage = (name, source) => {
  if (!usedImages.has(name)) usedImages.set(name, source);
  return `/assets/img/${name}`;
};

const rewriteAssetUrl = (value) => {
  const raw = value.trim().replace(/^["']|["']$/g, "");
  const unsplash = raw.match(/^https:\/\/images\.unsplash\.com\/(photo-[0-9a-f-]+)/i);
  if (unsplash) return registerImage(`${unsplash[1]}.jpg`, resolve(IMAGES, `${unsplash[1]}.jpg`));

  const upload = raw.match(/^(?:https?:\/\/(?:www\.)?adultstherapy\.com)?\/?(?:\.\.\/)*wp-content\/uploads\/[\d]{4}\/[\d]{2}\/([^?#"']+)/i);
  if (upload) return registerImage(upload[1], resolve(SOURCE, raw.replace(/^https?:\/\/(?:www\.)?adultstherapy\.com\//i, "").replace(/^(?:\.\.\/)+/, "")));

  const local = raw.match(/^(?:\.{1,2}\/)*assets\/([^?#"']+)$/i);
  if (local) return registerImage(local[1], resolve(SOURCE, "assets", local[1]));

  return null;
};

const rewriteHref = (value) => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/^tel:/i.test(raw)) return `tel:+${raw.slice(4).replace(/\D/g, "").replace(/^1?/, "1")}`;
  const asset = rewriteAssetUrl(raw);
  if (asset) return asset;
  const sameOrigin = raw.match(/^https?:\/\/(?:www\.)?adultstherapy\.com(\/[^\s"']*)?$/i);
  if (sameOrigin) return sameOrigin[1] || "/";
  if (/^https?:\/\/(?:www\.)?preview\.adultstherapy\.com/i.test(raw)) {
    return raw.replace(/^https?:\/\/(?:www\.)?preview\.adultstherapy\.com/i, "") || "/";
  }
  return raw;
};

const backgroundStyle = (style) => {
  const match = (style || "").match(/background-image:\s*url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
  if (!match) return null;
  const rewritten = rewriteAssetUrl(match[2]);
  return rewritten ? `background-image:url('${rewritten}')` : null;
};

/* -------------------------------------------------------------------------
 * Transformation: WordPress block markup to the shared template vocabulary.
 * ---------------------------------------------------------------------- */

const KEEP = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "em",
  "a", "br", "hr", "blockquote", "figure", "figcaption", "img", "iframe",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "sup", "sub", "dl", "dt", "dd",
]);
const DROP = new Set(["script", "style", "noscript", "svg", "button", "form", "input", "select", "textarea", "link", "meta"]);
const UNWRAP_ALWAYS = new Set(["span", "mark", "font", "center", "small", "u", "ins", "del", "abbr", "cite", "time", "label", "picture", "main", "article", "aside", "header", "footer"]);

const classesOf = (node) => new Set((node.attributes.get("class") || "").split(/\s+/).filter(Boolean));

/** Class hooks the site's own design depends on; these survive normalization. */
const DESIGN_CLASSES = new Set([
  "hero-section", "hero-content", "hero-title", "hero-subtitle",
  "hero-cta-buttons", "hero-quick-nav",
  "therapy-cards-section", "therapy-cards-grid", "therapy-card",
  "therapy-card-icon", "therapy-cards-cta",
  "section-header-with-divider", "section-divider", "section-divider-decorative",
  "feature-image", "actions",
]);
const keptClasses = (classes) => [...classes].filter((name) => DESIGN_CLASSES.has(name));
const ICON_PATTERN = /^fa-[a-z0-9-]+$/;

const TEXTLESS = new Set(["script", "style", "noscript", "svg"]);
const elementText = (node) => {
  if (node.type === "text") return node.value;
  if (node.type === "element" && TEXTLESS.has(node.name)) return "";
  return (node.children || []).map(elementText).join("");
};
const readableText = (node) =>
  elementText(node)
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim();

const youtubeEmbed = (source) => {
  const id = (source || "").match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]+)/i)?.[1];
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
};

const make = (name, attributes, children) => ({
  type: "element",
  name,
  attributes: new Map(Object.entries(attributes).filter(([, value]) => value !== null && value !== undefined)),
  children,
});

const transformChildren = (node, context) => (node.children || []).flatMap((child) => transform(child, context));

/**
 * Some figures in the export are hand-written rather than image blocks: a
 * centred wrapper holding an image and an italic caption paragraph. Unwrapped,
 * the caption becomes a stray body paragraph that runs the page width while the
 * image stays centred, so the two no longer read as one thing. Recognising the
 * idiom here means every caption on the site lands as the same structure,
 * whichever way its page was authored.
 */
const handWrittenFigure = (node, children) => {
  const source = (node.children || []).filter((child) => child.type === "element");
  if (source.length !== 2 || source[0].name !== "img" || source[1].name !== "p") return null;
  if (!/font-style:\s*italic/i.test(source[1].attributes.get("style") || "")) return null;
  const [image, caption] = children.filter((child) => child.type === "element");
  if (!image || image.name !== "img" || !caption || caption.name !== "p") return null;
  return [
    make("figure", { class: "figure text-center" }, [image, make("figcaption", {}, caption.children)]),
  ];
};

const transform = (node, context) => {
  if (node.type === "text") {
    return node.value.replace(/\s+/g, " ") === " " && !node.value.trim() ? [{ type: "text", value: " " }] : [node];
  }
  if (node.type !== "element") return [];

  const name = node.name;
  if (DROP.has(name)) return [];

  const classes = classesOf(node);

  // Structural noise from the export.
  if (name === "nav" || classes.has("breadcrumbs") || classes.has("wp-block-navigation")) return [];
  if (classes.has("section-divider-decorative")) {
    return [make("div", { class: "section-divider-decorative" }, transformChildren(node, context))];
  }
  if (classes.has("section-divider")) {
    const background = backgroundStyle(node.attributes.get("style"));
    return [make("div", { class: "section-divider", ...(background ? { style: background } : {}) }, [])];
  }
  if (node.attributes.get("style")?.replace(/\s+/g, "").includes("display:none")) return [];

  // Icons stay as decorative glyphs.
  if (name === "i" || name === "b") {
    const icon = [...classes].find((value) => ICON_PATTERN.test(value));
    if (icon) return [make("i", { class: `fas ${icon === "fa-energy" ? "fa-bolt" : icon}`, "aria-hidden": "true" }, [])];
    return [make(name === "b" ? "strong" : "em", {}, transformChildren(node, context))];
  }

  if (name === "img") {
    const source = rewriteAssetUrl(node.attributes.get("src") || "");
    if (!source) return [];
    const file = resolve(OUTPUT, source.replace(/^\//, ""));
    const registered = usedImages.get(source.split("/").pop());
    const size = imageSize(registered && existsSync(registered) ? registered : file);
    const declaredWidth = node.attributes.get("width");
    const declaredHeight = node.attributes.get("height");
    const basename = source.split("/").pop();
    const design = keptClasses(classes);
    return [
      make("img", {
        class: design.length > 0 ? design.join(" ") : null,
        src: source,
        alt: node.attributes.get("alt")?.trim() || ALT_TEXT[basename] || "",
        width: declaredWidth || (size ? String(size.width) : null),
        height: declaredHeight || (size ? String(size.height) : null),
        loading: "lazy",
        decoding: "async",
      }, []),
    ];
  }

  if (name === "iframe") {
    const deferred = youtubeEmbed(node.attributes.get("src") || node.attributes.get("data-external-src") || "");
    if (!deferred) return [];
    const title = node.attributes.get("title") || "Embedded video";
    context.hasEmbed = true;
    return [
      make("div", { class: "external-embed" }, [
        make("iframe", {
          title,
          "data-external-src": deferred,
          width: node.attributes.get("width") || "560",
          height: node.attributes.get("height") || "315",
          loading: "lazy",
          allowfullscreen: "",
        }, []),
        make("button", { type: "button", "data-load-external-embed": "" }, [
          { type: "text", value: `Load video: ${title}` },
        ]),
      ]),
    ];
  }

  if (name === "a") {
    const href = rewriteHref(node.attributes.get("href"));
    const children = transformChildren(node, context);
    if (!href) return children;
    const external = /^https?:\/\//i.test(href);
    const style = node.attributes.get("style") || "";
    // The export styled some calls to action inline, with no class to carry.
    const styledAsButton = /background-color:\s*#66afa5/i.test(style) || /border-radius:\s*9999px/i.test(style);
    const isButton =
      classes.has("wp-block-button__link") ||
      classes.has("wp-element-button") ||
      styledAsButton ||
      context.buttonDepth > 0;
    return [
      make("a", {
        href,
        class: isButton ? "btn" : null,
        target: external ? "_blank" : null,
        rel: external ? "noopener noreferrer" : null,
      }, children),
    ];
  }

  if (KEEP.has(name)) {
    const attributes = {};
    if (name === "th" || name === "td") {
      if (node.attributes.get("colspan")) attributes.colspan = node.attributes.get("colspan");
      if (node.attributes.get("rowspan")) attributes.rowspan = node.attributes.get("rowspan");
    }
    if (name === "figure") attributes.class = "figure";
    const design = keptClasses(classes);
    if (/^h[1-6]$/.test(name) && /color:\s*#7e679b/i.test(node.attributes.get("style") || "")) {
      design.push("accent");
    }
    if (classes.has("has-large-font-size")) design.push("text-large");
    if (classes.has("has-medium-font-size")) design.push("text-medium");
    // Alignment arrives either as a WordPress class or, in the older Visual
    // Composer blocks, as an inline style. Both are design, so both survive.
    const inlineAlign = (node.attributes.get("style") || "").match(/text-align:\s*(center|left|right)/i)?.[1];
    for (const side of ["center", "left", "right"]) {
      if (classes.has(`has-text-align-${side}`) || inlineAlign?.toLowerCase() === side) {
        design.push(`text-${side}`);
      }
    }
    if (design.length > 0) attributes.class = design.join(" ");
    const children = transformChildren(node, context);
    if (!children.some((child) => readableText(child) || (child.type === "element" && ["img", "iframe", "hr", "br"].includes(child.name)))) {
      return name === "hr" || name === "br" ? [make(name, {}, [])] : [];
    }
    // A paragraph that ended up holding a block (an embed, a figure) becomes a div.
    const holdsBlock = children.some(
      (child) => child.type === "element" && ["div", "figure", "table", "ul", "ol", "section"].includes(child.name),
    );
    return [make(name === "p" && holdsBlock ? "div" : name, attributes, children)];
  }

  // Containers: map the ones that carry layout meaning, unwrap the rest.
  const context2 = classes.has("wp-block-button") || classes.has("wp-block-buttons")
    ? { ...context, buttonDepth: context.buttonDepth + 1 }
    : context;
  const children = transformChildren(node, context2);
  if (children.length === 0) return [];

  const figure = handWrittenFigure(node, children);
  if (figure) return figure;

  const design = keptClasses(classes);
  if (design.length > 0) {
    const background = backgroundStyle(node.attributes.get("style"));
    const element = classes.has("hero-section") || classes.has("therapy-cards-section") ? "section" : "div";
    const tag = classes.has("therapy-card") ? "article" : element;
    return [
      make(tag, { class: design.join(" "), ...(background ? { style: background } : {}) }, children),
    ];
  }

  // A group's own background decides its skin; a constrained group without one
  // is just the 840px column. Checking the fill first matters: the export's
  // call-to-action blocks are constrained *and* filled.
  const style = node.attributes.get("style") || "";
  const fill = style.match(/background-color:\s*(#[0-9a-f]{3,8})/i)?.[1];
  const constrained = classes.has("is-layout-constrained") && !classes.has("wp-block-column");
  if (fill) {
    const skin = /^#7e679b$/i.test(fill) ? "section section--accent" : "section section--alt";
    const inner = constrained ? "section__inner constrained" : "section__inner";
    return [make("section", { class: skin }, [make("div", { class: inner }, children)])];
  }
  // A translucent inset panel, as the export wrote it inline.
  if (/background:\s*rgba\(255,\s*255,\s*255/i.test(style)) {
    return [make("div", { class: "panel" }, children)];
  }
  if (constrained) {
    return [make("div", { class: "constrained" }, children)];
  }
  if (classes.has("wp-block-columns")) return [make("div", { class: "columns" }, children)];
  if (classes.has("wp-block-column")) return [make("div", { class: "column" }, children)];
  if (classes.has("wp-block-buttons")) return [make("p", { class: "actions" }, children)];
  if (classes.has("wp-block-button")) return children;

  // A WordPress group carrying a background becomes one of the two section skins.
  const background = backgroundStyle(node.attributes.get("style"));
  if (background) return [make("section", { class: "feature", style: background }, children)];


  if (UNWRAP_ALWAYS.has(name) || name === "div" || name === "section") return children;
  return children;
};

/* -------------------------------------------------------------------------
 * Serialization.
 * ---------------------------------------------------------------------- */

const BLOCK = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote",
  "figure", "figcaption", "section", "article", "nav", "div", "table", "thead",
  "tbody", "tr", "th", "td", "hr", "iframe", "button", "img", "dl", "dt", "dd",
]);

const attributeString = (attributes) =>
  [...attributes]
    .map(([name, value]) => (value === "" && ["allowfullscreen", "data-load-external-embed", "data-external-src"].includes(name) ? ` ${name}` : ` ${name}="${value}"`))
    .join("");

const escapeText = (value) => value.replace(/&(?![a-zA-Z][a-zA-Z0-9]{1,10};|#\d{1,6};|#x[0-9a-fA-F]{1,6};)/g, "&amp;");

const serialize = (nodes, depth = 0) => {
  const pad = "  ".repeat(depth);
  const block = nodes.some((node) => node.type === "element" && BLOCK.has(node.name));
  const list = block ? nodes.filter((node) => node.type !== "text" || node.value.trim()) : nodes;
  return list
    .map((node) => {
      if (node.type === "text") return escapeText(node.value.replace(/\s+/g, " "));
      const attributes = attributeString(node.attributes);
      if (VOID_ELEMENTS.has(node.name)) return `\n${pad}<${node.name}${attributes}>`;
      const inlineOnly = node.children.every(
        (child) => child.type === "text" || !BLOCK.has(child.name),
      );
      const inner = inlineOnly
        ? serialize(node.children, 0).trim().replace(/\s+/g, " ")
        : `${serialize(node.children, depth + 1)}\n${pad}`;
      const prefix = BLOCK.has(node.name) ? `\n${pad}` : "";
      return `${prefix}<${node.name}${attributes}>${inner}</${node.name}>`;
    })
    .join("");
};

/* -------------------------------------------------------------------------
 * Extraction.
 * ---------------------------------------------------------------------- */

/**
 * Page content runs from the header to the footer — except where the export
 * stranded a page-specific block *inside* the footer template part, as the
 * Gottman page did with its closing call to action. Those blocks are lifted
 * back out, or they vanish from the normalized page.
 */
const STRANDED_BLOCK = /<!--\s*Call to Action Section\s*-->/i;

const contentOf = (html) => {
  const start = html.indexOf("</header>");
  const end = html.indexOf("<footer");
  const body = html.slice(start === -1 ? 0 : start + 9, end === -1 ? html.length : end);
  if (end === -1) return body;

  const footer = html.slice(end, html.indexOf("</footer>", end) + 9 || undefined);
  const stranded = footer.match(STRANDED_BLOCK);
  if (!stranded) return body;

  const from = stranded.index;
  const to = footer.indexOf("<hr", from);
  return body + footer.slice(from, to === -1 ? footer.length : to);
};

/**
 * Exactly one h1 per page: the heading the inventory names is promoted where it
 * already appears in the content, and any other h1 from the export becomes an h2.
 */
const singleHeading = (nodes, page) => {
  const wanted = readableText({ type: "text", value: page.heading });
  let promoted = false;
  const walk = (list) =>
    list.map((node) => {
      if (node.type !== "element") return node;
      if (/^h[1-4]$/.test(node.name)) {
        if (!promoted && readableText(node) === wanted) {
          promoted = true;
          return make("h1", node.attributes.has("class") ? { class: node.attributes.get("class") } : {}, node.children);
        }
        if (node.name === "h1") return make("h2", {}, node.children);
      }
      return { ...node, children: walk(node.children || []) };
    });
  const result = walk(nodes);
  const headed = promoted
    ? result
    : [make("h1", {}, [{ type: "text", value: page.heading }]), ...result];
  return levelHeadings(headed);
};

/**
 * Screen readers announce a skipped heading level as a missing section, so a
 * level may only ever step down by one. The export jumped h1 to h3 wherever a
 * call-to-action heading had been styled small.
 */
const levelHeadings = (nodes) => {
  let previous = 0;
  const walk = (list) =>
    list.map((node) => {
      if (node.type !== "element") return node;
      const match = /^h([1-6])$/.exec(node.name);
      if (!match) return { ...node, children: walk(node.children || []) };
      const declared = Number(match[1]);
      const level = previous === 0 ? declared : Math.min(declared, previous + 1);
      previous = level;
      // Raising a level fixes the outline; the as-hN class keeps it looking as it did.
      const existing = node.attributes.get("class");
      const appearance = level === declared ? [] : [`as-h${declared}`];
      const classes = [...(existing ? [existing] : []), ...appearance].join(" ");
      return make(`h${level}`, classes ? { class: classes } : {}, walk(node.children || []));
    });
  return walk(nodes);
};

/**
 * The hub page describes every modality and then, in the export, left the
 * reader with nowhere to go: each approach has its own page, and not one of
 * those headings linked to it. Keyed on the heading the export already wrote,
 * so the copy stays hers and only the destination is added.
 */
const MODALITY_ROUTES = new Map([
  ["talk therapy", "/therapy/talk-therapy/"],
  ["cognitive behavioral therapy (cbt)", "/therapy/cbt/"],
  ["dialectical behavior therapy (dbt)", "/therapy/dbt/"],
  ["gottman's couple therapy", "/therapy/gottman/"],
  ["mindfulness", "/therapy/mindfulness/"],
  ["emotional freedom technique (eft)", "/therapy/eft/"],
  ["emdr therapy", "/therapy/emdr/"],
]);

/* readableText() collapses every entity to a placeholder, which is fine for
   emptiness checks and useless for matching a heading that contains one. */
const headingKey = (node) =>
  elementText(node)
    .replace(/&(?:#8217|#039|rsquo|apos);/gi, "'")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const linkModalityHeadings = (nodes, route) => {
  if (route !== "/therapy/") return nodes;
  const walk = (list) =>
    list.map((node) => {
      if (node.type !== "element") return node;
      if (!/^h[23]$/.test(node.name)) return { ...node, children: walk(node.children || []) };
      const target = MODALITY_ROUTES.get(headingKey(node));
      if (!target) return node;
      const icons = node.children.filter((child) => child.type === "element" && child.name === "i");
      const rest = node.children.filter((child) => !icons.includes(child));
      return { ...node, children: [...icons, make("a", { href: target }, rest)] };
    });
  return walk(nodes);
};

/**
 * Each therapy page was a leaf: it described one approach and offered no way
 * to reach the other seven except back through the menu. The list is built
 * from the navigation inventory rather than written per page, so a new
 * approach appears on its siblings the moment it is added there.
 */
const APPROACHES = () => NAV_ITEMS.find((item) => item.href === "/therapy/").children;

const relatedFor = (route) => {
  if (route.startsWith("/therapy/") && route !== "/therapy/") {
    return { title: "Other therapy approaches", items: APPROACHES() };
  }
  if (route === "/skills/" || route === "/education/") {
    return { title: "Therapy approaches", items: APPROACHES() };
  }
  if (route === "/about/" || route === "/therapy/") {
    return {
      title: "Explore the practice",
      items: [
        { href: "/therapy/", label: "Therapy I practice" },
        { href: "/skills/", label: "Therapy skills" },
        { href: "/education/", label: "Education" },
        { href: "/about/", label: "About Elaine Dinwiddie" },
      ],
    };
  }
  return null;
};

const relatedApproaches = (route) => {
  const related = relatedFor(route);
  const items = related?.items.filter((item) => item.href !== route) || [];
  if (items.length === 0) return [];
  return [
    make("nav", { class: "related", "aria-labelledby": "related-approaches" }, [
      make("h2", { id: "related-approaches" }, [{ type: "text", value: related.title }]),
      make("ul", {}, items.map((item) =>
        make("li", {}, [make("a", { href: item.href }, [{ type: "text", value: item.label }])]),
      )),
    ]),
  ];
};

const normalize = (page) => {
  const html = page.file ? readFileSync(resolve(SOURCE, page.file), "utf8") : page.markup;
  const tree = parse(page.file ? contentOf(html) : html);
  const context = { buttonDepth: 0, hasEmbed: false };
  const nodes = [
    ...linkModalityHeadings(singleHeading(transformChildren(tree, context), page), page.route),
    ...relatedApproaches(page.route),
  ];
  return { nodes, context };
};

/* -------------------------------------------------------------------------
 * Shell.
 * ---------------------------------------------------------------------- */

/* The shell itself lives in page-shell.mjs so the sync check and this
   migration cannot disagree about what the chrome should be. */

const schemaGraph = (page) => {
  const url = `${ORIGIN}${page.route}`;
  const graph = [
    {
      "@type": ["Organization", "MedicalBusiness", "ProfessionalService"],
      "@id": `${ORIGIN}/#organization`,
      name: "Adults and Couples Therapy of Oregon",
      url: `${ORIGIN}/`,
      email: "elaine@adultstherapy.com",
      telephone: "+1-541-363-8817",
      medicalSpecialty: "Psychiatric",
      // The towns the home page lists as served, plus the state that covers the
      // telehealth reach. Keep the two in step: this is a public claim about
      // where the practice works.
      areaServed: [
        { "@type": "State", name: "Oregon" },
        { "@type": "City", name: "Klamath Falls" },
        ...["Altamont", "Chiloquin", "Merrill", "Bonanza", "Malin", "Sprague River", "Beatty", "Bly", "Rocky Point"].map(
          (name) => ({ "@type": "City", name }),
        ),
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Klamath Falls",
        addressRegion: "OR",
        postalCode: "97601",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 42.224867, longitude: -121.7816704 },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "11:00",
          closes: "18:00",
        },
      ],
      priceRange: "$$",
      paymentAccepted: ["Cash", "Credit Card", "Debit Card", "Insurance"],
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Wheelchair Accessible", value: true },
        { "@type": "LocationFeatureSpecification", name: "Free Parking", value: true },
        { "@type": "LocationFeatureSpecification", name: "Telehealth Available", value: true },
      ],
      founder: { "@id": `${ORIGIN}/about/#practitioner` },
      knowsAbout: [
        "Gottman Method Couples Therapy",
        "Cognitive Behavioral Therapy",
        "Dialectical Behavior Therapy",
        "Eye Movement Desensitization and Reprocessing",
        "Emotional Freedom Technique",
        "Mindfulness-based therapy",
        "Trauma-informed care for veterans",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${ORIGIN}/#website`,
      url: `${ORIGIN}/`,
      name: "Adults and Couples Therapy of Oregon",
      publisher: { "@id": `${ORIGIN}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": page.schema,
      "@id": `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${ORIGIN}/#website` },
      about: { "@id": `${ORIGIN}/#organization` },
      ...(page.route === "/" ? {} : { breadcrumb: { "@id": `${url}#breadcrumbs` } }),
      inLanguage: "en-US",
      dateModified: MODIFIED,
    },
  ];

  if (page.schema === "MedicalWebPage") {
    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      // A few headings are headlines rather than the name of a service; those
      // pages name the service explicitly.
      name: (page.service || page.heading).replace(/&#8217;/g, "\u2019"),
      serviceType: (page.service || page.heading).replace(/&#8217;/g, "\u2019"),
      description: page.description,
      provider: { "@id": `${ORIGIN}/#organization` },
      areaServed: { "@type": "State", name: "Oregon" },
      availableChannel: {
        "@type": "ServiceChannel",
        name: "Telehealth and in-person sessions",
        servicePhone: "+1-541-363-8817",
        serviceUrl: url,
      },
    });
  }

  // The breadcrumb trail is rendered on every page, so the markup describes
  // something a visitor can actually see and click. It was dropped during
  // normalization only because no trail existed then.
  if (page.route !== "/" && ROUTE_LABELS[page.route]) {
    const trail = [{ href: "/", label: "Home" }];
    if (page.route.startsWith("/therapy/") && page.route !== "/therapy/") {
      trail.push({ href: "/therapy/", label: ROUTE_LABELS["/therapy/"] });
    }
    trail.push({ href: page.route, label: ROUTE_LABELS[page.route] });
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumbs`,
      itemListElement: trail.map((step, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: step.label.replace(/&#8217;/g, "\u2019"),
        item: `${ORIGIN}${step.href}`,
      })),
    });
  }

  if (page.route === "/about/") {
    graph.push({
      "@type": "Person",
      "@id": `${ORIGIN}/about/#practitioner`,
      name: "Elaine Dinwiddie",
      honorificSuffix: "LPC",
      jobTitle: "Licensed Professional Counselor",
      worksFor: { "@id": `${ORIGIN}/#organization` },
      knowsLanguage: "en-US",
      hasCredential: [
        { "@type": "EducationalOccupationalCredential", name: "Oregon Licensed Professional Counselor, License C5403" },
        { "@type": "EducationalOccupationalCredential", name: "Gottman Couples Therapy Level 2 Practitioner" },
        { "@type": "EducationalOccupationalCredential", name: "EMDR Level 2" },
        { "@type": "EducationalOccupationalCredential", name: "Certified Clinical Trauma Professional (CCTP I)" },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

const head = (page) => {
  const url = `${ORIGIN}${page.route}`;
  const image = `${ORIGIN}/assets/social/${page.social}.png`;
  const alt = SOCIAL_ALT[page.social];
  const robots = page.noindex
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="${robots}">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Adults and Couples Therapy of Oregon">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="${alt}">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${alt}">
  <link rel="icon" href="/assets/img/favicon.ico" sizes="any">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${GOOGLE_FONTS.replaceAll("&", "&amp;")}">
  <link rel="stylesheet" href="/assets/fontawesome.css">
  <link rel="stylesheet" href="/assets/site.css">
  <script type="application/ld+json" data-practice-schema>${JSON.stringify(schemaGraph(page))}</script>
</head>`;
};

const render = (page, body) => `${head(page)}
<body${page.bodyClass ? ` class="${page.bodyClass}"` : ""}>
  <a class="skip-link" href="#main">Skip to content</a>

${masthead(page.route)}

${breadcrumbs(page.route)}

  <main id="main" tabindex="-1">${body}
  </main>

${footer()}

${bottombar(page.route)}

  <script src="/assets/site.js" defer></script>
</body>
</html>
`;

/* -------------------------------------------------------------------------
 * Run.
 * ---------------------------------------------------------------------- */

const SITE_INDEX_MARKERS = "\n      <!-- site-index:start -->\n      <!-- site-index:end -->";

const summary = [];
for (const page of PAGES) {
  const { nodes, context } = normalize(page);
  const body = page.route === "/sitemap/"
    ? `${serialize(nodes.slice(0, 1), 3)}${SITE_INDEX_MARKERS}`
    : serialize(nodes, 3);
  const html = render(page, body);
  const target = resolve(OUTPUT, page.target || page.file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  summary.push({
    route: page.route,
    bytes: Buffer.byteLength(html),
    headings: (body.match(/<h1\b/g) || []).length,
    embeds: context.hasEmbed,
  });
}

mkdirSync(IMAGES, { recursive: true });
let copied = 0;
for (const [name, source] of usedImages) {
  const target = resolve(IMAGES, name);
  if (source === target || !existsSync(source)) continue;
  writeFileSync(target, readFileSync(source));
  copied += 1;
}

for (const row of summary) {
  process.stdout.write(
    `${row.route.padEnd(28)} ${String(row.bytes).padStart(7)} bytes  h1=${row.headings}${row.embeds ? "  embed" : ""}\n`,
  );
}
process.stdout.write(`\n${summary.length} pages rewritten; ${usedImages.size} images referenced (${copied} copied into assets/img).\n`);
