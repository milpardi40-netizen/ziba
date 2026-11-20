import { MessageCircle, ArrowUpRight } from "lucide-react";
import { useCms } from "../data/store";
import { Reveal, GemMark } from "./ui";

export default function Intro() {
  const { config } = useCms();
  const s = config.intro;

  return (
    <section id="exhibition" className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32">
      <div
        className="pointer-events-none absolute top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-malachite/8 blur-[130px]"
        aria-hidden
      />
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[5fr_6fr] lg:gap-20">
        {/* sticky quote */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.32em] text-malachite uppercase">
              <GemMark className="h-3 w-3" />
              <span className="rounded-full border border-edge bg-surface/95 px-2.5 py-1 text-[9px] text-ivory">
                {s.chapter}
              </span>
              {s.overline}
              <span className="h-px w-16 bg-gradient-to-r from-malachite to-transparent" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <blockquote className="mt-6 font-display text-4xl leading-[1.12] font-light text-ivory sm:text-5xl">
              {s.quotePrefix}
              <em className="bg-gradient-to-r from-malachite to-aqua bg-clip-text text-transparent">
                {s.quoteHighlight}
              </em>
              {s.quoteSuffix}
            </blockquote>
          </Reveal>
          <Reveal delay={0.2}>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/25 to-rhodo/20 font-display text-lg text-goldbright">
                {s.curatorInitials}
              </span>
              <span>
                <span className="block text-sm font-bold text-ivory">{s.curatorName}</span>
                <span className="block font-mono text-[11px] tracking-wider text-dusk uppercase">
                  {s.curatorRole}
                </span>
              </span>
            </figcaption>
          </Reveal>
        </div>

        {/* copy + tiles */}
        <div>
          <Reveal>
            <p className="text-lg leading-relaxed text-mist">{s.paragraph1}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 leading-relaxed text-mist">{s.paragraph2}</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {s.tiles.map((t, i) => (
              <Reveal key={`${t.label}-${i}`} delay={0.08 * i}>
                <div
                  className="shine group rounded-2xl border border-edge bg-surface/95 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-opacity-100"
                  style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` }}
                >
                  <div className="font-display text-3xl font-light sm:text-4xl" style={{ color: t.accent }}>
                    {t.value}
                  </div>
                  <div className="mt-2 text-xs font-semibold tracking-wide text-dusk uppercase">
                    {t.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* direct consultation banner */}
      <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div
            className="shine spotlight-card relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-r from-raised via-surface to-raised p-8 sm:p-10"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
          >
            <div
              className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-gold/12 blur-[90px]"
              aria-hidden
            />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
                  <MessageCircle className="h-6 w-6" />
                </span>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
                    {s.pubOverline}
                  </div>
                  <h3 className="mt-1.5 font-display text-2xl font-light text-ivory sm:text-3xl">
                    {s.pubTitlePrefix}
                    <em className="text-goldbright">{s.pubTitleHighlight}</em>
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
                    {s.pubDescription}
                  </p>
                </div>
              </div>
              <button
                onClick={() => document.getElementById("visit")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex shrink-0 items-center gap-2 rounded-full border border-gold/60 px-6 py-3.5 text-sm font-bold text-goldbright transition-all hover:bg-gold hover:text-[#1a1206]"
              >
                {s.pubButtonText}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
