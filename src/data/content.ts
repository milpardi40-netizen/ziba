import { PHOTOS, type SpecimenPhoto } from "./photography";

export interface Era {
  age: string;
  unit: string;
  title: string;
  body: string;
  minerals: string[];
  accent: string;
  photo?: SpecimenPhoto;
}

export const ERAS: Era[] = [
  {
    age: "4.6",
    unit: "billion years ago",
    title: "Stardust settles",
    body: "Before there was an Earth, there was a disc of gas and dust around a young Sun. Its first solids — the metal and silicate grains inside meteorites — condensed at temperatures above 1,400 °C. Every meteorite in this gallery is a surviving fragment of that moment.",
    minerals: ["Iron–nickel", "Olivine", "Troilite"],
    accent: "#b9c9dc",
    photo: PHOTOS.meteorite,
  },
  {
    age: "4.4",
    unit: "billion years ago",
    title: "The first survivors",
    body: "In the Jack Hills of Western Australia, sand grains of zircon outlived the rocks that bore them. Sealed inside each crystal, uranium ticks away like a clock — making zircon the oldest known terrestrial material, and our only eyewitness to the Hadean Earth.",
    minerals: ["Zircon"],
    accent: "#e6b45a",
  },
  {
    age: "2.4",
    unit: "billion years ago",
    title: "The great rusting",
    body: "When microbes began exhaling oxygen, the planet rusted. New oxidised chemistry let hundreds of never-before-seen species form — including the vivid copper carbonates malachite and azurite. Life didn't just live on Earth; it rewrote its mineralogy.",
    minerals: ["Malachite", "Azurite", "Hematite"],
    accent: "#4fd9a6",
    photo: PHOTOS.malachite,
  },
  {
    age: "540",
    unit: "million years ago",
    title: "Life learns to build",
    body: "In the Cambrian explosion, animals discovered they could grow their own minerals. Shells, spines and skeletons of calcite and aragonite turned biology into geology — today, more than a third of mineral species owe their existence, directly or not, to life.",
    minerals: ["Calcite", "Aragonite", "Apatite"],
    accent: "#8fe4df",
  },
  {
    age: "250",
    unit: "million years ago",
    title: "Veins of the deep",
    body: "Mountain-building drove hot, metal-rich fluids through fractured crust. As they cooled, they lined the cracks with treasure: quartz, fluorite, and leaf gold. Nearly every spectacular crystal cluster in the vault grew in such hydrothermal veins, kilometres below ground.",
    minerals: ["Gold", "Fluorite", "Quartz"],
    accent: "#b48cf2",
    photo: PHOTOS.gold,
  },
  {
    age: "Today",
    unit: "and counting",
    title: "6,000 species — and ~50 new each year",
    body: "Mineralogy is not a finished science. Every year, researchers describe dozens of species new to knowledge, and laboratories grow structures nature never attempted. The iridescent bismuth in our final case was grown this decade — the newest 'mineral' in the vault.",
    minerals: ["Bismuth", "Rare earths"],
    accent: "#f5a0d6",
    photo: PHOTOS.bismuth,
  },
];

export interface Article {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  minutes: number;
  author: string;
  role: string;
  photo: SpecimenPhoto;
  paragraphs: string[];
  pullQuote: string;
}

export const ARTICLES: Article[] = [
  {
    id: "what-is-a-mineral",
    tag: "Science",
    tagColor: "#8fe4df",
    title: "What exactly is a mineral?",
    excerpt:
      "Five strict rules decide what earns the name — and why ice is a mineral while the glass in your window is not.",
    minutes: 6,
    author: "Dr. Elena Marsh",
    role: "Curator of Mineralogy",
    photo: PHOTOS.aquamarine,
    paragraphs: [
      "A mineral is not simply a shiny stone. To earn the name, a substance must satisfy five conditions at once: it must be naturally occurring, formed by geological processes, solid at room temperature, possess a definite chemical composition, and — the decisive one — its atoms must be arranged in an ordered, repeating crystal lattice.",
      "That last rule excludes some surprising things. Window glass is solid and mostly silicon dioxide, but its atoms froze in disorder, so it is a 'mineraloid'. Liquid mercury slips past the solidity rule. And a laboratory-grown diamond, atomically identical to a mined one, fails only the 'naturally occurring' clause — which is why our bismuth spiral is labelled, honestly, a laboratory growth.",
      "The rules matter because the lattice is where a mineral's identity lives. Diamond and graphite are both pure carbon; one is the hardest natural substance known, the soft enough of the two to write with. The only difference is geometry — tetrahedra in diamond, stacked sheets in graphite. Chemistry proposes, structure disposes.",
      "Around 6,000 species have passed the test so far, from familiar quartz to rarities known from a single microscopic grain. Each is a distinct combination of composition and architecture — a distinct way for matter to be itself. That is what you are looking at in these cases: not decorations, but solutions.",
    ],
    pullQuote: "Chemistry proposes, structure disposes.",
  },
  {
    id: "how-crystals-grow",
    tag: "Crystallography",
    tagColor: "#d7bdf7",
    title: "How crystals grow",
    excerpt:
      "From a single seed of order to a metre-long prism — the patient physics behind every face in the vault.",
    minutes: 8,
    author: "Prof. Dayo Adeyemi",
    role: "Head of Crystal Growth Lab",
    photo: PHOTOS.fluorite,
    paragraphs: [
      "Every crystal begins with an accident of order: a handful of atoms that happen to lock into the pattern the rest will follow. This seed forms when a fluid becomes supersaturated — holding more dissolved material than it can keep — whether because it cooled, evaporated, or met a chemical it could not tolerate.",
      "After nucleation comes the long patience of growth. Atoms attach to the seed where the lattice offers the best fit, layer upon layer, and the flat faces you see on a fluorite cube are the planes where attachment was slowest and most orderly. Fast growth makes needles and dendrites — the feathered gold leaves in Gallery 3 grew so quickly they never had time to fill their faces in.",
      "Crystals also record their biography as they grow. When the fluid's chemistry shifts, the change is sealed inside: iron gives amethyst its violet tips, a pulse of trace elements paints the phantom cubes inside our fluorite, and each concentric band in malachite is a season of groundwater chemistry, logged in copper.",
      "Given space and time, crystals reach sizes that feel impossible. In the cave of crystals at Naica, Mexico, gypsum beams grew to twelve metres over perhaps half a million years, bathed in water held at a steady 54 °C. The lesson of the vault is that nature's greatest works are not carved — they are waited for.",
    ],
    pullQuote: "Nature's greatest works are not carved — they are waited for.",
  },
  {
    id: "meteorites",
    tag: "Cosmic",
    tagColor: "#b9c9dc",
    title: "Meteorites: postcards from the beginning",
    excerpt:
      "How a slice of iron from the Nullarbor Plain became the oldest thing you will ever stand beside.",
    minutes: 5,
    author: "Dr. Elena Marsh",
    role: "Curator of Mineralogy",
    photo: PHOTOS.meteorite,
    paragraphs: [
      "Hold a number in your head: 4.567 billion years. That is the age, measured by radioactive decay, of the first solids in the solar system — and the age of most meteorites. The Earth has melted, eroded and rebuilt its surface ever since; meteorites simply waited, cold, in the asteroid belt.",
      "Iron meteorites like our Mundrabilla slice come from the metallic cores of small protoplanets — worlds that formed, differentiated into core and mantle, and were then smashed apart in collisions before they could grow into planets. When you look at that etched, geometric Widmanstätten pattern, you are looking into the core of a world that no longer exists.",
      "The pattern itself is a thermometer with a four-billion-year memory. Two nickel-iron alloys interleave as the metal cools through roughly 700 to 450 °C — at a few degrees per million years, insulated deep inside the parent body. No laboratory can cool metal that slowly, which is why fakes are always detectable under acid.",
      "Some 24 tonnes of Mundrabilla fragments have been recovered from the Nullarbor Plain since 1911, scattered along an 80-kilometre strewn field. The limestone beneath them is young, soft, forgettable. The iron resting on it is the oldest object in the landscape — older, in fact, than the planet it landed on.",
    ],
    pullQuote:
      "You are looking into the core of a world that no longer exists.",
  },
];

export const STATS = [
  { value: 80000, suffix: "+", label: "Specimens in the collection" },
  { value: 4.6, suffix: "B", label: "Years of deep time on display", decimals: 1 },
  { value: 120, suffix: "", label: "Countries of origin" },
];