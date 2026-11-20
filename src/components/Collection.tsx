import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, MapPin, MessageCircle, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { type MineralItem } from "../data/defaults";
import { categoryMetaFor } from "../data/arabic";
import { catLabel, ui } from "../data/i18n";
import { categoryHref } from "../router";
import { useCms } from "../data/store";
import { cn } from "../utils/cn";
import { MohsBar, RarityGems, Reveal, SectionHeading } from "./ui";
import SpecimenImage from "./SpecimenImage";

type SortKey = "name" | "hard-asc" | "hard-desc" | "rarity";

export function SpecimenCard({
  mineral,
  saved,
  onToggleSave,
  onOpen,
}: {
  mineral: MineralItem;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { config, getPhoto, getCategoryColor, lang } = useCms();
  const accent = mineral.accent;
  const catColor = getCategoryColor(mineral.category);
  const photo = getPhoto(mineral.photoId);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="spotlight-card group relative flex flex-col overflow-hidden rounded-3xl border border-edge bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1.5"
      style={{ ["--acc" as string]: accent }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px -24px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.05)`;
        (e.currentTarget as HTMLElement).style.borderColor = `${accent}55`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "";
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      <div className="flex items-center justify-between bg-plate/35 px-4 py-1">
        <span className="font-mono text-[9px] tracking-[0.18em] text-dusk">
          {mineral.catalog}
        </span>
        <button
          onClick={() => onToggleSave(mineral.id)}
          aria-label={saved ? `${ui(lang, "savedWord")} — ${mineral.name}` : `${ui(lang, "saveSpecimen")} — ${mineral.name}`}
          aria-pressed={saved}
          className={cn(
            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 after:absolute after:-inset-0.5 active:scale-90",
            saved ? "bg-rhodo/15 text-rhodo" : "text-dusk hover:bg-rhodo/10 hover:text-rhodo"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5 transition-transform", saved && "scale-110 fill-current")} />
        </button>
      </div>

      <button
        onClick={() => onOpen(mineral.id)}
        className="relative block w-full border-b border-edge/35 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
        aria-label={`${ui(lang, "openSpecimenFile")} — ${mineral.name}`}
      >
        <SpecimenImage photo={photo} accent={accent} />
      </button>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] uppercase"
            style={{ borderColor: `${catColor}44`, color: catColor }}
          >
            {catLabel(mineral.category, lang)}
          </span>
          <RarityGems value={mineral.rarity} accent={accent} />
        </div>
        <button onClick={() => onOpen(mineral.id)} className="mt-3 text-start">
          <h3 className="font-display text-2xl leading-tight font-light text-ivory transition-colors group-hover:text-goldbright">
            {mineral.name}
          </h3>
        </button>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-dusk">{mineral.formula}</p>
          {mineral.glow && <Sparkles className="h-3.5 w-3.5 text-malachite" aria-label={ui(lang, "uvReactive")} />}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-edge/60 pt-4">
          <div>
            <div className="mb-1.5 font-mono text-[9px] tracking-[0.2em] text-dusk uppercase">
              {ui(lang, "mohsWord")} {mineral.mohsLabel}
            </div>
            <MohsBar value={mineral.mohs} accent={accent} />
          </div>
          <span className="flex max-w-[45%] items-start gap-1 text-end text-[11px] leading-snug text-mist">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" style={{ color: accent }} />
            {mineral.locality.split(",")[0]}
          </span>
        </div>

        <button
          onClick={() => onOpen(mineral.id)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-edge/80 bg-abyss/60 py-2 text-[11px] font-bold tracking-wide text-mist transition-colors hover:border-gold/60 hover:text-goldbright"
        >
          <MessageCircle className="h-3.5 w-3.5 text-gold" />
          {config.collection.cardButtonText}
        </button>
      </div>
    </motion.article>
  );
}

export default function Collection({
  saved,
  onToggleSave,
  onOpen,
}: {
  saved: Set<string>;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { config, getCategoryColor, lang } = useCms();
  const s = config.collection;
  const SORTS: { key: SortKey; label: string }[] = [
    { key: "name", label: s.sortLabelName },
    { key: "rarity", label: s.sortLabelRarity },
    { key: "hard-desc", label: s.sortLabelHardest },
    { key: "hard-asc", label: s.sortLabelSoftest },
  ];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [savedOnly, setSavedOnly] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = config.minerals.filter((m) => {
      if (category !== "All" && m.category !== category) return false;
      if (savedOnly && !saved.has(m.id)) return false;
      if (
        q &&
        ![
          m.name,
          m.epithet,
          m.formula,
          m.locality,
          m.category,
          m.system,
          m.catalog,
          m.provenance ?? "",
          m.grade ?? "",
          m.story,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "hard-asc":
          return a.mohs - b.mohs;
        case "hard-desc":
          return b.mohs - a.mohs;
        case "rarity":
          return b.rarity - a.rarity;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [config.minerals, query, category, sort, savedOnly, saved]);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setSort("name");
    setSavedOnly(false);
  };

  const activeFilters = query || category !== "All" || savedOnly;

  return (
    <section id="collection" className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 rule-gem opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute top-20 right-0 h-[26rem] w-[26rem] rounded-full bg-azurite/9 blur-[130px]"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          overline={s.overline}
          chapter={s.chapter}
          title={
            <>
              {s.titlePrefix}
              <em className="bg-gradient-to-r from-aqua to-azurite bg-clip-text text-transparent">
                {s.titleHighlight}
              </em>
            </>
          }
          sub={s.subtitle}
          accent={s.accent}
        />

        {/* toolbar */}
        <Reveal delay={0.1}>
          <div className="mt-12 rounded-3xl border border-edge bg-surface/90 p-4 backdrop-blur sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {s.showSearch && (
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-dusk" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={s.searchPlaceholder}
                    className="w-full rounded-full border border-edge bg-abyss/90 py-3.5 pr-11 pl-11 text-sm text-ivory placeholder:text-dusk focus:border-amethyst focus:ring-2 focus:ring-amethyst/30 focus:outline-none"
                    aria-label={ui(lang, "browseSpecimens")}
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
              )}

              <div className="flex flex-wrap items-center gap-3">
                {s.showSort && (
                  <label className="relative flex items-center gap-2 rounded-full border border-edge bg-abyss/90 py-3 pr-4 pl-10 text-sm text-mist">
                    <SlidersHorizontal className="pointer-events-none absolute left-4 h-4 w-4 text-dusk" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="cursor-pointer appearance-none bg-transparent pr-2 font-semibold text-mist focus:outline-none [&>option]:bg-surface"
                      aria-label={ui(lang, "sortSpecimensAria")}
                    >
                      {SORTS.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {s.showSavedFilter && (
                  <button
                    onClick={() => setSavedOnly((v) => !v)}
                    aria-pressed={savedOnly}
                    className={cn(
                      "flex items-center gap-2 rounded-full border py-3 px-5 text-sm font-bold transition-all",
                      savedOnly
                        ? "border-rhodo/70 bg-rhodo/20 text-rhodo shadow-[0_0_20px_rgba(255,92,138,0.25)]"
                        : "border-edge bg-abyss/90 text-mist hover:border-rhodo/50 hover:text-rhodo"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", savedOnly && "fill-current")} />
                    {s.savedLabel}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[10px]",
                        savedOnly ? "bg-rhodo/25" : "bg-edge/60"
                      )}
                    >
                      {saved.size}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {s.showCategoryChips && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {[{ id: "all", name: "All", color: "#e6b45a" }, ...config.categories].map((c) => {
                const isActive = category === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.name)}
                    aria-pressed={isActive}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300",
                      isActive ? "text-ink" : "text-mist hover:text-ivory"
                    )}
                    style={
                      isActive
                        ? { background: c.color, borderColor: c.color, boxShadow: `0 0 22px ${c.color}55` }
                        : { borderColor: "#3d656c", background: "rgba(14,29,33,0.6)" }
                    }
                  >
                    {c.name === "All" ? ui(lang, "allWord") : catLabel(c.name, lang)}
                  </button>
                );
              })}
            </div>
            )}

            {category !== "All" && (
              <a
                href={categoryHref(category)}
                className="group mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edge/70 bg-abyss/70 px-5 py-4 transition-colors hover:border-gold/50"
              >
                <span className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: getCategoryColor(category),
                      boxShadow: `0 0 12px ${getCategoryColor(category)}`,
                    }}
                    aria-hidden
                  />
                  <span>
                    <span className="block text-sm font-bold text-ivory">
                      {ui(lang, "cabinetOwnPage", { name: catLabel(category, lang) })}
                    </span>
                    <span className="block text-xs text-dusk italic">
                      {categoryMetaFor(category, lang).tagline}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-2 text-xs font-bold text-goldbright">
                  {ui(lang, "enterCabinet")}
                  <ArrowRight className="flip-rtl h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </a>
            )}
          </div>
        </Reveal>

        {/* result count */}
        <div className="mt-8 flex items-center justify-between">
          <p className="font-mono text-[11px] tracking-[0.22em] text-dusk uppercase" aria-live="polite">
            {s.resultCountText
              .replace(/\{shown\}/g, String(results.length))
              .replace(/\{total\}/g, String(config.minerals.length))}
          </p>
          {activeFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs font-bold text-gold hover:text-goldbright"
            >
              <X className="h-3.5 w-3.5" /> {s.resetFiltersText}
            </button>
          )}
        </div>

        {/* grid */}
        <motion.div layout className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

        {results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-edge bg-surface/85 px-6 py-20 text-center"
          >
            <Search className="h-8 w-8 text-dusk" />
            <h3 className="mt-4 font-display text-2xl font-light text-ivory">
              {s.emptyTitle}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-mist">
              {savedOnly && saved.size === 0 ? s.emptySavedText : s.emptyText}
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a1206] transition-colors hover:bg-goldbright"
            >
              {s.emptyButtonText}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
