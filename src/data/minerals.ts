import heroImg from "../assets/hero.jpg";
import { PHOTOS, type SpecimenPhoto } from "./photography";

export { heroImg };

export type Category =
  | "Gemstones"
  | "Metals & Ores"
  | "Meteorites"
  | "Fluorescent"
  | "Classic Species";

export interface Mineral {
  id: string;
  catalog: string;
  name: string;
  epithet: string;
  formula: string;
  category: Category;
  mohs: number; // representative value for sorting
  mohsLabel: string;
  system: string;
  luster: string;
  locality: string;
  acquired: string;
  size: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  accent: string;
  glow?: string;
  photo: SpecimenPhoto;
  story: string;
  curatorNote: string;
  highlight?: { index: string; title: string; body: string };
}

export const CATEGORIES: Category[] = [
  "Gemstones",
  "Metals & Ores",
  "Meteorites",
  "Fluorescent",
  "Classic Species",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Gemstones: "#8fe4df",
  "Metals & Ores": "#e6b45a",
  Meteorites: "#b9c9dc",
  Fluorescent: "#a3f58a",
  "Classic Species": "#d7bdf7",
};

export const MINERALS: Mineral[] = [
  {
    id: "amethyst",
    catalog: "LTH.47883",
    name: "Amethyst Cathedral",
    epithet: "The centrepiece of the Grand Hall",
    formula: "SiO₂",
    category: "Gemstones",
    mohs: 7,
    mohsLabel: "7",
    system: "Trigonal",
    luster: "Vitreous",
    locality: "Artigas, Uruguay",
    acquired: "1962",
    size: "212 × 94 × 80 cm · 1,340 kg",
    rarity: 3,
    accent: "#b48cf2",
    photo: PHOTOS.amethyst,
    story:
      "A basalt gas bubble, frozen mid-breath 130 million years ago, became a cathedral. Silica-rich waters seeped into the cavity over millennia, and trace iron — irradiated by the surrounding rock — stained each quartz point royal violet. Standing taller than a person, this geode greeted visitors at the mine's mouth before crossing an ocean to anchor our Grand Hall.",
    curatorNote:
      "Walk around it slowly. The deepest colour pools at the crystal tips, where the iron sat longest in the growing lattice.",
  },
  {
    id: "rhodochrosite",
    catalog: "LTH.50701",
    name: "Rhodochrosite",
    epithet: "The Rose of the San Juans",
    formula: "MnCO₃",
    category: "Classic Species",
    mohs: 3.75,
    mohsLabel: "3.5 – 4",
    system: "Trigonal",
    luster: "Vitreous to pearly",
    locality: "Sweet Home Mine, Colorado, USA",
    acquired: "1992",
    size: "18 × 14 × 9 cm",
    rarity: 5,
    accent: "#f27d9e",
    photo: PHOTOS.rhodochrosite,
    story:
      "The rich raspberry colour of this manganese carbonate dazzles through large, transparent, sharp 'dog-tooth' crystals up to four centimetres. Specimens of this calibre are now effectively unobtainable — the Sweet Home Mine's pockets are exhausted — making this one of the finest expressions of the species ever recovered. Its name comes from the Greek rhodon, 'rose', and chrosis, 'colouring'.",
    curatorNote:
      "Rhodochrosite this red and this transparent almost shouldn't exist. It is the specimen collectors whisper about.",
    highlight: {
      index: "01",
      title: "A rose that grew in stone",
      body: "Raspberry-red dog-tooth crystals, some four centimetres long, from a mine that will never yield their like again. When the Sweet Home pockets closed, pieces of this quality left the market forever — ours stayed under glass.",
    },
  },
  {
    id: "mundrabilla",
    catalog: "LTH.11215",
    name: "Mundrabilla Meteorite",
    epithet: "Older than the Earth beneath it",
    formula: "Fe–Ni (with troilite)",
    category: "Meteorites",
    mohs: 4.5,
    mohsLabel: "4 – 5",
    system: "Cubic / octahedrite",
    luster: "Metallic",
    locality: "Nullarbor Plain, Western Australia",
    acquired: "1966",
    size: "61 × 38 × 22 cm · 412 kg",
    rarity: 5,
    accent: "#b9c9dc",
    photo: PHOTOS.meteorite,
    story:
      "Part of the great Mundrabilla fall, whose fragments total some 24 tonnes scattered across the Nullarbor Plain. The first mass was found in 1911; ours was recovered in 1966. Cut and etched, its face reveals the Widmanstätten pattern — interlocking nickel-iron crystals that could only form while cooling a few degrees every million years in the core of a shattered asteroid, 4.6 billion years ago.",
    curatorNote:
      "You cannot manufacture this pattern. It is a cooling rate no human furnace can imitate — deep time, made visible.",
    highlight: {
      index: "02",
      title: "A visitor from the asteroid belt",
      body: "Forged in the metallic heart of a protoplanet and cooled a few degrees per million years, this 412-kilogram iron predates every rock on Earth. Touch the case and you are as close as anyone gets to the birth of the solar system.",
    },
  },
  {
    id: "gold",
    catalog: "LTH.39112",
    name: "Crystalline Gold",
    epithet: "Light, made metal",
    formula: "Au",
    category: "Metals & Ores",
    mohs: 2.75,
    mohsLabel: "2.5 – 3",
    system: "Cubic",
    luster: "Metallic",
    locality: "Eagle's Nest Mine, California, USA",
    acquired: "1987",
    size: "12 × 9 × 6 cm · 862 g",
    rarity: 4,
    accent: "#e6b45a",
    photo: PHOTOS.gold,
    story:
      "Most gold ever mined was melted before anyone saw its crystal form. This specimen escaped the furnace: bright, leaf-like crystals of native gold draped across milky quartz, grown atom by atom from hot hydrothermal fluids threading fractured rock. Gold's cubic lattice, twinned again and again, produces these feathered dendrites — nature's own goldsmithing.",
    curatorNote:
      "Under the loupe you can see growth steps a few atoms high. This is what money looked like before money existed.",
    highlight: {
      index: "03",
      title: "The gold that escaped the furnace",
      body: "Nearly all gold is melted the moment it is found. These crystalline leaves, feathered across snow-white quartz, survived — a reminder that the metal we spend was once simply the most beautiful thing in the rock.",
    },
  },
  {
    id: "aquamarine",
    catalog: "LTH.60660",
    name: "Aquamarine on Albite",
    epithet: "Seawater, crystallised",
    formula: "Be₃Al₂Si₆O₁₈",
    category: "Gemstones",
    mohs: 7.75,
    mohsLabel: "7.5 – 8",
    system: "Hexagonal",
    luster: "Vitreous",
    locality: "Shigar Valley, Gilgit-Baltistan, Pakistan",
    acquired: "2003",
    size: "22 × 16 × 11 cm",
    rarity: 3,
    accent: "#8fe4df",
    photo: PHOTOS.aquamarine,
    story:
      "A grove of prismatic, gem-clear beryl crystals rises from a snowfield of albite feldspar, each hexagon terminated with a glassy face. The sea-blue tint comes from iron sitting in the beryl channels. Carried out of the Karakoram at 4,000 metres, the cluster survived its descent without a single repaired termination — a small miracle of logistics.",
    curatorNote:
      "Gem beryl and the emerald in a ring are the same mineral. Only the trace metals — iron here, chromium there — change the colour of the story.",
  },
  {
    id: "malachite",
    catalog: "LTH.28451",
    name: "Malachite",
    epithet: "The forest in the stone",
    formula: "Cu₂CO₃(OH)₂",
    category: "Classic Species",
    mohs: 3.75,
    mohsLabel: "3.5 – 4",
    system: "Monoclinic",
    luster: "Silky to adamantine",
    locality: "Kolwezi, Katanga, DR Congo",
    acquired: "1975",
    size: "31 × 24 × 15 cm",
    rarity: 2,
    accent: "#4fd9a6",
    photo: PHOTOS.malachite,
    story:
      "Copper dissolved by groundwater, met by carbonate, precipitated one hair-thin needle at a time — millions of them, packed into botryoidal domes. Cut and polished, the domes reveal concentric rings like a felled tree: each band a season of chemistry, recording shifts in the water that built it. Ground into pigment, this same green coloured medieval manuscripts.",
    curatorNote:
      "Count the rings. You are reading a chemical diary written one micron per entry.",
  },
  {
    id: "fluorite",
    catalog: "LTH.55320",
    name: "Phantom Fluorite",
    epithet: "The architect of colour",
    formula: "CaF₂",
    category: "Classic Species",
    mohs: 4,
    mohsLabel: "4",
    system: "Cubic",
    luster: "Vitreous",
    locality: "Hunan Province, China",
    acquired: "2011",
    size: "19 × 15 × 12 cm",
    rarity: 3,
    accent: "#d7bdf7",
    glow: "Blue-violet under UV",
    photo: PHOTOS.fluorite,
    story:
      "Perfect cubes with violet hearts and teal rims — the colour changed mid-growth as the chemistry of the pocket shifted, leaving 'phantoms' of earlier growth stages suspended inside each crystal. Fluorite defined the very word fluorescence in 1852, and the hardness value 4 on the Mohs scale. Few minerals have taught science so much while being this beautiful.",
    curatorNote:
      "The teal edge is a younger crystal wrapped around an older violet one. These cubes grew like tree rings, in three dimensions.",
    highlight: {
      index: "04",
      title: "Cubes that grew around their own ghosts",
      body: "Violet cores, sea-green rims: each cube records a change in the ancient fluid that grew it. Fluorite gave science the word 'fluorescence' — and gave this gallery its favourite geometry lesson.",
    },
  },
  {
    id: "bismuth",
    catalog: "LTH.71008",
    name: "Bismuth Spiral",
    epithet: "The staircase to nowhere",
    formula: "Bi",
    category: "Metals & Ores",
    mohs: 2.25,
    mohsLabel: "2.25",
    system: "Trigonal",
    luster: "Metallic, iridescent",
    locality: "Laboratory growth, Saxony, Germany",
    acquired: "2019",
    size: "14 × 11 × 9 cm · 1.9 kg",
    rarity: 1,
    accent: "#f5a0d6",
    photo: PHOTOS.bismuth,
    story:
      "Bismuth grows faster along its edges than across its faces, so it builds hollow staircases — hopper crystals spiralling inward like miniature ziggurats. The rainbow is not pigment but physics: a transparent oxide film, nanometres thin, splitting light into magenta, gold and electric blue. Grown openly in our laboratory wing, it is the gallery's honest showpiece of crystal engineering.",
    curatorNote:
      "The colour is a film thinner than a wavelength of light. Tilt your head and the rainbow moves — the crystal itself is silver.",
  },
  {
    id: "azurite",
    catalog: "LTH.19287",
    name: "Azurite Rosettes",
    epithet: "Midnight, in blades",
    formula: "Cu₃(CO₃)₂(OH)₂",
    category: "Classic Species",
    mohs: 3.75,
    mohsLabel: "3.5 – 4",
    system: "Monoclinic",
    luster: "Vitreous",
    locality: "Tsumeb, Namibia",
    acquired: "1928",
    size: "16 × 12 × 8 cm",
    rarity: 4,
    accent: "#7fa9ef",
    photo: PHOTOS.azurite,
    story:
      "From Tsumeb — the single mine that produced more world-class mineral species than any other — comes this cluster of midnight-blue blades arranged in rosettes, edged with the green of its cousin malachite. Azurite was the blue of European painting before cobalt; ground from stones like this, it coloured skies in altarpieces for five centuries.",
    curatorNote:
      "Azurite slowly turns to malachite in humid air. This piece is stable, but it reminds us that even minerals are mortal.",
  },
  {
    id: "willemite",
    catalog: "LTH.33019",
    name: "Willemite & Calcite",
    epithet: "The stone that answers ultraviolet",
    formula: "Zn₂SiO₄ · CaCO₃",
    category: "Fluorescent",
    mohs: 5.5,
    mohsLabel: "5.5 (willemite)",
    system: "Trigonal",
    luster: "Vitreous",
    locality: "Franklin, New Jersey, USA",
    acquired: "1958",
    size: "24 × 18 × 12 cm",
    rarity: 4,
    accent: "#a3f58a",
    glow: "Neon green & orange-red under UV",
    photo: PHOTOS.willemite,
    story:
      "Under ordinary light, a modest grey rock from the zinc mines of Franklin. Under ultraviolet, it detonates: willemite blazes neon green, calcite burns orange-red. Manganese atoms, present in parts per thousand, absorb invisible UV and re-emit it as visible light. Franklin's miners called these 'the rocks that glow' — and the town still switches its lamps off for tourists every summer night.",
    curatorNote:
      "Stand in the Glow Room and let your eyes adapt for thirty seconds. The darkness is part of the specimen.",
  },
];

export const HIGHLIGHTS = MINERALS.filter((m) => m.highlight).sort(
  (a, b) => a.highlight!.index.localeCompare(b.highlight!.index)
);

export const byId = (id: string) => MINERALS.find((m) => m.id === id)!;