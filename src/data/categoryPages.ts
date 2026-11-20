/**
 * Editorial content for the dedicated category ("cabinet") pages.
 *
 * Categories themselves are managed in the CMS (Admin → Categories) and may
 * be renamed or extended at any time. This module layers rich, page-level
 * storytelling on top of them: every CMS category — including ones created
 * later — automatically receives a professional page at
 * `#/category/<slug>`.
 */

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CategoryTrait {
  title: string;
  body: string;
}

export interface CategoryPageMeta {
  /** Short museum-label line shown under the page title. */
  tagline: string;
  /** Lead paragraph of the cabinet essay. */
  intro: string;
  /** Second paragraph — how the cabinet is curated. */
  curation: string;
  /** What a collector should look for in this cabinet. */
  lookingFor: string[];
  /** Three signature traits rendered as editorial cards. */
  traits: CategoryTrait[];
  /** Curator's closing note for the cabinet. */
  curatorNote: string;
}

const META: Record<string, CategoryPageMeta> = {
  gemstones: {
    tagline: "Crystals cut by geology, finished by light",
    intro:
      "The Gemstone Cabinet holds minerals whose transparency, colour saturation and crystal habit place them at the meeting point of geology and jewellery. These are not cut stones — every specimen is shown exactly as it left the pocket, so the architecture of the crystal itself does the work a facet would normally do.",
    curation:
      "We acquire gem species only when the natural crystal rivals a finished jewel: glass-clear terminations, undamaged prism faces, and colour that holds under daylight rather than flattering gallery spots. Matrix specimens are preferred, because the host rock records where — and how violently — the crystal grew.",
    lookingFor: [
      "Undamaged, mirror-bright terminations",
      "Colour zoning that stays honest in daylight",
      "Matrix that proves the locality story",
      "No repairs, no oiling, no filled fractures",
    ],
    traits: [
      {
        title: "Grown, not cut",
        body: "Prism faces, natural etching and growth hillocks are left untouched. What you see is the crystallography itself — trigonal quartz, hexagonal beryl — drawn by atomic order.",
      },
      {
        title: "Colour from traces",
        body: "Parts-per-million impurities do all the painting: iron turns quartz violet and beryl sea-blue, chromium would make the same beryl an emerald. Chemistry, not dye.",
      },
      {
        title: "Light as a material",
        body: "These specimens are lit to be walked around. Transparency, pleochroism and internal reflections change with every step — the cabinet is designed as a slow orbit.",
      },
    ],
    curatorNote:
      "Judge a gem crystal the way you would judge architecture: stand back for the silhouette, then come close for the joinery.",
  },
  "metals-and-ores": {
    tagline: "Native metals and the ores civilisation was built on",
    intro:
      "Before there were mines there were metals lying in streams, already pure. The Metals & Ores Cabinet traces that line — from native gold and laboratory-grown bismuth staircases to the copper carbonates that signalled where the great ore bodies slept.",
    curation:
      "Crystalline native metal is vanishingly rare because almost all of it was melted on sight. We collect the survivors: dendritic gold, hoppered bismuth, and ore minerals preserved before the smelter — each one a piece of economic history that escaped the furnace.",
    lookingFor: [
      "True crystal form in a native metal",
      "Original matrix, never melted or cast",
      "Iridescence and patina left intact",
      "Documented mine and recovery date",
    ],
    traits: [
      {
        title: "Escaped the furnace",
        body: "Gold, copper and silver almost never survive as crystals. A crystallised native metal is money that refused to become money — geology preserved against economics.",
      },
      {
        title: "Staircases & dendrites",
        body: "Metals grow fast at their edges, building feathered dendrites and hollow hopper crystals. Bismuth's rainbow is a nanometre oxide film interfering with light.",
      },
      {
        title: "Ores as maps",
        body: "Malachite's green and azurite's blue were prospectors' signposts to copper below. Every ore specimen here once pointed someone toward a fortune — or a disappointment.",
      },
    ],
    curatorNote:
      "Look for growth steps under the loupe. In a metal crystal you can read temperature and chemistry the way you read tree rings.",
  },
  meteorites: {
    tagline: "Iron older than the Earth it fell on",
    intro:
      "Nothing in this cabinet is from Earth. Meteorites are fragments of shattered protoplanets — material that condensed from the solar nebula 4.6 billion years ago, before our planet finished forming. Cut and etched, their interiors show crystal patterns no terrestrial process can reproduce.",
    curation:
      "We hold irons with documented fall or find records, weight and coordinates verified against the Meteoritical Bulletin. Display cuts are polished and etched in-house so the Widmanstätten pattern — the cabinet's signature — stays legible under gallery light.",
    lookingFor: [
      "Documented fall / find provenance",
      "A clean, stable Widmanstätten etch",
      "No active rust ('Lawrencite disease')",
      "Mass and coordinates on record",
    ],
    traits: [
      {
        title: "Deep-time cooling",
        body: "The interlocking nickel–iron pattern grows a few degrees per million years. No furnace on Earth can cool that slowly — the pattern is a certificate of extraterrestrial origin.",
      },
      {
        title: "Cores of dead worlds",
        body: "Iron meteorites are the exposed cores of planetesimals that were smashed apart before they could become planets. You are looking at a planetary heart.",
      },
      {
        title: "Weathering as biography",
        body: "Fusion crust, desert patina and find-site coordinates tell the second half of the story: the billion-year fall, and the human who finally picked it up.",
      },
    ],
    curatorNote:
      "Touch the case, not the iron. Then remember: everything else in this building is younger than the object behind the glass.",
  },
  fluorescent: {
    tagline: "Minerals that answer invisible light",
    intro:
      "By daylight this is the quietest cabinet in the salon. Under ultraviolet it becomes the loudest. Trace activator atoms — manganese above all — absorb invisible UV and re-emit it as saturated green, orange and red, turning modest grey rock into stained glass made of stone.",
    curation:
      "Fluorescent specimens are selected under the lamp, not the window: response is tested at both 254 nm and 365 nm, and phosphorescence timed after the lamp dies. The Glow Room next door exists because this cabinet demanded a dark stage of its own.",
    lookingFor: [
      "Strong response at 254 nm AND 365 nm",
      "Two or more emission colours in one piece",
      "Visible phosphorescent afterglow",
      "Classic localities — Franklin above all",
    ],
    traits: [
      {
        title: "Activator chemistry",
        body: "A few hundred parts per million of manganese switch willemite to neon green and calcite to ember red. The mineral is the host; the impurity is the lamp.",
      },
      {
        title: "Two lights, two portraits",
        body: "Shortwave and longwave UV excite different activators, so one specimen holds two completely different colour portraits — both are shown in this cabinet.",
      },
      {
        title: "Darkness is a material",
        body: "Fluorescence is a negotiation with your own eyes. Thirty seconds of dark adaptation doubles what you see; the cabinet lighting is choreographed around that physiology.",
      },
    ],
    curatorNote:
      "If a fluorescent specimen looks dull, wait. Either the lamp is wrong — or your eyes have not arrived yet.",
  },
  "classic-species": {
    tagline: "The reference specimens every collection is judged by",
    intro:
      "Every science needs its type specimens — the examples textbooks are quietly measured against. The Classic Species Cabinet gathers the definitive expressions of beloved minerals: the rhodochrosite, fluorite, malachite and azurite by which all later finds are judged.",
    curation:
      "A classic earns its place here by locality as much as by beauty. Sweet Home, Tsumeb, Franklin, Katanga — the great pockets are exhausted, so these pieces are effectively unrepeatable. We document chain of ownership back to recovery wherever the record survives.",
    lookingFor: [
      "Benchmark quality for the species",
      "A famous, preferably exhausted locality",
      "Unbroken chain of provenance",
      "The habit and colour the species is known for",
    ],
    traits: [
      {
        title: "Locality is destiny",
        body: "Tsumeb alone yielded more world-class species than any mine on Earth. When a great pocket closes, its best specimens become a closed edition — geology stops printing.",
      },
      {
        title: "The textbook habit",
        body: "Dog-tooth rhodochrosite, phantom fluorite cubes, botryoidal malachite: these are the growth forms that define their species in every reference work since.",
      },
      {
        title: "Minerals are mortal",
        body: "Azurite slowly becomes malachite; pyrite can decay in its case. Conservation records travel with every classic — owning one means inheriting its care.",
      },
    ],
    curatorNote:
      "Collect species if you like. Collect localities if you want history. The classics are where the two become the same object.",
  },
};

function fallbackMeta(name: string): CategoryPageMeta {
  return {
    tagline: "A cabinet of the Vernajewel archive",
    intro: `The ${name} cabinet gathers every specimen the curatorial desk has filed under ${name} — presented with full catalogue data, provenance and locality records, exactly as it appears in the salon's vault.`,
    curation:
      "Each piece is selected against the same standard as the rest of the archive: honest surfaces, documented origin, and crystal quality that survives daylight as well as gallery lighting.",
    lookingFor: [
      "Documented locality and provenance",
      "Undamaged crystal terminations",
      "Honest, unrestored surfaces",
      "Full catalogue record on file",
    ],
    traits: [
      {
        title: "Curated, not accumulated",
        body: "Specimens enter this cabinet only after curatorial review — chemistry, habit, locality and condition are all recorded before a catalogue number is issued.",
      },
      {
        title: "Provenance first",
        body: "Where a specimen was found, when it was recovered and whose hands it passed through are treated as part of the object itself.",
      },
      {
        title: "Shown as found",
        body: "No cosmetic enhancement stands between you and the mineral. What the pocket produced is what the cabinet displays.",
      },
    ],
    curatorNote: `Ask the desk for the full dossier on any piece in the ${name} cabinet — the paperwork is part of the pleasure.`,
  };
}

export function getCategoryMeta(name: string): CategoryPageMeta {
  return META[slugifyCategory(name)] ?? fallbackMeta(name);
}
