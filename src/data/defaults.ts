import { PHOTOS, type SpecimenPhoto } from "./photography";

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
}

export interface MineralItem {
  id: string;
  catalog: string;
  name: string;
  epithet: string;
  formula: string;
  category: string;
  mohs: number;
  mohsLabel: string;
  system: string;
  luster: string;
  locality: string;
  acquired: string;
  size: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  accent: string;
  glow?: string;
  provenance?: string;
  grade?: string;
  photoId: string;
  story: string;
  curatorNote: string;
  highlight?: { index: string; title: string; body: string };
}

/** One header navigation button. Built-ins mirror home sections;
 *  admin-added custom links carry `custom: true`. */
export interface HeaderNavItem {
  id: string;
  label: string;
  blurb: string;
  promise: string;
  href: string;
  visible: boolean;
  custom?: boolean;
}

export interface FooterLink {
  label: string;
  /** Destination section/page id (see Footer `go`). */
  targetId: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterSocial {
  id: string;
  label: string;
  href: string;
  icon: "instagram" | "youtube" | "x";
}

export interface EraItem {
  id: string;
  age: string;
  unit: string;
  title: string;
  body: string;
  minerals: string[];
  accent: string;
  photoId?: string;
}

export interface ArticleItem {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  minutes: number;
  author: string;
  role: string;
  photoId: string;
  paragraphs: string[];
  pullQuote: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}

export interface IntroTile {
  value: string;
  label: string;
  accent: string;
}

export interface EmissionFact {
  name: string;
  formula: string;
  color: string;
  emits: string;
}

export interface VisitInfoCard {
  id: string;
  icon: "clock" | "phone" | "map" | "message";
  accent: string;
  title: string;
  lines: string[];
}

export interface ProtocolStep {
  step: string;
  title: string;
  detail: string;
}

export type BuiltinSectionId =
  | "hero"
  | "intro"
  | "highlights"
  | "categories"
  | "collection"
  | "glow"
  | "deeptime"
  | "stories"
  | "visit";

/** Built-in sections plus admin-created custom sections (`custom-…`). */
export type SectionId = BuiltinSectionId | (string & {});

/** A fully admin-authored section: every text, photo and element is
 *  editable from the Admin Panel, and it can be added, reordered,
 *  hidden or deleted exactly like a built-in section. */
export interface CustomSectionItem {
  id: string;
  /** Name shown in the admin's section list. */
  label: string;
  overline: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  body: string;
  accent: string;
  photoId: string;
  layout: "split" | "center" | "cards";
  /** Bullet / card points — add, edit and remove freely in the panel. */
  points: string[];
  ctaText: string;
  ctaHref: string;
}

export interface SectionMeta {
  id: SectionId;
  label: string;
  visible: boolean;
}

export interface BuyerInquiry {
  id: string;
  createdAt: string;
  name: string;
  contact: string;
  message: string;
  specimenId?: string;
  specimenName?: string;
  specimenCatalog?: string;
  status: "new" | "replied";
}

export interface SiteConfig {
  brand: {
    name: string;
    subtitle: string;
    estLabel: string;
    footerTagline: string;
    copyrightText: string;
  };
  header: {
    /** One entry per header nav button (built-ins + custom links). */
    navItems: HeaderNavItem[];
    contactLabel: string;
    contactBlurb: string;
    contactPromise: string;
    contactHref: string;
    showContactCta: boolean;
    /** Mobile-menu heading above the category page links. */
    categoryPagesLabel: string;
    /** Dropdown meta suffix after the specimen count. */
    dropdownPageSuffix: string;
  };
  footer: {
    columns: FooterColumn[];
    socials: FooterSocial[];
    cabinetsTitle: string;
    exhibitionHomeLabel: string;
    adminButtonLabel: string;
    backToTopLabel: string;
    showAdminButton: boolean;
    showSocials: boolean;
  };
  contact: {
    phoneDisplay: string;
    phoneHref: string;
    whatsappNumber: string;
    telegramHandle: string;
    email: string;
    address: string;
    availabilityNote: string;
  };
  sectionsOrder: SectionMeta[];
  hero: {
    badgeText: string;
    editionText: string;
    titleLine1: string;
    titleLine2Prefix: string;
    titleLine2Highlight: string;
    description: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    featuredSpecimenId: string;
    tickerLabel: string;
    showTicker: boolean;
    stats: StatItem[];
    /** Optional media-library photos for the 4 cinematic backdrop
     *  slots; an empty slot keeps the built-in gallery plate. */
    backdropPhotoIds: string[];
    /** Rotating museum-seal text after the brand name. */
    sealText: string;
    /** Show / hide the rotating museum seal element. */
    showSeal: boolean;
    /** Show / hide the opening brand title-card element. */
    showOpening: boolean;
    /** Explicit hero slider specimens (in order). Empty = automatic:
     *  the featured specimen followed by the next four in the vault. */
    slideSpecimenIds: string[];
  };
  intro: {
    chapter: string;
    overline: string;
    quotePrefix: string;
    quoteHighlight: string;
    quoteSuffix: string;
    curatorName: string;
    curatorRole: string;
    curatorInitials: string;
    paragraph1: string;
    paragraph2: string;
    tiles: IntroTile[];
    pubOverline: string;
    pubTitlePrefix: string;
    pubTitleHighlight: string;
    pubDescription: string;
    pubButtonText: string;
    /** Where the consultation banner button leads ("#visit", "#/contact", …). */
    pubButtonHref: string;
    /** Show / hide the curator signature under the big quote. */
    showCurator: boolean;
    /** Show / hide the private-consultation banner entirely. */
    showBanner: boolean;
  };
  highlights: {
    chapter: string;
    overline: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    accent: string;
  };
  collection: {
    chapter: string;
    overline: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    accent: string;
    showSearch: boolean;
    showSort: boolean;
    showSavedFilter: boolean;
    /** Show / hide the category filter chips row. */
    showCategoryChips: boolean;
    searchPlaceholder: string;
    savedLabel: string;
    sortLabelName: string;
    sortLabelRarity: string;
    sortLabelHardest: string;
    sortLabelSoftest: string;
    /** Supports `{shown}` and `{total}` placeholders. */
    resultCountText: string;
    resetFiltersText: string;
    cardButtonText: string;
    emptyTitle: string;
    emptyText: string;
    emptySavedText: string;
    emptyButtonText: string;
  };
  glow: {
    chapter: string;
    overline: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    accent: string;
    photoId: string;
    specimenLabel: string;
    caption254: string;
    caption365: string;
    captionOff: string;
    note: string;
    emissions: EmissionFact[];
    /** Lamp console labels (all editable). */
    consoleTitle: string;
    lampLabel: string;
    wavelengthLabel: string;
    shortwaveLabel: string;
    longwaveLabel: string;
    intensityLabel: string;
    resetLabel: string;
    emissionsTitle: string;
    badgePrefix: string;
    badgeOffText: string;
    creditText: string;
    /** How the lab opens for the visitor (the reset button returns here). */
    defaultLampOn: boolean;
    defaultWavelength: number;
    defaultIntensity: number;
  };
  deeptime: {
    chapter: string;
    overline: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    accent: string;
    /** Small hint beside the timeline arrows. */
    dragHint: string;
    eras: EraItem[];
  };
  stories: {
    chapter: string;
    overline: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    accent: string;
    /** Micro-labels on the cards and inside the reading modal. */
    minutesSuffix: string;
    modalReadLabel: string;
    modalFooterNote: string;
    modalBackLabel: string;
    articles: ArticleItem[];
  };
  visit: {
    tourOverline: string;
    tourTitlePrefix: string;
    tourTitleHighlight: string;
    tourDescription: string;
    tourButtonText: string;
    tourPhotoId: string;
    chapter: string;
    overline: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    protocolSteps: ProtocolStep[];
    infoCards: VisitInfoCard[];
    inquiryTitlePrefix: string;
    inquiryTitleHighlight: string;
    inquiryDescription: string;
    /** Direct-contact channel button labels. */
    callLabel: string;
    whatsappLabel: string;
    telegramLabel: string;
    /** Prefilled WhatsApp message — supports `{brand}`. */
    whatsappPrefill: string;
    /** Inquiry form texts. */
    namePlaceholder: string;
    contactPlaceholder: string;
    generalInquiryLabel: string;
    messagePlaceholder: string;
    sendButtonText: string;
    successTitle: string;
    /** Supports `{name}` (", Name" when given) and `{contact}`. */
    successText: string;
    sendAnotherText: string;
    errorText: string;
    defaultInquiryName: string;
    defaultInquiryMessage: string;
  };
  categoriesSection: {
    /** Small badge in the heading row (defaults to "Cabinets"). */
    chapter: string;
    overline: string;
    /** Supports the `{count}` placeholder (number of cabinets). */
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    accent: string;
  };
  categories: CategoryItem[];
  customSections: CustomSectionItem[];
  /** Built-in sections the admin deliberately deleted — remembered so
   *  the defaults-merge never resurrects them on the next load. */
  deletedSectionIds: string[];
  media: Record<string, SpecimenPhoto>;
  minerals: MineralItem[];
  inquiries: BuyerInquiry[];
  /** Arabic content overlay (translated strings only) — merged over
   *  the base config when the site language is Arabic. Written by the
   *  Admin Panel's Arabic editing mode; see src/data/i18n.ts. */
  ar?: unknown;
}

export const DEFAULT_CONFIG: SiteConfig = {
  brand: {
    name: "Vernajewel",
    subtitle: "Haute Mineralogie · Private Salon & Archive",
    estLabel: "CURATED ARCHIVE · GENEVA · LONDON · SAN FRANCISCO",
    footerTagline:
      "An international private salon dedicated to museum-calibre crystals, native precious metals, and pre-terrestrial meteorites — presented with full provenance for private collectors, institutions, and architectural spaces.",
    copyrightText: "© 2026 Vernajewel Haute Mineralogie · Private Salon & Archival Consultations",
  },
  contact: {
    phoneDisplay: "+1 (415) 890-4312",
    phoneHref: "+14158904312",
    whatsappNumber: "14158904312",
    telegramHandle: "Vernajewel",
    email: "concierge@Vernajewel.com",
    address: "12 Meridian Avenue, Suite 2B · Museum Quarter",
    availabilityNote: "Tue – Sun · 10:00 – 19:00 · Personal response from our curatorial desk",
  },
  header: {
    navItems: [
      {
        id: "highlights",
        label: "Highlights",
        blurb: "Masterworks of the Salon",
        promise:
          "The icons the whole exhibition is built around — Sweet Home rhodochrosite, Mundrabilla iron, crystalline gold and phantom fluorite, each with its full story.",
        href: "#/highlights",
        visible: true,
      },
      {
        id: "categories",
        label: "Cabinets",
        blurb: "Five cabinets, five worlds",
        promise:
          "A dedicated page for every cabinet — Gemstones, Metals & Ores, Meteorites, Fluorescent and Classic Species — with its own essay, stats and specimen list.",
        href: "#/cabinets",
        visible: true,
      },
      {
        id: "collection",
        label: "Collection",
        blurb: "The Specimen Vault",
        promise:
          "Every catalogued plate in one searchable vault: filter by cabinet, compare Mohs hardness and rarity, build a private shortlist and inquire directly.",
        href: "#/collection",
        visible: true,
      },
      {
        id: "glow",
        label: "Glow Room",
        blurb: "Photoluminescence Lab",
        promise:
          "Take command of the UV bench — switch between 254 nm and 365 nm and watch Franklin willemite and calcite ignite in the dark.",
        href: "#/glow-room",
        visible: true,
      },
      {
        id: "deeptime",
        label: "Deep Time",
        blurb: "Planetary Chronology",
        promise:
          "Six geological acts across 4.56 billion years — from presolar iron and Hadean zircon to hydrothermal cathedrals and lab-grown bismuth.",
        href: "#/deep-time",
        visible: true,
      },
      {
        id: "stories",
        label: "Field Notes",
        blurb: "Curatorial Journal",
        promise:
          "Long-form dispatches from the mineralogical desk: what a mineral really is, how crystals grow, and iron from the heart of a vanished world.",
        href: "#/field-notes",
        visible: true,
      },
    ],
    contactLabel: "Direct contact",
    contactBlurb: "Private Salon & Collector Desk",
    contactPromise:
      "No shopping cart, no checkout — request a dossier, daylight & UV macro video and provenance papers by telephone, WhatsApp or Telegram, answered personally by the curatorial desk.",
    contactHref: "#/contact",
    showContactCta: true,
    categoryPagesLabel: "Category pages",
    dropdownPageSuffix: "dedicated page",
  },
  footer: {
    columns: [
      {
        id: "col-exhibition",
        title: "Exhibition",
        links: [
          { label: "Masterwork Highlights", targetId: "highlights" },
          { label: "The Specimen Vault", targetId: "collection" },
          { label: "Photoluminescence Lab", targetId: "glow" },
          { label: "Deep Time Chronology", targetId: "deeptime" },
        ],
      },
      {
        id: "col-journal",
        title: "Curatorial Journal",
        links: [
          { label: "All Dispatches", targetId: "stories" },
          { label: "Laws of Crystalline Matter", targetId: "stories" },
          { label: "Crystal Growth Physics", targetId: "stories" },
          { label: "Pre-Terrestrial Iron", targetId: "stories" },
        ],
      },
      {
        id: "col-salon",
        title: "Private Salon",
        links: [
          { label: "Collector Concierge", targetId: "visit" },
          { label: "Telephone & WhatsApp Desk", targetId: "visit" },
          { label: "Request a Dossier", targetId: "visit" },
          { label: "Curatorial Manifesto", targetId: "intro" },
        ],
      },
    ],
    socials: [
      { id: "soc-instagram", label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
      { id: "soc-youtube", label: "YouTube", href: "https://www.youtube.com", icon: "youtube" },
      { id: "soc-x", label: "X (Twitter)", href: "https://www.x.com", icon: "x" },
    ],
    cabinetsTitle: "The Cabinets",
    exhibitionHomeLabel: "← Exhibition home",
    adminButtonLabel: "Admin Panel",
    backToTopLabel: "Back to the surface",
    showAdminButton: true,
    showSocials: true,
  },
  sectionsOrder: [
    { id: "hero", label: "Hero Showcase", visible: true },
    { id: "intro", label: "Curatorial Manifesto", visible: true },
    { id: "highlights", label: "Masterwork Highlights", visible: true },
    { id: "categories", label: "The Cabinets (Category Pages)", visible: true },
    { id: "collection", label: "The Specimen Vault", visible: true },
    { id: "glow", label: "Glow Room (UV Lab)", visible: true },
    { id: "deeptime", label: "Deep Time Chronology", visible: true },
    { id: "stories", label: "Curatorial Journal", visible: true },
    { id: "visit", label: "Private Salon & Concierge", visible: true },
  ],
  hero: {
    badgeText: "Haute Mineralogie · Curated Archive",
    editionText: "Catalogue Raisonné · 2026",
    titleLine1: "Wonders of the",
    titleLine2Prefix: "Mineral",
    titleLine2Highlight: "World",
    description:
      "Earth’s rarest natural sculptures — museum-calibre crystals, unmelted native gold, and four-billion-year-old cosmic irons. Curated across 120 localities for private acquisition and direct curatorial consultation.",
    primaryCtaText: "Enter the vault",
    secondaryCtaText: "Launch curatorial tour",
    featuredSpecimenId: "amethyst",
    tickerLabel: "Archival Plates · Ten Masterworks",
    showTicker: true,
    backdropPhotoIds: ["", "", "", ""],
    sealText: "COLLECTION · 2026 ·",
    showSeal: true,
    showOpening: true,
    slideSpecimenIds: [],
    stats: [
      { value: 80000, suffix: "+", label: "Catalogued archive specimens" },
      { value: 4.56, suffix: "B", label: "Years of planetary history", decimals: 2 },
      { value: 120, suffix: "", label: "Historic & alpine localities" },
    ],
  },
  intro: {
    chapter: "01 / 06",
    overline: "Curatorial Manifesto",
    quotePrefix: "“Before human hands ever carved marble or cast bronze, ",
    quoteHighlight: "the Earth was sculpting in darkness",
    quoteSuffix: " — one atom, one millennium at a time.”",
    curatorName: "Dr. Elena Marsh",
    curatorRole: "Chief Curator & Principal Mineralogist",
    curatorInitials: "EM",
    paragraph1:
      "Assembled through generations of high-altitude expeditions, historic European estate dispersions, and institutional exchanges, the Vernajewel archive preserves natural sculptures that can never be mined again — pristine crystal architectures recovered from pockets long since sealed by time.",
    paragraph2:
      "We operate as a private curatorial salon rather than an automated storefront. Every specimen is accompanied by its geological biography, historical pedigree, and custom-fitted brass display armature. Explore the plates below, and connect directly with our curators by telephone, WhatsApp, or private message.",
    tiles: [
      { value: "6,100+", label: "Recognised mineral species", accent: "#b48cf2" },
      { value: "1826", label: "Earliest archival pedigree", accent: "#e6b45a" },
      { value: "100%", label: "Unrepaired natural aesthetics", accent: "#8fe4df" },
      { value: "1 : 1", label: "Bespoke collector advisory", accent: "#f27d9e" },
    ],
    pubOverline: "Private Collector Concierge",
    pubTitlePrefix: "Acquiring for a ",
    pubTitleHighlight: "Private Collection or Interior?",
    pubDescription:
      "Request daylight and UV macro cinematography, complete provenance dossiers, custom-milled brass mounts, or a private one-on-one consultation with our curatorial desk.",
    pubButtonText: "Speak with a curator",
    pubButtonHref: "#visit",
    showCurator: true,
    showBanner: true,
  },
  highlights: {
    chapter: "01 / 06",
    overline: "Masterworks of the Salon",
    titlePrefix: "Four icons, ",
    titleHighlight: "four unrepeatable moments",
    subtitle:
      "Benchmarks of colour saturation, geometric perfection, and closed-mine provenance — the cornerstone specimens around which our permanent exhibition is built.",
    accent: "#d7bdf7",
  },
  collection: {
    chapter: "02 / 06",
    overline: "Catalogue Raisonné",
    titlePrefix: "The Specimen ",
    titleHighlight: "Vault",
    subtitle:
      "Examine ten signature plates from the Vernajewel archive. Filter by mineralogical lineage, compare crystal symmetry and Mohs hardness, curate your private shortlist, and inquire directly on any piece.",
    accent: "#8fe4df",
    showSearch: true,
    showSort: true,
    showSavedFilter: true,
    showCategoryChips: true,
    searchPlaceholder:
      "Search species, chemistry, provenance, or locality… try “Tsumeb”, “copper” or “Pakistan”",
    savedLabel: "Saved",
    sortLabelName: "Name · A–Z",
    sortLabelRarity: "Rarest first",
    sortLabelHardest: "Hardest first",
    sortLabelSoftest: "Softest first",
    resultCountText: "Showing {shown} of {total} specimens",
    resetFiltersText: "Reset filters",
    cardButtonText: "Details & Direct Inquiry",
    emptyTitle: "No specimens match that search",
    emptyText: "Try a broader term, or clear the filters to see the whole vault.",
    emptySavedText:
      "You haven't saved any specimens yet — tap the heart on a card to build your private shortlist.",
    emptyButtonText: "Show all specimens",
  },
  glow: {
    chapter: "03 / 06",
    overline: "Gallery V · Photoluminescence Lab",
    titlePrefix: "Stones that ",
    titleHighlight: "awaken in the dark",
    subtitle:
      "Beneath shortwave and longwave ultraviolet light, silent metamorphic matrix erupts into spectral fire. Take command of the optical bench below to witness quantum excitation in real time.",
    accent: "#a3f58a",
    photoId: "willemite",
    specimenLabel: "Willemite + Calcite · Franklin UV Plate",
    caption254:
      "Shortwave 254 nm — manganese-activated willemite ignites electric green against incandescent crimson calcite.",
    caption365:
      "Longwave 365 nm — lower-energy photons coax a deep royal-violet luminescence across the crystal boundaries.",
    captionOff:
      "Ambient daylight — an unassuming grey Precambrian zinc-marble ore, hiding its entire spectrum within.",
    note: "Fewer than fifteen percent of known mineral species fluoresce. Trace activator ions — here divalent manganese — absorb invisible ultraviolet photons, leap to excited electron orbitals, and shed the surplus energy as pure visible colour. Sir George Gabriel Stokes named the phenomenon after fluorite in 1852.",
    emissions: [
      { name: "Willemite", formula: "Zn₂SiO₄", color: "#a3f58a", emits: "Electric emerald" },
      { name: "Calcite", formula: "CaCO₃", color: "#ff9a70", emits: "Incandescent crimson" },
      { name: "Fluorite", formula: "CaF₂", color: "#b48cf2", emits: "Deep violet-blue" },
    ],
    consoleTitle: "Lamp console",
    lampLabel: "Ultraviolet lamp",
    wavelengthLabel: "Wavelength",
    shortwaveLabel: "Shortwave · 254",
    longwaveLabel: "Longwave · 365",
    intensityLabel: "Lamp intensity",
    resetLabel: "Reset console",
    emissionsTitle: "What you're seeing",
    badgePrefix: "UV lamp",
    badgeOffText: "Daylight · lamp off",
    creditText: "Interactive lighting visualization. Photo credit:",
    defaultLampOn: true,
    defaultWavelength: 254,
    defaultIntensity: 75,
  },
  deeptime: {
    chapter: "04 / 06",
    overline: "Planetary Chronology",
    titlePrefix: "4.56 billion years, ",
    titleHighlight: "six geological acts",
    subtitle:
      "Minerals did not merely witness Earth’s evolution — they co-authored it. Trace the planetary archive from presolar nebula condensates to modern crystal synthesis.",
    accent: "#e6b45a",
    dragHint: "Drag or scroll",
    eras: [
      {
        id: "era-stardust",
        age: "4.56",
        unit: "billion years ago",
        title: "The Presolar Crucible",
        body: "Before Earth coalesced, a protoplanetary disc of incandescent gas and silicate dust circled the infant Sun. Nickel-iron alloys and olivine droplets condensed above 1,400 °C — primordial matter preserved intact within the iron meteorites of our vault.",
        minerals: ["Kamacite–Taenite", "Olivine", "Troilite"],
        accent: "#b9c9dc",
        photoId: "meteorite",
      },
      {
        id: "era-zircon",
        age: "4.40",
        unit: "billion years ago",
        title: "Witnesses to a Water World",
        body: "In the Jack Hills of Western Australia, microscopic prisms of Hadean zircon outlived the continents that bore them. Trapped uranium atoms decay to lead inside each lattice with atomic precision — proving liquid oceans existed on Earth almost from the beginning.",
        minerals: ["Hadean Zircon", "Quartz"],
        accent: "#e6b45a",
      },
      {
        id: "era-rusting",
        age: "2.40",
        unit: "billion years ago",
        title: "The Great Oxidation Bloom",
        body: "When marine cyanobacteria began exhaling free oxygen, the planet’s surface chemistry transformed forever. Over two thousand new oxide and carbonate minerals blossomed across the crust — including the lush emerald bands of malachite and royal blades of azurite.",
        minerals: ["Malachite", "Azurite", "Hematite"],
        accent: "#4fd9a6",
        photoId: "malachite",
      },
      {
        id: "era-cambrian",
        age: "540",
        unit: "million years ago",
        title: "When Life Learned Crystallography",
        body: "At the dawn of the Cambrian Period, marine organisms mastered biomineralisation — precipitating aragonite nacre, calcite armour, and apatite bone. Biology and geology merged; today, more than two-thirds of Earth’s mineral species are tied to the biosphere.",
        minerals: ["Calcite", "Aragonite", "Apatite"],
        accent: "#8fe4df",
      },
      {
        id: "era-veins",
        age: "250",
        unit: "million years ago",
        title: "Hydrothermal Cathedrals",
        body: "Tectonic collisions forced superheated, mineral-laden brines through deep crustal fractures. Cooling by fractions of a degree per century, these subterranean chambers grew gem tourmalines, zoned phantom fluorites, and arborescent leaves of native gold.",
        minerals: ["Native Gold", "Fluorite", "Beryl"],
        accent: "#b48cf2",
        photoId: "gold",
      },
      {
        id: "era-today",
        age: "Today",
        unit: "the modern epoch",
        title: "The Sixth Epoch of Matter",
        body: "Mineralogy remains an unfinished frontier: fifty new natural species are approved each year, while crystal-growth laboratories coax pure elements into architectures too fleeting for nature — exemplified by the stepped, oxide-iridescent hopper spirals of bismuth.",
        minerals: ["Hopper Bismuth", "Rare-Earth Silicates"],
        accent: "#f5a0d6",
        photoId: "bismuth",
      },
    ],
  },
  stories: {
    chapter: "05 / 06",
    overline: "Curatorial Journal",
    titlePrefix: "Notes from ",
    titleHighlight: "the Mineralogical Desk",
    subtitle:
      "Long-form dispatches from our curators and laboratory directors on crystal physics, closed-mine provenance, and the art of living with deep time.",
    accent: "#f27d9e",
    minutesSuffix: "min",
    modalReadLabel: "min read",
    modalFooterNote: "From the field notes",
    modalBackLabel: "Back to the gallery",
    articles: [
      {
        id: "what-is-a-mineral",
        tag: "Fundamentals",
        tagColor: "#8fe4df",
        title: "What exactly is a mineral?",
        excerpt:
          "Five uncompromising laws govern what earns the title — explaining why glacial ice qualifies as a true mineral while volcanic obsidian and precious opal remain magnificent outlaws.",
        minutes: 6,
        author: "Dr. Elena Marsh",
        role: "Chief Curator & Principal Mineralogist",
        photoId: "aquamarine",
        paragraphs: [
          "In casual conversation, almost anything pulled from a mountain is called a stone. In crystallography, however, the word mineral is guarded by five strict criteria: a substance must be naturally occurring, formed through abiogenic geological processes, solid at ambient temperature, defined by a specific chemical formula, and — most decisive of all — ordered into a repeating three-dimensional atomic lattice.",
          "That final requirement draws fascinating borders across the natural world. Glacial snowfall, once compacted into crystalline ice, satisfies all five laws; liquid mercury, though native to cinnabar veins, fails solidity until chilled below −39 °C. Volcanic obsidian cools too rapidly for its silica tetrahedra to organise, remaining an amorphous glass, while precious opal owes its play-of-colour to microscopic silica spheres rather than a true atomic lattice.",
          "Why insist on geometry? Because structure is destiny. Diamond and graphite share an identical formula — pure elemental carbon — yet one cleaves light with unmatched Mohs-10 hardness while the other parts at the touch of paper. Four-fold covalent cages in the mantle produce brilliance; hexagonal sheets produce shadow. Chemistry merely proposes; the crystal lattice disposes.",
          "More than 6,100 species have now been ratified by the International Mineralogical Association, from ubiquitous quartz to alpine rarities known from a single pinhead grain. When you stand before a vitrine at Vernajewel, you are not looking at carved ornament — you are looking at matter solving the equations of thermodynamics in stone.",
        ],
        pullQuote: "Chemistry merely proposes; the crystal lattice disposes.",
      },
      {
        id: "how-crystals-grow",
        tag: "Crystallography",
        tagColor: "#d7bdf7",
        title: "The patient architecture of crystal growth",
        excerpt:
          "From a sub-microscopic seed of order to an unrepaired alpine prism — the delicate hydrothermal physics behind every mirror-bright crystal face in the salon.",
        minutes: 8,
        author: "Prof. Dayo Adeyemi",
        role: "Director of Crystallographic Research",
        photoId: "fluorite",
        paragraphs: [
          "Every monumental crystal in our archive began as an improbability: a fleeting cluster of ions in a cooling subterranean fluid that locked into periodic symmetry rather than drifting apart. Nucleation requires supersaturation — a moment when pressure drops, temperature falls, or two incompatible brines collide inside a miarolitic cavity kilometres beneath a rising mountain range.",
          "Once a nucleus survives, the architecture of its faces is governed by speed. Paradoxically, the broad, mirror-flat planes we admire on a fluorite cube or aquamarine prism are the directions in which the crystal grew most slowly; rapid growth directions swiftly grow themselves out of existence, sharpening into points or branching into the feathery spinel-twinned dendrites of native California gold.",
          "Because hydrothermal pockets evolve over tens of thousands of years, a growing crystal acts as a chemical flight recorder. A subtle influx of trace iron tints the final millimetres of quartz royal amethyst; a shift in fluorine and rare-earth concentration traps an older violet cube like a ghost inside a younger sea-green fluorite; seasonal pulses of copper-rich groundwater write concentric emerald tree-rings into Katanga malachite.",
          "To recover such a cluster intact — surviving tectonic tremors, pocket collapse, and extraction at four thousand metres — is a statistical miracle. Nature never chisels a crystal from the outside in; she builds it outward, plane by plane, with a patience measured in epochs.",
        ],
        pullQuote:
          "Nature never chisels a crystal from the outside in; she builds it outward with a patience measured in epochs.",
      },
      {
        id: "meteorites",
        tag: "Cosmochemistry",
        tagColor: "#b9c9dc",
        title: "Iron from the heart of a vanished world",
        excerpt:
          "How a polished slab from Australia’s Nullarbor Plain preserves the slow-cooled metallic core of a shattered protoplanet older than the Earth itself.",
        minutes: 5,
        author: "Dr. Elena Marsh",
        role: "Chief Curator & Principal Mineralogist",
        photoId: "meteorite",
        paragraphs: [
          "Consider a date almost beyond human intuition: 4.567 billion years ago. Radiometric lead-isotope clocks confirm that iron meteorites crystallised within the first few million years of the solar system — long before Earth’s own crust had cooled, and nearly two billion years before the oldest surviving continental rocks.",
          "Specimens like our Mundrabilla octahedrite are fragments of planetary embryos: small worlds in the early asteroid belt that melted, segregated dense nickel-iron into molten cores, and were subsequently catastrophically shattered by hypervelocity impacts. To hold an etched slice of Mundrabilla is to peer directly into the core of a planet that never survived childhood.",
          "When polished and bathed in dilute nitric acid, the metal reveals its signature Widmanstätten weave — geometric ribbons of low-nickel kamacite interleaved with high-nickel taenite and bronze nodules of troilite. Those ribbons exsolved as the core cooled at an almost imperceptible one to five degrees Celsius per million years. No foundry on Earth can counterfeit four hundred million years of thermal equilibrium.",
          "Preserved by the arid limestone plateau of the Nullarbor Plain, Mundrabilla’s masses bridged cosmic solitude and human wonder. In a private salon or study, nothing commands quiet contemplation quite like pre-terrestrial iron: an object older than every mountain, ocean, and living cell on Earth.",
        ],
        pullQuote:
          "No foundry on Earth can counterfeit four hundred million years of thermal equilibrium.",
      },
    ],
  },
  visit: {
    tourOverline: "Private Digital Viewing",
    tourTitlePrefix: "Collecting from abroad? ",
    tourTitleHighlight: "Walk the salon plate by plate.",
    tourDescription:
      "Experience a curated ten-stop private walkthrough with full crystallographic dossiers, provenance notes, and one-click telephone or WhatsApp access at every vitrine.",
    tourButtonText: "Start the guided tour",
    tourPhotoId: "fluorite",
    chapter: "06 / 06",
    overline: "Private Salon & Collector Desk",
    titlePrefix: "Acquire & consult ",
    titleHighlight: "by personal conversation",
    subtitle:
      "True museum-calibre specimens are never acquired through an anonymous shopping cart. Connect directly with our curatorial desk by telephone, WhatsApp, or Telegram for macro video inspections, provenance papers, and bespoke mounting.",
    protocolSteps: [
      {
        step: "01",
        title: "Dossier & Macro Video",
        detail: "Request daylight & UV video, exact millimetre dimensions, and condition reports on any plate.",
      },
      {
        step: "02",
        title: "Provenance & Armature",
        detail: "Review historical collection labels and commission custom-fitted solid brass display mounts.",
      },
      {
        step: "03",
        title: "Insured White-Glove Delivery",
        detail: "Museum-grade micro-climate crating and private courier dispatch arranged door-to-door worldwide.",
      },
    ],
    infoCards: [
      {
        id: "info-hours",
        icon: "clock",
        accent: "#8fe4df",
        title: "Salon & Desk Hours",
        lines: [
          "Tue – Sun · 10:00 – 19:00",
          "Thursday Evening Salon · until 21:00",
          "Private viewings by appointment",
        ],
      },
      {
        id: "info-direct",
        icon: "phone",
        accent: "#e6b45a",
        title: "Direct Concierge Line",
        lines: [
          "Telephone · +1 (415) 890-4312",
          "WhatsApp & Telegram · Live video",
          "Same-day curatorial response",
        ],
      },
      {
        id: "info-location",
        icon: "map",
        accent: "#f27d9e",
        title: "Exhibition Salon",
        lines: [
          "Vernajewel Private Gallery",
          "12 Meridian Avenue · Suite 2B",
          "Museum Quarter · Vault Level",
        ],
      },
    ],
    inquiryTitlePrefix: "Request a ",
    inquiryTitleHighlight: "Private Dossier",
    inquiryDescription:
      "Select a specimen of interest or describe the scale and palette you are seeking. Our senior curator will reply personally with high-resolution video, provenance records, and acquisition terms.",
    callLabel: "Call",
    whatsappLabel: "WhatsApp Message",
    telegramLabel: "Telegram",
    whatsappPrefill: "Hello {brand}, I would like to ask about your mineral collection.",
    namePlaceholder: "Your name",
    contactPlaceholder: "Phone, WhatsApp or Email *",
    generalInquiryLabel: "General collection inquiry (optional)",
    messagePlaceholder: "Write your message or preferred time for a phone call…",
    sendButtonText: "Send Message",
    successTitle: "Message received.",
    successText: "Thank you{name}. We will reach back via {contact} shortly.",
    sendAnotherText: "Send another message",
    errorText: "Please enter a valid phone number, WhatsApp, or email address.",
    defaultInquiryName: "Collector Inquiry",
    defaultInquiryMessage: "Please contact me regarding the mineral collection.",
  },
  categoriesSection: {
    chapter: "Cabinets",
    overline: "The Cabinets",
    titlePrefix: "{count} cabinets,",
    titleHighlight: "{count} worlds",
    subtitle:
      "The salon is one room, but each discipline inside it has its own laws. Enter a cabinet to read its story, meet its defining specimens, and browse the full cabinet list on its own page.",
    accent: "#b48cf2",
  },
  customSections: [],
  deletedSectionIds: [],
  categories: [
    { id: "cat-gemstones", name: "Gemstones", color: "#8fe4df" },
    { id: "cat-metals", name: "Metals & Ores", color: "#e6b45a" },
    { id: "cat-meteorites", name: "Meteorites", color: "#b9c9dc" },
    { id: "cat-fluorescent", name: "Fluorescent", color: "#a3f58a" },
    { id: "cat-classic", name: "Classic Species", color: "#d7bdf7" },
  ],
  media: { ...PHOTOS },
  minerals: [
    {
      id: "amethyst",
      catalog: "LTH.47883",
      name: "Amethyst Cathedral",
      epithet: "Royal violet quartz within a Cretaceous basalt sanctuary",
      formula: "SiO₂",
      category: "Gemstones",
      mohs: 7,
      mohsLabel: "7",
      system: "Trigonal",
      luster: "Vitreous, mirror-bright",
      locality: "Artigas Border Basalts, Uruguay",
      acquired: "1962",
      size: "68 × 49 × 34 cm · 94 kg",
      rarity: 3,
      accent: "#b48cf2",
      provenance: "Ex. Montevideo Private Estate · Acquired by Vernajewel Archive, 1962",
      grade: "Architectural Salon Masterpiece · Natural Agate Rind",
      photoId: "amethyst",
      story:
        "One hundred and thirty million years ago, a gas cavity froze inside Paraná flood basalt as Gondwana rifted apart. Over millennia, silica-bearing groundwaters lined the chamber first with milky chalcedony bands, then with tightly packed terminations of iron-bearing quartz — naturally irradiated by the host rock into royal imperial violet with electric crimson flashes deep in the druse.",
      curatorNote:
        "Observe the pale agate halo framing the cavity: it acts like natural passe-partout, setting off some of the deepest grape-violet saturation ever recovered from the Artigas flows.",
    },
    {
      id: "rhodochrosite",
      catalog: "LTH.50701",
      name: "Rhodochrosite",
      epithet: "Incandescent cherry rhombohedra from a vanished alpine pocket",
      formula: "MnCO₃",
      category: "Classic Species",
      mohs: 3.75,
      mohsLabel: "3.5 – 4",
      system: "Trigonal",
      luster: "Vitreous to sub-adamantine",
      locality: "Sweet Home Mine, Alma, Colorado, USA",
      acquired: "1992",
      size: "11.4 × 9.8 × 5.2 cm",
      rarity: 5,
      accent: "#f27d9e",
      provenance: "Cash Flow Pocket (June 1992) · Ex. Alma Collector Vault",
      grade: "Museum Investment Icon · Historic Closed Mine",
      photoId: "rhodochrosite",
      story:
        "Recovered from the legendary 1992 Cash Flow Pocket high in Colorado’s Mosquito Range, this cluster of intergrown rhombohedra glows with translucent, jewel-clear cherry-crimson saturation. Because the Sweet Home Mine permanently sealed its specimen workings in 2004, pieces combining razor-sharp edges with internal gemminess have ascended into the pantheon of unattainable American classics.",
      curatorNote:
        "When backlit even softly, the entire cluster transmits a warm ruby-rose fire — an icon that anchors the finest private mineral cabinets in the world.",
      highlight: {
        index: "01",
        title: "Crimson geometry from a sealed mountain",
        body: "Lustrous cherry-red rhombohedra crystallized at 3,400 metres in Colorado’s Mosquito Range. Since the Sweet Home workings closed forever, specimens of this internal transparency have become generational heirlooms — irreplaceable benchmarks of mineralogical art.",
      },
    },
    {
      id: "mundrabilla",
      catalog: "LTH.11215",
      name: "Mundrabilla Meteorite",
      epithet: "Etched planetary core iron older than the Earth beneath it",
      formula: "Fe–Ni · FeS (IAB Octahedrite)",
      category: "Meteorites",
      mohs: 4.5,
      mohsLabel: "4 – 5",
      system: "Cubic / Octahedrite",
      luster: "Burnished metallic",
      locality: "Nullarbor Plain, Western Australia",
      acquired: "1966",
      size: "52 × 28 × 1.4 cm · Complete Slice",
      rarity: 5,
      accent: "#b9c9dc",
      provenance: "Nullarbor Strewn Field Recovery (1966) · Institutional Exchange",
      grade: "Complete Full Slice · Museum Acid-Etched Finish",
      photoId: "meteorite",
      story:
        "Cut from the celebrated Mundrabilla iron fall on the arid limestone expanse of Western Australia, this full slice reveals an extraordinary mosaic of crystalline nickel-iron interwoven with warm bronze troilite inclusions. Forged 4.56 billion years ago inside a differentiated asteroid core, its geometric Widmanstätten lattice cooled at roughly two degrees per million years in the vacuum of early space.",
      curatorNote:
        "Mundrabilla’s high troilite content creates a sculptural gold-and-steel mosaic unlike any other iron meteorite — an unmistakable cosmic canvas.",
      highlight: {
        index: "02",
        title: "Relic of a shattered protoplanet",
        body: "Cooled by fractions of a degree every millennium inside a primordial asteroid core, this etched nickel-iron and bronze-troilite slab predates every terrestrial rock on Earth — four and a half billion years of cosmic silence, polished to mirror clarity.",
      },
    },
    {
      id: "gold",
      catalog: "LTH.39112",
      name: "Crystalline Gold",
      epithet: "Spinel-twinned hydrothermal filigree risen from white quartz",
      formula: "Au",
      category: "Metals & Ores",
      mohs: 2.75,
      mohsLabel: "2.5 – 3",
      system: "Cubic",
      luster: "Brilliant metallic",
      locality: "Eagle's Nest Mine, Placer County, California, USA",
      acquired: "1987",
      size: "8.4 × 7.2 × 4.1 cm · 214 g",
      rarity: 4,
      accent: "#e6b45a",
      provenance: "Ex. Jaime Bird Collection · Sierra Nevada Gold Belt",
      grade: "Fine Cabinet Sculpture · Unmelted Natural Habit",
      photoId: "gold",
      story:
        "Fewer than one part in ten thousand of all mined gold survives the smelter in its natural crystal habit. Rising dramatically above snow-white hydrothermal quartz, this sculptural arborescence displays flattened octahedra and classic 'rabbit-ear' spinel twins — pure native gold precipitated atom by atom as superheated fluids decompressed along a Sierra Nevada fault.",
      curatorNote:
        "Notice how the golden spray leaps free of the quartz horizon with natural architectural balance — nature’s own haute joaillerie, untouched by a jeweller’s torch.",
      highlight: {
        index: "03",
        title: "The gold that escaped the crucible",
        body: "Almost all gold in human history was melted the day it saw sunlight. Here, pristine spinel-twinned leaves and octahedra soar off milky Sierra Nevada quartz — a breathtaking sculptural survival of Earth’s noblest metal.",
      },
    },
    {
      id: "aquamarine",
      catalog: "LTH.60660",
      name: "Aquamarine on Albite",
      epithet: "Glacial Karakoram beryl perched on porcelain cleavelandite",
      formula: "Be₃Al₂Si₆O₁₈",
      category: "Gemstones",
      mohs: 7.75,
      mohsLabel: "7.5 – 8",
      system: "Hexagonal",
      luster: "Vitreous, water-clear",
      locality: "Shengus, Shigar Valley, Gilgit-Baltistan, Pakistan",
      acquired: "2003",
      size: "15.0 × 14.0 × 12.0 cm",
      rarity: 3,
      accent: "#8fe4df",
      provenance: "Haramosh Massif Pegmatite (4,100 m) · Acquired 2003",
      grade: "Choice Alpine Matrix · Pristine Natural Termination",
      photoId: "aquamarine",
      story:
        "Poised vertically upon a sculptural mound of snow-white bladed albite feldspar, this glassy hexagonal prism of gem aquamarine exhibits crisp longitudinal striations and an untouched pinacoidal termination. Trace ferrous iron trapped within the beryl’s structural channels imparts its cool, high-altitude sea-foam blue — extracted by hand from a pegmatite cliff in the Karakoram.",
      curatorNote:
        "Contrast is the secret of great matrix mineralogy: icy vertical geometry rising effortlessly out of billowing porcelain-white feldspar.",
    },
    {
      id: "malachite",
      catalog: "LTH.28451",
      name: "Malachite",
      epithet: "Polished twin stalactites recording centuries of copper rain",
      formula: "Cu₂CO₃(OH)₂",
      category: "Classic Species",
      mohs: 3.75,
      mohsLabel: "3.5 – 4",
      system: "Monoclinic",
      luster: "Silky chatoyant",
      locality: "Kolwezi, Katanga Copper Crescent, DR Congo",
      acquired: "1975",
      size: "14.8 × 9.6 × 1.8 cm",
      rarity: 2,
      accent: "#4fd9a6",
      provenance: "Ex. Brussels Colonial Mineral Archive · Acquired 1975",
      grade: "Lapidary Exhibition Plate · Mirror Double-Polish",
      photoId: "malachite",
      story:
        "Sliced across twin coalesced stalactites from the oxidised copper zones of Kolwezi, this plate reveals hypnotic bull’s-eye banding from deepest pine to luminous mint. Each concentric ring marks a seasonal pulse of carbonate-rich groundwater percolating through copper ore — the very mineral that, ground to pigment, illuminated Renaissance altarpieces and imperial Russian palaces.",
      curatorNote:
        "Like dendrochronology in stone: every emerald contour is an archive of ancient rainfall written in secondary copper carbonate.",
    },
    {
      id: "fluorite",
      catalog: "LTH.55320",
      name: "Phantom Fluorite",
      epithet: "Stepped lilac-purple cubes crowning twin mountain quartzes",
      formula: "CaF₂",
      category: "Classic Species",
      mohs: 4,
      mohsLabel: "4",
      system: "Cubic",
      luster: "Vitreous, satin-stepped",
      locality: "Yaogangxian Mine, Hunan Province, China",
      acquired: "2011",
      size: "12.8 × 10.6 × 8.4 cm",
      rarity: 3,
      accent: "#d7bdf7",
      glow: "Royal violet-blue under 365 nm UV",
      provenance: "2006 Famous 'Floating City' Pocket · Hunan",
      grade: "Pedigreed Pocket Classic · 360° Complete Floater",
      photoId: "fluorite",
      story:
        "Celebrated among collectors as a miniature architectural citadel, this freestanding cluster of translucent lilac-grey fluorite cubes is rimmed along every stepped terrace with razor-thin royal-purple phantom zones, bridging two pristine quartz points dusted with sparkling chlorite. Recovered from a single small pocket in 2006, fewer than a handful of undamaged examples exist.",
      curatorNote:
        "Turn it in directional light and the internal purple phantoms ignite along every cubic corner — pure Bauhaus geometry grown in a tungsten vein.",
      highlight: {
        index: "04",
        title: "An architectural citadel of violet ghosts",
        body: "Stepped cubic terraces of translucent fluorite, edged with intense purple growth phantoms and poised across twin quartz peaks. Recovered from a legendary one-off pocket in Hunan, it marries crystallographic rigour with sculptural drama.",
      },
    },
    {
      id: "bismuth",
      catalog: "LTH.71008",
      name: "Bismuth Spiral",
      epithet: "Iridescent hopper ziggurat dressed in nanoscale light",
      formula: "Bi",
      category: "Metals & Ores",
      mohs: 2.25,
      mohsLabel: "2.25",
      system: "Trigonal",
      luster: "Metallic, thin-film iridescent",
      locality: "Crystallographic Atelier, Saxony, Germany",
      acquired: "2019",
      size: "11.5 × 8.8 × 7.4 cm · 1.42 kg",
      rarity: 1,
      accent: "#f5a0d6",
      provenance: "Grown in Saxony · Focus-Stacked Reference Example",
      grade: "Laboratory Masterpiece · Pure Elemental Hopper Habit",
      photoId: "bismuth",
      story:
        "Because bismuth atoms lock onto crystal edges far faster than across flat centres, cooling melt constructs intricate hollow staircases — inward-spiralling hopper ziggurats of startling geometric complexity. Upon meeting air, a transparent bismuth-oxide skin mere nanometres thick splits reflected waves into electric gold, magenta, and peacock cyan through thin-film interference.",
      curatorNote:
        "Catalogued transparently as a laboratory growth, it demonstrates that the laws of symmetry operate identically whether in a crustal vein or a crucible.",
    },
    {
      id: "azurite",
      catalog: "LTH.19287",
      name: "Azurite Rosettes",
      epithet: "Razor-sharp midnight blades touched with velvet malachite",
      formula: "Cu₃(CO₃)₂(OH)₂",
      category: "Classic Species",
      mohs: 3.75,
      mohsLabel: "3.5 – 4",
      system: "Monoclinic",
      luster: "Sub-adamantine, mirror-flashing",
      locality: "Tsumeb Mine, Oshikoto Region, Namibia",
      acquired: "1928",
      size: "9.2 × 6.4 × 4.8 cm",
      rarity: 4,
      accent: "#7fa9ef",
      provenance: "Ex. Charlie Key Collection · Upper Oxidised Zone, Tsumeb",
      grade: "Historic Pedigree · Razor-Sharp Parallel Blades",
      photoId: "azurite",
      story:
        "No single locality in history has yielded finer azurite than Tsumeb. Here, parallel-grown monoclinic blades of deepest Prussian-midnight blue terminate in chisel-sharp bevels, accented along one flank by a velvety emerald alteration of secondary copper malachite. Before synthetic ultramarine, pigments ground from such crystals painted the heavens of European Renaissance masters.",
      curatorNote:
        "Ex-Charlie Key provenance places this piece in the golden lineage of Tsumeb collecting — mirror-bright faces that flash electric cobalt as you move.",
    },
    {
      id: "willemite",
      catalog: "LTH.33019",
      name: "Willemite & Calcite",
      epithet: "Precambrian zinc marble that blazes under ultraviolet",
      formula: "Zn₂SiO₄ · CaCO₃ · ZnFe₂O₄",
      category: "Fluorescent",
      mohs: 5.5,
      mohsLabel: "5.5 (willemite)",
      system: "Trigonal",
      luster: "Vitreous to resinous",
      locality: "Franklin Mining District, New Jersey, USA",
      acquired: "1958",
      size: "19.5 × 16.0 × 11.0 cm",
      rarity: 4,
      accent: "#a3f58a",
      glow: "Electric green & crimson-orange under 254 nm UV",
      provenance: "Classic Mid-Century Miner’s Recovery · Franklin, NJ",
      grade: "High-Contrast UV Display Matrix · Rich Willemite Saturation",
      photoId: "willemite",
      story:
        "Metamorphosed more than a billion years ago during the Grenville Orogeny, the zinc orebodies of Franklin, New Jersey host the richest concentration of fluorescent species on Earth. Peppered with jet-black franklinite grains, this matrix erupts under shortwave UV as manganese-bearing willemite blazes neon green beside embers of crimson-orange manganiferous calcite.",
      curatorNote:
        "Every serious cabinet deserves one specimen with a secret life — austere sculpture by day, pure atomic theatre in the darkened salon.",
    },
  ],
  inquiries: [],
};
