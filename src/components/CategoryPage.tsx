import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Gem,
  Heart,
  Home,
  MapPin,
  Quote,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { slugifyCategory } from "../data/categoryPages";
import { categoryMetaFor } from "../data/arabic";
import { catLabel, ui } from "../data/i18n";
import { useCms } from "../data/store";
import { categoryHref, HOME_HREF, navigateHome } from "../router";
import { cn } from "../utils/cn";
import { SpecimenCard } from "./Collection";
import SpecimenImage from "./SpecimenImage";
import { RarityGems, Reveal } from "./ui";

type SortKey = "name" | "hard-asc" | "hard-desc" | "rarity";

const SORTS: { key: SortKey; labelKey: "sortName" | "sortRarity" | "sortHardest" | "sortSoftest" }[] = [
  { key: "name", labelKey: "sortName" },
  { key: "rarity", labelKey: "sortRarity" },
  { key: "hard-desc", labelKey: "sortHardest" },
  { key: "hard-asc", labelKey: "sortSoftest" },
];

export function RouteNotFound({ path }: { path: string }) {
  const { lang } = useCms();
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 pt-36 pb-24 text-center">
      <span className="font-mono text-[11px] tracking-[0.32em] text-rhodo uppercase">
        {ui(lang, "notFoundBadge")}
      </span>
      <h1 className="mt-5 font-display text-5xl leading-tight font-light text-ivory sm:text-6xl">
        {ui(lang, "notFoundTitle")}
      </h1>
      <p className="mt-5 max-w-md leading-relaxed text-mist">
        {ui(lang, "notFoundText")}{" "}
        <span className="font-mono text-sm text-ivory">{path || "…"}</span>
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <a
          href={HOME_HREF}
          className="flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a1206] transition-colors hover:bg-goldbright"
        >
          <Home className="h-4 w-4" /> {ui(lang, "notFoundCta")}
        </a>
        <a
          href={categoryHref("Gemstones")}
          className="flex items-center gap-2 rounded-full border border-edge bg-surface px-6 py-3 text-sm font-bold text-ivory transition-colors hover:border-gold/60 hover:text-goldbright"
        >
          <Gem className="h-4 w-4 text-gold" /> {ui(lang, "browseCabinets")}
        </a>
      </div>
    </section>
  );
}

export default function CategoryPage({
  slug,
  saved,
  onToggleSave,
  onOpen,
}: {
  slug: string;
  saved: Set<string>;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { config, getPhoto, lang } = useCms();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rarity");
  const [savedOnly, setSavedOnly] = useState(false);

  const category = config.categories.find((c) => slugifyCategory(c.name) === slug);

  const items = useMemo(
    () => (category ? config.minerals.filter((m) => m.category === category.name) : []),
    [config.minerals, category]
  );

  const featured = useMemo(
    () =>
      [...items].sort(
        (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name)
      )[0] ?? null,
    [items]
  );

  const stats = useMemo(() => {
    const localities = [...new Set(items.map((m) => m.locality))];
    const systems = [...new Set(items.map((m) => m.system))];
    const years = items
      .map((m) => parseInt(m.acquired, 10))
      .filter((y) => Number.isFinite(y));
    const mohs = items.map((m) => m.mohs);
    return {
      count: items.length,
      localities,
      systems,
      rarest: items.reduce((mx, m) => Math.max(mx, m.rarity), 0),
      yearRange:
        years.length > 0
          ? `${Math.min(...years)} – ${Math.max(...years)}`
          : "—",
      mohsRange:
        mohs.length > 0
          ? `${Math.min(...mohs)} – ${Math.max(...mohs)}`
          : "—",
      glowCount: items.filter((m) => m.glow).length,
    };
  }, [items]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((m) => {
      if (savedOnly && !saved.has(m.id)) return false;
      if (!q) return true;
      return [m.name, m.epithet, m.formula, m.locality, m.system, m.catalog, m.story]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    return [...list].sort((a, b) => {
      switch (sort) {
        case "hard-asc":
          return a.mohs - b.mohs;
        case "hard-desc":
          return b.mohs - a.mohs;
        case "rarity":
          return b.rarity - a.rarity || a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [items, query, sort, savedOnly, saved]);

  if (!category) return <RouteNotFound path={`#/category/${slug}`} />;

  const meta = categoryMetaFor(category.name, lang);
  const color = category.color;
  const others = config.categories.filter((c) => c.id !== category.id);
  const idx = config.categories.findIndex((c) => c.id === category.id);
  const prev = others.length
    ? config.categories[(idx - 1 + config.categories.length) % config.categories.length]
    : null;
  const next = others.length
    ? config.categories[(idx + 1) % config.categories.length]
    : null;

  const statCells = [
    { label: ui(lang, "specimensInCabinet"), value: String(stats.count) },
    { label: ui(lang, "localitiesRepresented"), value: String(stats.localities.length) },
    { label: ui(lang, "acquiredLabel"), value: stats.yearRange },
    { label: ui(lang, "mohsRangeLabel"), value: stats.mohsRange },
  ];

  return (
    <div className="relative overflow-x-clip">
      {/* ambient cabinet glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[34rem] w-[64rem] max-w-none -translate-x-1/2 rounded-full opacity-[0.13] blur-[150px]"
        style={{ background: color }}
        aria-hidden
      />

      {/* ---------- Cabinet hero ---------- */}
      <section className="relative mx-auto max-w-7xl px-5 pt-32 sm:px-8 sm:pt-40">
        <Reveal>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-dusk">
            <a href={HOME_HREF} className="flex items-center gap-1.5 transition-colors hover:text-goldbright">
              <Home className="h-3.5 w-3.5" /> {ui(lang, "exhibitionWord")}
            </a>
            <ChevronRight className="flip-rtl h-3.5 w-3.5 opacity-60" />
            <button onClick={() => navigateHome("categories")} className="transition-colors hover:text-goldbright">
              {ui(lang, "cabinetsWord")}
            </button>
            <ChevronRight className="flip-rtl h-3.5 w-3.5 opacity-60" />
            <span aria-current="page" style={{ color }}>{catLabel(category.name, lang)}</span>
          </nav>
        </Reveal>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <div>
            <Reveal>
              <div
                className="flex items-center gap-3 font-mono text-[11px] tracking-[0.32em] uppercase"
                style={{ color }}
              >
                <Gem className="h-3.5 w-3.5" />
                {ui(lang, "cabinetWord")} {String(idx + 1).padStart(2, "0")} · {stats.count}{" "}
                {ui(lang, "specimensWord")}
                {stats.glowCount > 0 && (
                  <span className="flex items-center gap-1.5 text-malachite normal-case">
                    <Sparkles className="h-3.5 w-3.5" /> {stats.glowCount} {ui(lang, "uvReactive")}
                  </span>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 font-display text-5xl leading-[1.02] font-light text-ivory sm:text-6xl lg:text-7xl">
                {catLabel(category.name, lang)}
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-4 font-display text-2xl font-light italic" style={{ color }}>
                {meta.tagline}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
                {meta.intro}
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#cabinet-specimens"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("cabinet-specimens")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#14100a] transition-transform hover:scale-[1.02]"
                  style={{ background: color }}
                >
                  {ui(lang, "browseSpecimens")} <ArrowRight className="flip-rtl h-4 w-4" />
                </a>
                <button
                  onClick={() => navigateHome("visit")}
                  className="flex items-center gap-2 rounded-full border border-edge bg-surface/90 px-6 py-3 text-sm font-bold text-ivory transition-colors hover:border-gold/60 hover:text-goldbright"
                >
                  {ui(lang, "requestViewing")}
                </button>
              </div>
            </Reveal>
          </div>

          {featured && (
            <Reveal delay={0.15} y={40}>
              <button
                onClick={() => onOpen(featured.id)}
                className="shine spotlight-card group relative block w-full overflow-hidden rounded-3xl border text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                style={{
                  borderColor: `${color}44`,
                  boxShadow: `0 36px 90px -32px ${color}55`,
                  ["--acc" as string]: featured.accent,
                }}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                aria-label={`${ui(lang, "heroFeatured")}: ${featured.name} — ${ui(lang, "openSpecimenFile")}`}
              >
                <span
                  className="absolute top-4 left-4 z-10 rounded-full px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-[#14100a] uppercase"
                  style={{ background: color }}
                >
                  {ui(lang, "cabinetMasterwork")}
                </span>
                <SpecimenImage photo={getPhoto(featured.photoId)} accent={featured.accent} variant="feature" priority />
                <div className="border-t border-edge/40 bg-abyss px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl leading-tight font-light text-ivory group-hover:text-goldbright">
                        {featured.name}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-mist">
                        <MapPin className="h-3 w-3" style={{ color }} />
                        {featured.locality}
                      </div>
                    </div>
                    <RarityGems value={featured.rarity} accent={featured.accent} />
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-dusk uppercase">
                    <span>{featured.catalog}</span>
                    <span className="flex items-center gap-1.5 font-sans text-xs font-bold normal-case" style={{ color }}>
                      {ui(lang, "openSpecimenFile")} <ArrowUpRight className="flip-rtl h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            </Reveal>
          )}
        </div>

        {/* stats strip */}
        <Reveal delay={0.1}>
          <dl className="mt-14 grid grid-cols-2 overflow-hidden rounded-3xl border border-edge bg-surface/80 backdrop-blur lg:grid-cols-4">
            {statCells.map((s, i) => (
              <div
                key={s.label}
                className={cn("px-6 py-5", i !== 0 && "border-l border-edge/50", i >= 2 && "max-lg:border-t max-lg:border-edge/50", i === 2 && "max-lg:border-l-0")}
              >
                <dt className="font-mono text-[9px] tracking-[0.22em] text-dusk uppercase">{s.label}</dt>
                <dd className="mt-2 font-display text-3xl font-light text-ivory">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ---------- Cabinet essay ---------- */}
      <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="font-display text-3xl leading-tight font-light text-ivory sm:text-4xl">
                {ui(lang, "curatedPrefix")}<em style={{ color }}>{ui(lang, "curatedEm")}</em>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-5 leading-relaxed text-mist">{meta.curation}</p>
            </Reveal>
            <Reveal delay={0.14}>
              <figure className="mt-8 rounded-3xl border border-edge bg-surface/80 p-6 sm:p-7">
                <Quote className="h-5 w-5" style={{ color }} />
                <blockquote className="mt-3 font-display text-xl leading-relaxed font-light text-ivory italic">
                  {meta.curatorNote}
                </blockquote>
                <figcaption className="mt-3 font-mono text-[10px] tracking-[0.22em] text-dusk uppercase">
                  {ui(lang, "deskCabinet", { name: catLabel(category.name, lang) })}
                </figcaption>
              </figure>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {meta.traits.map((t, i) => (
                <Reveal key={t.title} delay={i * 0.08}>
                  <article className="h-full rounded-3xl border border-edge bg-surface/80 p-5">
                    <span className="font-display text-4xl font-light italic" style={{ color: `${color}66` }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-[15px] font-bold text-ivory">{t.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-mist">{t.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.1}>
            <aside className="rounded-3xl border border-edge bg-abyss/80 p-6 sm:p-7 lg:sticky lg:top-24">
              <h3 className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color }}>
                {ui(lang, "deskLooksFor")}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {meta.lookingFor.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-mist">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `${color}22`, color }}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 border-t border-edge/60 pt-6">
                <h4 className="font-mono text-[10px] tracking-[0.28em] text-dusk uppercase">{ui(lang, "localitiesInCabinet")}</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stats.localities.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setQuery(l.split(",")[0]);
                        document.getElementById("cabinet-specimens")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-full border border-edge bg-surface px-3 py-1.5 text-[11px] font-semibold text-mist transition-colors hover:text-ivory"
                      style={{ ["--tw-border-opacity" as string]: 1 }}
                      title={ui(lang, "filterBy", { name: l })}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-edge/60 pt-6">
                <h4 className="font-mono text-[10px] tracking-[0.28em] text-dusk uppercase">{ui(lang, "crystalSystemsPresent")}</h4>
                <p className="mt-3 text-sm text-mist">{stats.systems.join(" · ") || "—"}</p>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* ---------- Specimens ---------- */}
      <section id="cabinet-specimens" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl leading-tight font-light text-ivory sm:text-4xl">
              {ui(lang, "insideCabinet", { name: catLabel(category.name, lang) })}
            </h2>
            <span className="font-mono text-[11px] tracking-[0.2em] text-dusk uppercase" aria-live="polite">
              {ui(lang, "shownOf", { shown: results.length, total: items.length })}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-edge bg-surface/90 p-4 backdrop-blur sm:p-5 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-dusk" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui(lang, "searchInsideCabinet", { name: catLabel(category.name, lang) })}
                className="w-full rounded-full border border-edge bg-abyss/90 py-3.5 pr-11 pl-11 text-sm text-ivory placeholder:text-dusk focus:ring-2 focus:outline-none"
                style={{ ["--tw-ring-color" as string]: `${color}55` }}
                aria-label={ui(lang, "searchWithin", { name: catLabel(category.name, lang) })}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-dusk hover:text-ivory"
                  aria-label={ui(lang, "clearSearch")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative flex items-center gap-2 rounded-full border border-edge bg-abyss/90 py-3 pr-4 pl-10 text-sm text-mist">
                <SlidersHorizontal className="pointer-events-none absolute left-4 h-4 w-4 text-dusk" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="cursor-pointer bg-transparent focus:outline-none [&>option]:bg-surface"
                  aria-label={ui(lang, "sortSpecimensAria")}
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>{ui(lang, s.labelKey)}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => setSavedOnly((v) => !v)}
                aria-pressed={savedOnly}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-colors",
                  savedOnly
                    ? "border-rhodo/60 bg-rhodo/15 text-rhodo"
                    : "border-edge bg-abyss/90 text-mist hover:text-ivory"
                )}
              >
                <Heart className={cn("h-4 w-4", savedOnly && "fill-current")} />
                {ui(lang, "savedOnly")}
              </button>
            </div>
          </div>
        </Reveal>

        {results.length > 0 ? (
          <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {results.map((m) => (
                <SpecimenCard
                  key={m.id}
                  mineral={m}
                  saved={saved.has(m.id)}
                  onToggleSave={onToggleSave}
                  onOpen={onOpen}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-edge bg-surface/85 px-6 py-20 text-center">
            <Search className="h-8 w-8 text-dusk" />
            <h3 className="mt-4 font-display text-2xl font-light text-ivory">{ui(lang, "nothingMatches")}</h3>
            <p className="mt-2 max-w-sm text-sm text-mist">
              {savedOnly && saved.size === 0
                ? ui(lang, "savedEmptyCabinet")
                : ui(lang, "tryBroaderCabinet")}
            </p>
            <button
              onClick={() => { setQuery(""); setSavedOnly(false); }}
              className="mt-6 rounded-full px-6 py-3 text-sm font-bold text-[#14100a]"
              style={{ background: color }}
            >
              {ui(lang, "showWholeCabinet")}
            </button>
          </div>
        )}
      </section>

      {/* ---------- Other cabinets + prev/next ---------- */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="border-t border-edge/60 pt-14">
          <Reveal>
            <h2 className="font-display text-3xl font-light text-ivory">
              {ui(lang, "continuePrefix")}<em className="text-goldbright">{ui(lang, "continueEm")}</em>
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((c) => {
              const count = config.minerals.filter((m) => m.category === c.name).length;
              return (
                <a
                  key={c.id}
                  href={categoryHref(c.name)}
                  className="group rounded-3xl border border-edge bg-surface/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40"
                >
                  <span
                    className="inline-block rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] uppercase"
                    style={{ borderColor: `${c.color}44`, color: c.color }}
                  >
                    {count} {ui(lang, "specimensWord")}
                  </span>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="font-display text-xl leading-tight font-light text-ivory group-hover:text-goldbright">
                      {catLabel(c.name, lang)}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-dusk transition-all group-hover:text-goldbright" />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-dusk italic">
                    {categoryMetaFor(c.name, lang).tagline}
                  </p>
                </a>
              );
            })}
          </div>

          {(prev || next) && (
            <nav aria-label="Cabinet pagination" className="mt-10 grid gap-4 sm:grid-cols-2">
              {prev && (
                <a
                  href={categoryHref(prev.name)}
                  className="group flex items-center gap-4 rounded-3xl border border-edge bg-abyss/70 p-5 transition-colors hover:border-gold/40"
                >
                  <ArrowLeft className="flip-rtl h-5 w-5 shrink-0 text-dusk transition-transform group-hover:-translate-x-1 group-hover:text-goldbright rtl:group-hover:translate-x-1" />
                  <span>
                    <span className="block font-mono text-[9px] tracking-[0.24em] text-dusk uppercase">{ui(lang, "previousCabinet")}</span>
                    <span className="mt-1 block font-display text-xl font-light text-ivory">{catLabel(prev.name, lang)}</span>
                  </span>
                </a>
              )}
              {next && (
                <a
                  href={categoryHref(next.name)}
                  className="group flex items-center justify-end gap-4 rounded-3xl border border-edge bg-abyss/70 p-5 text-end transition-colors hover:border-gold/40 sm:col-start-2"
                >
                  <span>
                    <span className="block font-mono text-[9px] tracking-[0.24em] text-dusk uppercase">{ui(lang, "nextCabinet")}</span>
                    <span className="mt-1 block font-display text-xl font-light text-ivory">{catLabel(next.name, lang)}</span>
                  </span>
                  <ArrowRight className="flip-rtl h-5 w-5 shrink-0 text-dusk transition-transform group-hover:translate-x-1 group-hover:text-goldbright rtl:group-hover:-translate-x-1" />
                </a>
              )}
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
