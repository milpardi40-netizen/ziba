import { ChevronLeft, ChevronRight, Hourglass } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useCms } from "../data/store";
import { Reveal, SectionHeading } from "./ui";
import SpecimenImage from "./SpecimenImage";

export default function DeepTime() {
  const { config, getPhoto, lang } = useCms();
  const s = config.deeptime;
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [s.eras.length]);

  const nudge = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-era]");
    const w = card ? card.offsetWidth + 24 : 380;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  return (
    <section id="deeptime" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 rule-gem opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-[24rem] w-[36rem] rounded-full bg-gold/7 blur-[140px]"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            overline={s.overline}
            chapter={s.chapter}
            title={
              <>
                {s.titlePrefix}
                <em className="bg-gradient-to-r from-goldbright to-rhodo bg-clip-text text-transparent">
                  {s.titleHighlight}
                </em>
              </>
            }
            sub={s.subtitle}
            accent={s.accent}
          />
          <Reveal delay={0.15}>
            <div className="flex items-center gap-3">
              <span className="mr-2 hidden items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-dusk uppercase sm:flex">
                <Hourglass className="h-3.5 w-3.5 text-gold" /> {s.dragHint}
              </span>
              <button
                onClick={() => nudge(-1)}
                disabled={!canPrev}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-surface text-ivory transition-all enabled:hover:border-gold enabled:hover:text-goldbright disabled:opacity-30"
                aria-label={lang === "ar" ? "الحقب الأقدم" : "Earlier eras"}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => nudge(1)}
                disabled={!canNext}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-surface text-ivory transition-all enabled:hover:border-gold enabled:hover:text-goldbright disabled:opacity-30"
                aria-label={lang === "ar" ? "الحقب الأحدث" : "Later eras"}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.1} y={40}>
        <div className="relative mt-14">
          <div className="pointer-events-none absolute inset-x-0 top-[26px] z-10 mx-auto h-px max-w-7xl" aria-hidden>
            <div className="h-full w-full bg-gradient-to-r from-transparent via-edge to-transparent" />
            <div
              className="h-full bg-gradient-to-r from-amethyst via-gold to-malachite shadow-[0_0_14px_rgba(230,180,90,0.75)] transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div
            ref={trackRef}
            onScroll={update}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pt-0 pb-6 sm:px-8 lg:px-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))]"
          >
            {s.eras.map((era, i) => (
              <article
                key={era.id}
                data-era
                className="group relative flex w-[85vw] max-w-[400px] shrink-0 snap-start flex-col"
              >
                <div className="relative z-20 mb-6 flex shrink-0 items-center gap-4">
                  <span
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 bg-ink font-mono text-xs font-bold transition-transform duration-300 group-hover:scale-110"
                    style={{ borderColor: era.accent, color: era.accent, boxShadow: `0 0 24px ${era.accent}44` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-edge to-transparent" />
                </div>

                <div
                  className="shine flex flex-1 flex-col overflow-hidden rounded-3xl border border-edge bg-surface transition-all duration-300 group-hover:-translate-y-1.5"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                >
                  {era.photoId && (
                    <SpecimenImage
                      photo={getPhoto(era.photoId)}
                      accent={era.accent}
                      variant="compact"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-5xl font-light" style={{ color: era.accent }}>
                        {era.age}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.18em] text-dusk uppercase">
                        {era.unit}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-light text-ivory">{era.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{era.body}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {era.minerals.map((m) => (
                        <span
                          key={m}
                          className="rounded-full border px-3 py-1 font-mono text-[10px] tracking-wider"
                          style={{ borderColor: `${era.accent}44`, color: era.accent }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-2 h-1 max-w-xs overflow-hidden rounded-full bg-edge/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amethyst via-rhodo to-gold transition-[width] duration-200"
              style={{ width: `${8 + progress * 92}%` }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
