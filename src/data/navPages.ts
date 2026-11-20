import type { NavPageId } from "../router";

/**
 * Exclusive editorial content for every header-navigation page.
 *
 * Each nav button in the header leads to a dedicated page
 * (#/highlights, #/cabinets, #/collection, #/glow-room, #/deep-time,
 * #/field-notes, #/contact). The live section from the home page is
 * embedded in that page, and this module supplies everything that
 * makes the page *exclusive* rather than a copy of the section:
 * a bespoke hero essay, three analytical columns, a curator's
 * statement, and the questions collectors actually ask.
 */

export interface NavPageFeature {
  title: string;
  body: string;
}

export interface NavPageFaq {
  q: string;
  a: string;
}

export interface NavPageMeta {
  page: NavPageId;
  /** Small caps line above the title. */
  overline: string;
  /** Display title (the italic word is rendered in the accent). */
  title: string;
  titleAccent: string;
  /** Italic standfirst under the title. */
  tagline: string;
  /** Lead essay — exclusive to this page. */
  intro: string;
  /** Second essay paragraph. */
  essay: string;
  accent: string;
  features: NavPageFeature[];
  quote: { text: string; author: string; role: string };
  faqs: NavPageFaq[];
  /** Label of the primary in-page call to action. */
  cta: string;
}

export const NAV_PAGES: Record<NavPageId, NavPageMeta> = {
  highlights: {
    page: "highlights",
    overline: "Masterworks of the Salon",
    title: "Four icons,",
    titleAccent: "four unrepeatable moments",
    tagline: "The cornerstones around which the entire exhibition is built",
    intro:
      "A highlight is not simply a beautiful specimen. It is the piece a curator would save first — the one whose locality is exhausted, whose colour should not be chemically possible, or whose journey to the gallery reads like a novel. Four specimens in the Vernajewel archive carry that weight, and this page is their room.",
    essay:
      "Each masterwork is presented the way it hangs in the Grand Hall: alone, at eye level, with nothing competing for the light. Read them slowly. The rhodochrosite closed its mine behind it; the Mundrabilla iron is older than the ground it fell on; the gold escaped the furnace that consumed almost all of its kind; and the fluorite grew around the ghost of its younger self. Together they are the salon's argument for why minerals belong beside paintings and sculpture.",
    accent: "#d7bdf7",
    features: [
      {
        title: "Chosen by exhaustion",
        body: "Three of the four come from pockets that no longer exist. When Sweet Home closed and the great Tsumeb levels flooded, pieces of this calibre became a closed edition — geology stopped printing, and the market has been chasing the same few survivors ever since.",
      },
      {
        title: "Colour at the limit",
        body: "Raspberry rhodochrosite this transparent, violet fluorite zoned to sea-green — these sit at the statistical edge of what their chemistry allows. The highlight wall is, quietly, a lesson in how improbable saturated colour in stone really is.",
      },
      {
        title: "Provenance you can audit",
        body: "Every icon carries its chain of custody: recovery year, estate or mine source, and the date it entered the archive — some pedigrees here reach back to 1928. Beauty opens the conversation; paperwork closes it.",
      },
    ],
    quote: {
      text: "A museum is not measured by how much it holds, but by the four or five objects a visitor remembers in the taxi home. These are ours.",
      author: "Dr. Elena Marsh",
      role: "Chief Curator & Principal Mineralogist",
    },
    faqs: [
      {
        q: "Can a highlight be acquired, or are they permanently off the market?",
        a: "Highlights anchor the permanent exhibition, but private placements are occasionally arranged for institutions and long-standing collectors. The concierge desk will tell you honestly which pieces could ever move — and which never will.",
      },
      {
        q: "Why only four? Is the rest of the vault lesser material?",
        a: "The vault holds the working archive; the highlights are its thesis statement. Restricting the wall to four forces the hardest curatorial question — what would you keep if you could keep almost nothing? — and keeps the answer honest.",
      },
    ],
    cta: "Meet the four icons",
  },

  categories: {
    page: "categories",
    overline: "The Cabinets",
    title: "Five cabinets,",
    titleAccent: "five worlds",
    tagline: "Every discipline inside the salon, given a room of its own",
    intro:
      "Mineralogy is not one subject. The physics that grows a beryl prism has almost nothing in common with the astrophysics inside a meteorite, or the photochemistry that wakes a willemite in the dark. So the salon is organised as cabinets — and on this site, each cabinet is a full page with its own essay, statistics and specimen list.",
    essay:
      "Start here if you collect by instinct rather than by checklist. Gemstones reward the eye for light; Metals & Ores tell the story of civilisation's furnaces and the few crystals that escaped them; Meteorites are quite literally not of this Earth; the Fluorescent cabinet must be read in darkness; and Classic Species holds the reference specimens against which every later find is judged. Choose the world that pulls you — each door below opens its complete cabinet.",
    accent: "#b48cf2",
    features: [
      {
        title: "Organised by how they formed",
        body: "The cabinets follow genesis, not alphabet: hydrothermal gems, native metals and their ores, extraterrestrial iron, UV-reactive phosphors, and the textbook species of the great historic mines.",
      },
      {
        title: "Each cabinet, a complete dossier",
        body: "Every cabinet page carries its own curatorial essay, live archive statistics, the criteria our desk uses to buy for it, the localities represented, and its full searchable specimen list.",
      },
      {
        title: "Built to grow with the archive",
        body: "When the curatorial desk creates a new cabinet in the archive, it appears here automatically — with a generated page, its own address, and a place in the header — no redesign required.",
      },
    ],
    quote: {
      text: "Visitors always have a cabinet. They arrive for the gems and stay for the meteorites, or come for the gold and fall for the stones that glow. The rooms do the persuading.",
      author: "Dr. Elena Marsh",
      role: "Chief Curator & Principal Mineralogist",
    },
    faqs: [
      {
        q: "I am new to collecting. Which cabinet should I enter first?",
        a: "Gemstones, for the pleasure of pure crystal form — then walk straight into the Fluorescent cabinet and switch the lights off. Between those two rooms you will learn most of what this salon believes.",
      },
      {
        q: "Can I browse specimens across all cabinets at once?",
        a: "Yes — the Collection page is the unified vault, with search and filters spanning every cabinet. The cabinet pages exist for depth; the vault exists for breadth.",
      },
    ],
    cta: "Enter the cabinets",
  },

  collection: {
    page: "collection",
    overline: "Catalogue Raisonné",
    title: "The Specimen",
    titleAccent: "Vault",
    tagline: "The complete working archive, open for inspection",
    intro:
      "This is the salon's ledger and showroom in one: every catalogued plate currently in the Vernajewel archive, presented with the data a serious collector actually asks for — chemistry, crystal system, locality, hardness, rarity and the year the piece entered the collection.",
    essay:
      "Use the vault the way the desk uses it. Search by locality if you collect places ('Tsumeb', 'Pakistan', 'Franklin'); search by chemistry if you collect elements ('copper' will find you malachite and azurite); sort by Mohs hardness to feel the archive's physical range, from talc-soft native metals to beryl at 7.5–8. Tap the heart on any plate to build a private shortlist that survives between visits, and open a specimen file for its full story, curator's note and a direct line to the desk.",
    accent: "#8fe4df",
    features: [
      {
        title: "Catalogue-grade data",
        body: "Each plate carries its LTH catalogue number, chemical formula, crystal system, luster, dimensions and acquisition year — the same record the registrar keeps, with nothing hidden behind a login.",
      },
      {
        title: "A shortlist that remembers you",
        body: "Saved specimens persist on your device, so a shortlist built over several evenings is waiting when you return — the digital equivalent of the desk keeping your tray in the viewing room.",
      },
      {
        title: "Inquiry, not checkout",
        body: "There is deliberately no buy button. Museum-calibre pieces move by conversation: dossier, macro video, provenance papers, then terms. Every card carries that door.",
      },
    ],
    quote: {
      text: "We publish the whole vault because a collection you cannot inspect is just a rumour. Everything here can be asked about, measured and filmed for you.",
      author: "Prof. Dayo Adeyemi",
      role: "Director of Crystallographic Research",
    },
    faqs: [
      {
        q: "The piece I want is not in the vault. Can you source it?",
        a: "Frequently, yes. The desk maintains relationships with the historic localities and estate dispersals behind this archive — tell the concierge the species, locality and scale you are seeking and we will search off-catalogue.",
      },
      {
        q: "Are the photographs true to the specimens?",
        a: "Plates are photographed unrepaired and unenhanced; dimensions and condition notes accompany every file, and daylight plus UV macro video is available on request for any piece.",
      },
    ],
    cta: "Open the vault",
  },

  glow: {
    page: "glow",
    overline: "Gallery V · Photoluminescence Lab",
    title: "Stones that",
    titleAccent: "awaken in the dark",
    tagline: "An interactive ultraviolet bench, modelled on the salon's darkest room",
    intro:
      "Fewer than fifteen percent of mineral species fluoresce. In ordinary light the stars of this page are unassuming grey rocks; under ultraviolet, trace atoms of manganese absorb invisible photons and re-emit the energy as saturated green, crimson and violet. This page hands you the lamp.",
    essay:
      "Work the bench below the way you would in the Glow Room itself. Shortwave 254 nm is the demanding wavelength — it wakes willemite's electric green against calcite's ember red on the Franklin plate. Longwave 365 nm draws out the deeper violet responses. Then switch the lamp off and look at what daylight shows you: almost nothing. That contrast is the entire phenomenon George Gabriel Stokes named after fluorite in 1852, and it remains the most theatrical party trick in mineralogy.",
    accent: "#a3f58a",
    features: [
      {
        title: "Two wavelengths, two portraits",
        body: "Different activator ions answer different photon energies, so a single specimen holds two completely different colour portraits. The bench lets you flip between them exactly as the lab's dual-lamp rig does.",
      },
      {
        title: "Activator chemistry, visible",
        body: "A few hundred parts per million of Mn²⁺ turn willemite neon green and calcite ember red. Fluorescence is the rare moment when trace impurity — usually the enemy of value — becomes the whole point.",
      },
      {
        title: "Darkness is a material",
        body: "Your eyes need thirty seconds of dark adaptation before the colours reach full strength. In the salon the room is choreographed around that physiology; on this page, patience works the same way.",
      },
    ],
    quote: {
      text: "Every gallery has a room visitors talk about at dinner. Ours is the one where we turn the lights off.",
      author: "Dr. Elena Marsh",
      role: "Chief Curator & Principal Mineralogist",
    },
    faqs: [
      {
        q: "Which specimens in the archive should I see under UV?",
        a: "Start with the Willemite & Calcite plate from Franklin, New Jersey — the Fluorescent cabinet's masterwork — and the Phantom Fluorite, whose fluorescence gave the phenomenon its name.",
      },
      {
        q: "Is the fluorescence permanent, or does it fade with exposure?",
        a: "The activator atoms are part of the crystal lattice; the response does not wear out. A willemite that glowed for Franklin's miners in 1900 answers a lamp today with undiminished enthusiasm.",
      },
    ],
    cta: "Switch on the UV bench",
  },

  deeptime: {
    page: "deeptime",
    overline: "Planetary Chronology",
    title: "4.56 billion years,",
    titleAccent: "six geological acts",
    tagline: "Minerals did not witness Earth's evolution — they co-authored it",
    intro:
      "Every specimen in the vault has a birthday, and most of them make human history look like a rounding error. This page arranges the archive along the deepest timeline of all: from iron that condensed before Earth existed, to crystals grown in our own laboratory this decade.",
    essay:
      "Travel the six acts in order. Presolar iron and Hadean zircon open the story in a universe without continents; the Great Oxidation paints the planet's first copper greens and blues; Cambrian life learns crystallography and never stops; hydrothermal cathedrals grow the gems; and the modern epoch adds fifty new species a year while laboratories imitate nature's patience. At each act, the minerals named are the very plates waiting in the vault — deep time, with a catalogue number.",
    accent: "#e6b45a",
    features: [
      {
        title: "A timeline you can touch",
        body: "Most geological timelines are diagrams. Ours is inventory: the Mundrabilla meteorite is Act I, Katanga malachite is Act III, California gold is Act V — each era is anchored to a physical object in the building.",
      },
      {
        title: "Minerals as Earth's diary",
        body: "Over two-thirds of all known species exist because life changed the planet's chemistry. The chronology shows mineralogy and biology writing each other's history, entry by entry.",
      },
      {
        title: "From nebula to laboratory",
        body: "The final act is still being written — new species are ratified every year and crystal-growth labs now build forms nature makes only rarely. The archive collects both ends of that story.",
      },
    ],
    quote: {
      text: "Hold a zircon and you hold the oldest object you will ever touch. Everything else in this building — including the building — is younger.",
      author: "Prof. Dayo Adeyemi",
      role: "Director of Crystallographic Research",
    },
    faqs: [
      {
        q: "What is the oldest object in the archive?",
        a: "The iron of the Mundrabilla meteorite crystallised roughly 4.56 billion years ago, in the core of a protoplanet — predating Earth's crust, oceans and every living cell.",
      },
      {
        q: "How are these ages actually known?",
        a: "Radiometric clocks inside the crystals themselves: uranium decaying to lead in zircon, and isotope ratios in meteorite metal, tick at rates no earthly process can reset. The dates are read from the lattice, not guessed from the landscape.",
      },
    ],
    cta: "Walk the six acts",
  },

  stories: {
    page: "stories",
    overline: "Curatorial Journal",
    title: "Notes from",
    titleAccent: "the Mineralogical Desk",
    tagline: "Long-form reading for collectors who ask 'why', not just 'how much'",
    intro:
      "Field Notes is the salon's journal: essays by our curators and laboratory directors on the ideas behind the glass. No market reports, no price lists — just the physics, chemistry and history that make a crystal worth a second look.",
    essay:
      "Begin with the founding question — what exactly is a mineral? — and discover why glacier ice qualifies while obsidian and opal, for all their beauty, remain magnificent outlaws. Continue with the patient architecture of crystal growth, where the flattest faces are paradoxically the slowest-growing, and close with iron from the heart of a vanished world: how an etched slab from the Nullarbor preserves a planetary core no foundry could counterfeit. Each dispatch is written to be read in one sitting and remembered for years.",
    accent: "#f27d9e",
    features: [
      {
        title: "Written by the desk, not a content team",
        body: "Every dispatch is signed by the curator or laboratory director responsible for the specimens it discusses — the same people who answer the concierge line.",
      },
      {
        title: "Ideas, illustrated by inventory",
        body: "The essays argue from real plates in the vault: diamond versus graphite from the collection's shelves, phantom fluorite as a flight recorder, Mundrabilla iron as a planetary core sample.",
      },
      {
        title: "Read in minutes, kept for years",
        body: "Each piece is a single-sitting read with a pull-quote worth stealing — the journal's quiet ambition is to change how you look at every stone afterwards, including your own.",
      },
    ],
    quote: {
      text: "Chemistry merely proposes; the crystal lattice disposes. If a reader leaves with only that sentence, the journal has done its work.",
      author: "Dr. Elena Marsh",
      role: "Chief Curator & Principal Mineralogist",
    },
    faqs: [
      {
        q: "I know nothing about mineralogy. Where do I start?",
        a: "With 'What exactly is a mineral?' — six minutes that will permanently change how you see ice, glass and gemstones. The other dispatches assume nothing beyond curiosity.",
      },
      {
        q: "Can I suggest a topic for a future dispatch?",
        a: "Collectors' questions are the journal's best source. Send yours through the concierge desk; questions that stump the desk become essays.",
      },
    ],
    cta: "Read the dispatches",
  },

  visit: {
    page: "visit",
    overline: "Private Salon & Collector Desk",
    title: "Acquire & consult",
    titleAccent: "by personal conversation",
    tagline: "Museum-calibre specimens are never bought from a shopping cart",
    intro:
      "Vernajewel is a private salon, not a storefront. There is no checkout on this site because there should not be: pieces of this calibre are acquired the way they were collected — personally, with documentation, and with time to look properly. This page is the door to that conversation.",
    essay:
      "The protocol is simple and deliberately old-fashioned. Ask for a dossier on any specimen and the desk returns daylight and ultraviolet macro video, exact dimensions, a condition report and the provenance file. Review the historical labels, commission a custom-fitted brass armature if the piece is joining a collection or an interior, and when you are certain, insured white-glove delivery is arranged door-to-door, worldwide. Telephone, WhatsApp, Telegram, or the inquiry form below — every channel reaches a person, and that person is a curator.",
    accent: "#e6b45a",
    features: [
      {
        title: "Dossier before decision",
        body: "Daylight & UV macro cinematography, millimetre dimensions, condition reporting and the full provenance chain — everything a prudent collector asks for, offered before you have to ask.",
      },
      {
        title: "Bespoke presentation",
        body: "Custom-milled solid brass armatures and museum-grade micro-climate crating are commissioned in-house, so the specimen arrives as an object already composed for its room.",
      },
      {
        title: "A curator answers",
        body: "The concierge line is staffed by the curatorial desk itself, Tue–Sun, with same-day personal response. Collecting from abroad? The guided tour walks you through the salon plate by plate.",
      },
    ],
    quote: {
      text: "Nobody should buy a four-billion-year-old object the way they buy a book. Slow is not our limitation; it is our service.",
      author: "Dr. Elena Marsh",
      role: "Chief Curator & Principal Mineralogist",
    },
    faqs: [
      {
        q: "Can I view a specimen before deciding?",
        a: "Yes — in person at the salon by appointment, or remotely through live video and the full dossier service. Private viewings include the Glow Room with the lamps off and your shortlist on the tray.",
      },
      {
        q: "Do you ship internationally?",
        a: "Worldwide, with museum-grade micro-climate crating, full insurance and white-glove courier handling arranged by the desk. Duties and import formalities are discussed transparently before dispatch.",
      },
    ],
    cta: "Meet the concierge desk",
  },
};

export const NAV_PAGE_ORDER: NavPageId[] = [
  "highlights",
  "categories",
  "collection",
  "glow",
  "deeptime",
  "stories",
  "visit",
];
