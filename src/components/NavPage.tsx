import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Home,
  Phone,
  Quote,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { NAV_PAGE_ORDER } from "../data/navPages";
import { navPageFor, PAGE_STAT_AR } from "../data/arabic";
import { ui, type Lang } from "../data/i18n";
import { contactContentFor, navContentFor, navMeta } from "../data/navigation";
import { pageHref, type NavPageId } from "../router";
import { useCms } from "../data/store";
import { Reveal } from "./ui";

const Highlights = lazy(() => import("./Highlights"));
const Categories = lazy(() => import("./Categories"));
const Collection = lazy(() => import("./Collection"));
const GlowRoom = lazy(() => import("./GlowRoom"));
const DeepTime = lazy(() => import("./DeepTime"));
const Stories = lazy(() => import("./Stories"));
const Visit = lazy(() => import("./Visit"));

function pageStats(
  page: NavPageId,
  config: ReturnType<typeof useCms>["config"],
  savedCount: number,
  lang: Lang
): { label: string; value: string }[] {
  const L = (t: string) => (lang === "ar" ? PAGE_STAT_AR[t] ?? t : t);
  const all = config.minerals;
  const localities = new Set(all.map((m) => m.locality)).size;
  const raw = pageStatsRaw(page, config, savedCount, all, localities);
  return raw.map((r) => ({ label: L(r.label), value: L(r.value) }));
}

function pageStatsRaw(
  page: NavPageId,
  config: ReturnType<typeof useCms>["config"],
  savedCount: number,
  all: ReturnType<typeof useCms>["config"]["minerals"],
  localities: number
): { label: string; value: string }[] {
  switch (page) {
    case "highlights": {
      const items = all.filter((m) => m.highlight);
      return [
        { label: "Masterworks on the wall", value: String(items.length) },
        {
          label: "Localities represented",
          value: String(new Set(items.map((m) => m.locality)).size),
        },
        {
          label: "Highest rarity grade",
          value: `${Math.max(0, ...items.map((m) => m.rarity))} / 5`,
        },
        {
          label: "Earliest pedigree",
          value: items.length
            ? String(Math.min(...items.map((m) => parseInt(m.acquired, 10) || 9999)))
            : "—",
        },
      ];
    }
    case "categories":
      return [
        { label: "Cabinets", value: String(config.categories.length) },
        { label: "Specimens filed", value: String(all.length) },
        { label: "Localities worldwide", value: String(localities) },
        {
          label: "Dedicated pages",
          value: String(config.categories.length),
        },
      ];
    case "collection":
      return [
        { label: "Catalogued specimens", value: String(all.length) },
        { label: "Cabinets represented", value: String(config.categories.length) },
        { label: "Localities worldwide", value: String(localities) },
        { label: "On your shortlist", value: String(savedCount) },
      ];
    case "glow": {
      const glow = all.filter((m) => m.glow);
      return [
        { label: "UV-reactive specimens", value: String(glow.length) },
        { label: "Wavelengths on the bench", value: "254 · 365 nm" },
        {
          label: "Emission species profiled",
          value: String(config.glow.emissions.length),
        },
        { label: "Share of minerals that glow", value: "< 15%" },
      ];
    }
    case "deeptime":
      return [
        { label: "Geological acts", value: String(config.deeptime.eras.length) },
        { label: "Years on the timeline", value: "4.56 billion" },
        {
          label: "Mineral groups named",
          value: String(
            new Set(config.deeptime.eras.flatMap((e) => e.minerals)).size
          ),
        },
        { label: "Oldest archive object", value: "4.56 Ga iron" },
      ];
    case "stories": {
      const arts = config.stories.articles;
      return [
        { label: "Dispatches published", value: String(arts.length) },
        {
          label: "Minutes of reading",
          value: String(arts.reduce((s, a) => s + a.minutes, 0)),
        },
        {
          label: "Contributors",
          value: String(new Set(arts.map((a) => a.author)).size),
        },
        { label: "New species ratified yearly", value: "≈ 50" },
      ];
    }
    case "visit":
      return [
        {
          label: "Steps in the protocol",
          value: String(config.visit.protocolSteps.length),
        },
        { label: "Salon days each week", value: "Tue – Sun" },
        { label: "Response promise", value: "Same day" },
        { label: "Delivery", value: "Worldwide" },
      ];
  }
}

export default function NavPage({
  page,
  saved,
  onToggleSave,
  onOpen,
  onStartTour,
}: {
  page: NavPageId;
  saved: Set<string>;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
  onStartTour: () => void;
}) {
  const { config, lang } = useCms();
  const meta = navPageFor(page, lang);
  const nav = page === "visit" ? null : navContentFor(config, page);
  const label = page === "visit" ? contactContentFor(config).label : nav!.label;
  const stats = pageStats(page, config, saved.size, lang);
  const others = NAV_PAGE_ORDER.filter((p) => p !== page);

  const scrollToContent = () =>
    document.getElementById("page-content")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative overflow-x-clip">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[32rem] w-[60rem] max-w-none -translate-x-1/2 rounded-full opacity-[0.12] blur-[150px]"
        style={{ background: meta.accent }}
        aria-hidden
      />

      {/* ---------- Exclusive page hero ---------- */}
      <section className="relative mx-auto max-w-7xl px-5 pt-32 sm:px-8 sm:pt-40">
        <Reveal>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-dusk"
          >
            <a href="#/" className="flex items-center gap-1.5 transition-colors hover:text-goldbright">
              <Home className="h-3.5 w-3.5" /> {ui(lang, "exhibitionWord")}
            </a>
            <ChevronRight className="flip-rtl h-3.5 w-3.5 opacity-60" />
            <span aria-current="page" style={{ color: meta.accent }}>
              {label}
            </span>
          </nav>
        </Reveal>

        <div className="mt-10 max-w-4xl">
          <Reveal>
            <div
              className="flex items-center gap-3 font-mono text-[11px] tracking-[0.32em] uppercase"
              style={{ color: meta.accent }}
            >
              <span className="h-px w-10" style={{ background: meta.accent }} aria-hidden />
              {meta.overline}
              {nav && (
                <span className="font-mono text-[10px] tracking-[0.18em] text-dusk normal-case">
                  · {navMeta(page, config)}
                </span>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] font-light text-ivory sm:text-6xl lg:text-7xl">
              {meta.title}{" "}
              <em style={{ color: meta.accent }}>{meta.titleAccent}</em>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-4 font-display text-2xl font-light text-mist italic">
              {meta.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-mist sm:text-lg">
              {meta.intro}
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <p className="mt-4 max-w-3xl leading-relaxed text-mist/90">{meta.essay}</p>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={scrollToContent}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#14100a] transition-transform hover:scale-[1.02]"
                style={{ background: meta.accent }}
              >
                {meta.cta} <ArrowRight className="flip-rtl h-4 w-4" />
              </button>
              {page !== "visit" ? (
                <a
                  href={pageHref("visit")}
                  className="flex items-center gap-2 rounded-full border border-edge bg-surface/90 px-6 py-3 text-sm font-bold text-ivory transition-colors hover:border-gold/60 hover:text-goldbright"
                >
                  <Phone className="h-4 w-4 text-gold" /> {ui(lang, "speakCurator")}
                </a>
              ) : (
                <a
                  href={pageHref("collection")}
                  className="flex items-center gap-2 rounded-full border border-edge bg-surface/90 px-6 py-3 text-sm font-bold text-ivory transition-colors hover:border-gold/60 hover:text-goldbright"
                >
                  {ui(lang, "browseVaultFirst")} <ArrowUpRight className="flip-rtl h-4 w-4 text-gold" />
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <dl className="mt-14 grid grid-cols-2 overflow-hidden rounded-3xl border border-edge bg-surface/80 backdrop-blur lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={
                  "px-6 py-5 " +
                  (i !== 0 ? "border-l border-edge/50 " : "") +
                  (i >= 2 ? "max-lg:border-t max-lg:border-edge/50 " : "") +
                  (i === 2 ? "max-lg:border-l-0" : "")
                }
              >
                <dt className="font-mono text-[9px] tracking-[0.22em] text-dusk uppercase">
                  {s.label}
                </dt>
                <dd className="mt-2 font-display text-3xl font-light text-ivory">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ---------- The live section itself ---------- */}
      <div id="page-content" className="scroll-mt-16">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center font-mono text-[11px] tracking-[0.3em] text-dusk uppercase">
              {ui(lang, "preparingRoom")}
            </div>
          }
        >
          {page === "highlights" && <Highlights onOpen={onOpen} />}
          {page === "categories" && <Categories />}
          {page === "collection" && (
            <Collection saved={saved} onToggleSave={onToggleSave} onOpen={onOpen} />
          )}
          {page === "glow" && <GlowRoom />}
          {page === "deeptime" && <DeepTime />}
          {page === "stories" && <Stories />}
          {page === "visit" && <Visit onStartTour={onStartTour} />}
        </Suspense>
      </div>

      {/* ---------- Exclusive editorial: three columns + curator ---------- */}
      <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="border-t border-edge/60 pt-14">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl leading-tight font-light text-ivory sm:text-4xl">
              {ui(lang, "deskOn", { label: lang === "ar" ? label : label.toLowerCase() })}
            </h2>
          </Reveal>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {meta.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <article className="h-full rounded-3xl border border-edge bg-surface/80 p-6">
                  <span
                    className="font-display text-4xl font-light italic"
                    style={{ color: `${meta.accent}66` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[15px] font-bold text-ivory">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-mist">{f.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <figure className="h-full rounded-3xl border border-edge bg-surface/80 p-7 sm:p-8">
                <Quote className="h-5 w-5" style={{ color: meta.accent }} />
                <blockquote className="mt-4 font-display text-[22px] leading-relaxed font-light text-ivory italic">
                  {meta.quote.text}
                </blockquote>
                <figcaption className="mt-4 font-mono text-[10px] tracking-[0.22em] text-dusk uppercase">
                  {meta.quote.author} · {meta.quote.role}
                </figcaption>
              </figure>
            </Reveal>
            <div className="space-y-4">
              {meta.faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.07}>
                  <article className="rounded-3xl border border-edge bg-abyss/80 p-6">
                    <h3 className="text-[15px] font-bold text-ivory">{f.q}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist">{f.a}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Continue the visit ---------- */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="border-t border-edge/60 pt-14">
          <Reveal>
            <h2 className="font-display text-3xl font-light text-ivory">
              {ui(lang, "continueVisitPrefix")}<em className="text-goldbright">{ui(lang, "continueVisitEm")}</em>
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => {
              const m = navPageFor(p, lang);
              const n = p === "visit" ? null : navContentFor(config, p);
              return (
                <a
                  key={p}
                  href={pageHref(p)}
                  className="group rounded-3xl border border-edge bg-surface/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40"
                >
                  <span
                    className="font-mono text-[9px] tracking-[0.22em] uppercase"
                    style={{ color: m.accent }}
                  >
                    {m.overline}
                  </span>
                  <span className="mt-2.5 flex items-center justify-between gap-3">
                    <span className="font-display text-xl leading-tight font-light text-ivory group-hover:text-goldbright">
                      {p === "visit" ? contactContentFor(config).label : n!.label}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-dusk transition-colors group-hover:text-goldbright" />
                  </span>
                  <span className="mt-1.5 block line-clamp-2 text-[12px] leading-relaxed text-dusk italic">
                    {m.tagline}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
