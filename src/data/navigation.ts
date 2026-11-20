import type { SiteConfig } from "./defaults";

/**
 * Canonical header navigation — the single source of truth for what
 * belongs in the header, what each button promises, and what content
 * waits behind it.
 *
 * Audit (why this list looks the way it does):
 *  KEPT  — Highlights, Cabinets, Collection, Glow Room, Deep Time,
 *          Field Notes: six distinct destinations, each with its own
 *          substantive content (see `blurb` / `promise`).
 *  MERGED — "Contact" (plain link) duplicated the gold "Direct contact"
 *          CTA pixel-for-pixel; only the CTA survives.
 *  REMOVED — "Admin" leaked an owner tool (with a live inquiry badge)
 *          into the public luxury header. It stays available where it
 *          belongs: the footer, Ctrl/⌘+Shift+A, and the #admin shortcut.
 */

export interface NavContent {
  /** Section id on the home page. */
  id: string;
  /** Dedicated page URL for this nav button. */
  href: string;
  label: string;
  /** One-line description shown under the label (mobile menu, tooltips). */
  blurb: string;
  /** The concrete content promise — what the visitor will actually find. */
  promise: string;
}

export const NAV_CONTENT: Record<string, NavContent> = {
  highlights: {
    id: "highlights",
    href: "#/highlights",
    label: "Highlights",
    blurb: "Masterworks of the Salon",
    promise:
      "The icons the whole exhibition is built around — Sweet Home rhodochrosite, Mundrabilla iron, crystalline gold and phantom fluorite, each with its full story.",
  },
  categories: {
    id: "categories",
    href: "#/cabinets",
    label: "Cabinets",
    blurb: "Five cabinets, five worlds",
    promise:
      "A dedicated page for every cabinet — Gemstones, Metals & Ores, Meteorites, Fluorescent and Classic Species — with its own essay, stats and specimen list.",
  },
  collection: {
    id: "collection",
    href: "#/collection",
    label: "Collection",
    blurb: "The Specimen Vault",
    promise:
      "Every catalogued plate in one searchable vault: filter by cabinet, compare Mohs hardness and rarity, build a private shortlist and inquire directly.",
  },
  glow: {
    id: "glow",
    href: "#/glow-room",
    label: "Glow Room",
    blurb: "Photoluminescence Lab",
    promise:
      "Take command of the UV bench — switch between 254 nm and 365 nm and watch Franklin willemite and calcite ignite in the dark.",
  },
  deeptime: {
    id: "deeptime",
    href: "#/deep-time",
    label: "Deep Time",
    blurb: "Planetary Chronology",
    promise:
      "Six geological acts across 4.56 billion years — from presolar iron and Hadean zircon to hydrothermal cathedrals and lab-grown bismuth.",
  },
  stories: {
    id: "stories",
    href: "#/field-notes",
    label: "Field Notes",
    blurb: "Curatorial Journal",
    promise:
      "Long-form dispatches from the mineralogical desk: what a mineral really is, how crystals grow, and iron from the heart of a vanished world.",
  },
};

/** Live meta line for a nav item, computed from the actual archive. */
export function navMeta(id: string, config: SiteConfig): string {
  switch (id) {
    case "highlights": {
      const n = config.minerals.filter((m) => m.highlight).length;
      return `${n} masterwork${n === 1 ? "" : "s"}`;
    }
    case "categories":
      return `${config.categories.length} dedicated pages`;
    case "collection":
      return `${config.minerals.length} specimens · search & filter`;
    case "glow":
      return "254 / 365 nm · interactive";
    case "deeptime":
      return `${config.deeptime.eras.length} eras · 4.56 Ga`;
    case "stories": {
      const mins = config.stories.articles.reduce((s, a) => s + a.minutes, 0);
      return `${config.stories.articles.length} dispatches · ${mins} min read`;
    }
    default:
      return "";
  }
}

/** Content for the one surviving contact action (the gold CTA). */
export const CONTACT_CONTENT = {
  href: "#/contact",
  label: "Direct contact",
  blurb: "Private Salon & Collector Desk",
  promise:
    "No shopping cart, no checkout — request a dossier, daylight & UV macro video and provenance papers by telephone, WhatsApp or Telegram, answered personally by the curatorial desk.",
};

/**
 * CMS-aware nav content: the Admin Panel header tab wins, the audited
 * defaults above are the fallback for anything not yet customised.
 */
export function navContentFor(config: SiteConfig, id: string): NavContent | undefined {
  const item = config.header?.navItems?.find((n) => n.id === id);
  if (item) {
    return { id, href: item.href, label: item.label, blurb: item.blurb, promise: item.promise };
  }
  return NAV_CONTENT[id];
}

/** CMS-aware content for the gold contact CTA. */
export function contactContentFor(config: SiteConfig) {
  const h = config.header;
  if (!h) return CONTACT_CONTENT;
  return {
    href: h.contactHref || CONTACT_CONTENT.href,
    label: h.contactLabel || CONTACT_CONTENT.label,
    blurb: h.contactBlurb || CONTACT_CONTENT.blurb,
    promise: h.contactPromise || CONTACT_CONTENT.promise,
  };
}
