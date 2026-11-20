import amethyst from '../assets/specimens/amethyst.webp';
import amethystCard from '../assets/specimens/amethyst-card.webp';
import rhodochrosite from '../assets/specimens/rhodochrosite.webp';
import rhodochrositeCard from '../assets/specimens/rhodochrosite-card.webp';
import meteorite from '../assets/specimens/meteorite.webp';
import meteoriteCard from '../assets/specimens/meteorite-card.webp';
import gold from '../assets/specimens/gold.webp';
import goldCard from '../assets/specimens/gold-card.webp';
import aquamarine from '../assets/specimens/aquamarine.webp';
import aquamarineCard from '../assets/specimens/aquamarine-card.webp';
import malachite from '../assets/specimens/malachite.webp';
import malachiteCard from '../assets/specimens/malachite-card.webp';
import fluorite from '../assets/specimens/fluorite.webp';
import fluoriteCard from '../assets/specimens/fluorite-card.webp';
import bismuth from '../assets/specimens/bismuth.webp';
import bismuthCard from '../assets/specimens/bismuth-card.webp';
import azurite from '../assets/specimens/azurite.webp';
import azuriteCard from '../assets/specimens/azurite-card.webp';
import willemite from '../assets/specimens/willemite.webp';
import willemiteCard from '../assets/specimens/willemite-card.webp';
import sources from '../assets/specimens/sources.json';

export interface SpecimenPhoto {
  id: string;
  src: string;
  thumbnail: string;
  alt: string;
  subject: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  changes: string;
  width: number;
  height: number;
}

function photo(
  id: keyof typeof sources,
  src: string,
  thumbnail: string,
  subject: string,
  alt: string,
): SpecimenPhoto {
  const source = sources[id];
  return {
    ...source,
    id,
    src,
    thumbnail,
    subject,
    alt,
    licenseUrl: source.licenseUrl || 'https://commons.wikimedia.org/wiki/Commons:Public_domain',
    author: source.author === 'Robert M. Lavinsky'
      ? 'Rob Lavinsky, iRocks.com'
      : id === 'bismuth' ? 'Alchemist-hp & Richard Bartz' : source.author,
  };
}

export const PHOTOS = {
  amethyst: photo('amethyst', amethyst, amethystCard, 'Amethyst geode',
    'A complete open amethyst geode revealing rich violet quartz crystals surrounded by a pale chalcedony rim.'),
  rhodochrosite: photo('rhodochrosite', rhodochrosite, rhodochrositeCard, 'Rhodochrosite',
    'A complete cluster of natural cherry-pink rhodochrosite rhombs from the Sweet Home Mine, Colorado.'),
  meteorite: photo('meteorite', meteorite, meteoriteCard, 'Mundrabilla meteorite',
    'A complete polished slice of the Mundrabilla iron meteorite on display at the Smithsonian.'),
  gold: photo('gold', gold, goldCard, 'Native gold on quartz',
    'A delicate branching crystal of native gold on white quartz from the Eagle\'s Nest Mine, California.'),
  aquamarine: photo('aquamarine', aquamarine, aquamarineCard, 'Aquamarine on albite',
    'A naturally pale-blue, terminated aquamarine crystal standing on a white albite matrix.'),
  malachite: photo('malachite', malachite, malachiteCard, 'Banded malachite',
    'A polished double stalactite of malachite showing concentric forest-green bands, from Kolwezi, DR Congo.'),
  fluorite: photo('fluorite', fluorite, fluoriteCard, 'Phantom fluorite',
    'A stepped lilac fluorite crystal with purple phantom edges, perched on quartz from Hunan, China.'),
  bismuth: photo('bismuth', bismuth, bismuthCard, 'Laboratory-grown bismuth',
    'A complete laboratory-grown bismuth hopper crystal with naturally iridescent gold, rose and blue surfaces.'),
  azurite: photo('azurite', azurite, azuriteCard, 'Azurite crystals',
    'Lustrous deep-blue azurite crystals with green malachite overgrowths, from Tsumeb, Namibia.'),
  willemite: photo('willemite', willemite, willemiteCard, 'Willemite and calcite under UV',
    'An actual ultraviolet photograph of willemite fluorescing green with red calcite at the Sternberg Museum.'),
} satisfies Record<string, SpecimenPhoto>;