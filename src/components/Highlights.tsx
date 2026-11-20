import { ArrowRight, MapPin } from "lucide-react";
import { type MineralItem } from "../data/defaults";
import { useCms } from "../data/store";
import { catLabel, ui } from "../data/i18n";
import { cn } from "../utils/cn";
import { RarityGems, Reveal, SectionHeading } from "./ui";
import SpecimenImage from "./SpecimenImage";

function HighlightRow({
  mineral,
  flip,
  onOpen,
}: {
  mineral: MineralItem;
  flip: boolean;
  onOpen: (id: string) => void;
}) {
  const { getPhoto, getCategoryColor, lang } = useCms();
  const h = mineral.highlight!;
  const accent = mineral.accent;
  const photo = getPhoto(mineral.photoId);
  const catColor = getCategoryColor(mineral.category);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={cn(flip && "lg:order-2")} y={40}>
        <button
          onClick={() => onOpen(mineral.id)}
          className="shine spotlight-card group relative block w-full overflow-hidden rounded-3xl border border-edge text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
          }}
          style={{ boxShadow: `0 30px 80px -30px ${accent}44` }}
          aria-label={`${ui(lang, "openSpecimenFile")} — ${mineral.name}`}
        >
          <SpecimenImage photo={photo} accent={accent} variant="feature" />
          <div className="flex items-center justify-between gap-4 border-t border-edge/40 bg-abyss px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-dusk">
                {mineral.catalog}
              </span>
              <RarityGems value={mineral.rarity} accent={accent} />
            </div>
            <span className="flex items-center gap-2 text-xs font-semibold text-mist">
              {ui(lang, "viewSpecimen")}
              <ArrowRight className="h-3.5 w-3.5 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </span>
          </div>
        </button>
      </Reveal>

      <div className={cn(flip && "lg:order-1")}>
        <Reveal>
          <div className="flex items-baseline gap-5">
            <span
              className="font-display text-6xl font-light italic sm:text-7xl"
              style={{ color: `${accent}55` }}
            >
              {h.index}
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-dusk uppercase">
              {mineral.epithet}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h3 className="mt-4 font-display text-3xl leading-tight font-light text-ivory sm:text-4xl">
            {mineral.name} — <em style={{ color: accent }}>{h.title}</em>
          </h3>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 leading-relaxed text-mist">{h.body}</p>
        </Reveal>
        <Reveal delay={0.22}>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full border border-edge bg-surface px-3.5 py-1.5 text-xs font-semibold text-mist">
              <MapPin className="h-3 w-3" style={{ color: accent }} />
              {mineral.locality}
            </span>
            <span className="rounded-full border border-edge bg-surface px-3.5 py-1.5 font-mono text-xs text-mist">
              {mineral.formula}
            </span>
            <span
              className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{ borderColor: `${catColor}44`, color: catColor }}
            >
              {catLabel(mineral.category, lang)}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.28}>
          <button
            onClick={() => onOpen(mineral.id)}
            className="group mt-8 inline-flex items-center gap-2 text-sm font-bold tracking-wide transition-colors"
            style={{ color: accent }}
          >
            {ui(lang, "openSpecimenFile")}
            <ArrowRight className="flip-rtl h-4 w-4 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
          </button>
        </Reveal>
      </div>
    </div>
  );
}

export default function Highlights({ onOpen }: { onOpen: (id: string) => void }) {
  const { config } = useCms();
  const s = config.highlights;
  const items = config.minerals
    .filter((m) => m.highlight)
    .sort((a, b) => a.highlight!.index.localeCompare(b.highlight!.index));

  if (items.length === 0) return null;

  return (
    <section id="highlights" className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32">
      <div
        className="pointer-events-none absolute top-1/4 -left-40 h-[30rem] w-[30rem] rounded-full bg-gold/8 blur-[140px]"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          overline={s.overline}
          chapter={s.chapter}
          title={
            <>
              {s.titlePrefix}
              <em className="bg-gradient-to-r from-orchid to-rhodo bg-clip-text text-transparent">
                {s.titleHighlight}
              </em>
            </>
          }
          sub={s.subtitle}
          accent={s.accent}
        />
        <div className="mt-20 space-y-24 lg:space-y-32">
          {items.map((m, i) => (
            <HighlightRow key={m.id} mineral={m} flip={i % 2 === 1} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}
