import { ArrowRight, ArrowUpRight, Gem, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useCms } from "../data/store";
import { categoryHref } from "../router";
import { categoryMetaFor } from "../data/arabic";
import { catLabel, ui } from "../data/i18n";
import { RarityGems, Reveal, SectionHeading } from "./ui";
import SpecimenImage from "./SpecimenImage";

/**
 * "The Cabinets" — home-page showcase of every category.
 * Each card is a doorway into that category's dedicated SPA page
 * (#/category/<slug>), with live stats computed from the archive.
 */
export default function Categories() {
  const { config, getPhoto, lang } = useCms();

  const cabinets = config.categories
    .map((cat) => {
      const items = config.minerals.filter((m) => m.category === cat.name);
      const featured =
        [...items].sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name))[0] ??
        null;
      const localities = new Set(items.map((m) => m.locality)).size;
      return { cat, items, featured, localities, meta: categoryMetaFor(cat.name, lang) };
    })
    .filter((c) => c.items.length > 0);

  if (cabinets.length === 0) return null;

  /** Admin titles may contain `{count}` — filled with the live cabinet count. */
  const fillCount = (text: string) =>
    text
      .replace(/\{count\}/g, String(cabinets.length))
      .replace("{cabinets}", `${cabinets.length} cabinet${cabinets.length === 1 ? "" : "s"}`)
      .replace("{worlds}", `${cabinets.length} world${cabinets.length === 1 ? "" : "s"}`);

  return (
    <section id="categories" className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 rule-gem opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute top-24 left-1/2 h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-amethyst/8 blur-[140px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          overline={config.categoriesSection.overline}
          chapter={config.categoriesSection.chapter}
          title={
            <>
              {fillCount(config.categoriesSection.titlePrefix)}{" "}
              <em className="bg-gradient-to-r from-amethyst to-rhodo bg-clip-text text-transparent">
                {fillCount(config.categoriesSection.titleHighlight)}
              </em>
            </>
          }
          sub={config.categoriesSection.subtitle}
          accent={config.categoriesSection.accent}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cabinets.map(({ cat, items, featured, localities, meta }, i) => (
            <Reveal key={cat.id} delay={Math.min(i * 0.07, 0.35)} className="h-full">
              <motion.a
                href={categoryHref(cat.name)}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="spotlight-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-edge bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                style={{ ["--acc" as string]: cat.color }}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                aria-label={ui(lang, "cabinetOwnPage", { name: catLabel(cat.name, lang) })}
              >
                {featured && (
                  <div className="relative">
                    <SpecimenImage
                      photo={getPhoto(featured.photoId)}
                      accent={featured.accent}
                      variant="editorial"
                    />
                    <span
                      className="absolute top-4 left-4 rounded-full border px-3 py-1 font-mono text-[9px] tracking-[0.2em] uppercase backdrop-blur"
                      style={{
                        borderColor: `${cat.color}55`,
                        color: cat.color,
                        background: "rgba(11,23,26,0.72)",
                      }}
                    >
                      {catLabel(cat.name, lang)}
                    </span>
                    <span className="absolute right-4 bottom-4 flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-abyss/80 text-mist backdrop-blur transition-all duration-300 group-hover:border-gold/70 group-hover:text-goldbright">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] tracking-[0.24em] text-dusk uppercase">
                      {ui(lang, "cabinetWord")} {String(i + 1).padStart(2, "0")}
                    </span>
                    {featured && <RarityGems value={featured.rarity} accent={featured.accent} />}
                  </div>
                  <h3 className="mt-3 font-display text-[28px] leading-tight font-light text-ivory transition-colors group-hover:text-goldbright">
                    {catLabel(cat.name, lang)}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-mist italic">
                    {meta.tagline}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-mist">
                    <span className="flex items-center gap-1.5 rounded-full border border-edge bg-abyss/70 px-3 py-1.5">
                      <Gem className="h-3 w-3" style={{ color: cat.color }} />
                      {items.length} {ui(lang, "specimensWord")}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-edge bg-abyss/70 px-3 py-1.5">
                      <MapPin className="h-3 w-3" style={{ color: cat.color }} />
                      {localities} {ui(lang, "localitiesWord")}
                    </span>
                  </div>

                  <span
                    className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold tracking-wide"
                    style={{ color: cat.color }}
                  >
                    {ui(lang, "enterCabinet")}
                    <ArrowRight className="flip-rtl h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
                  </span>
                </div>
                <span
                  className="h-[3px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }}
                  aria-hidden
                />
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
