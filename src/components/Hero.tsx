import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useCms } from "../data/store";
import { CountUp, EASE, GemMark } from "./ui";
import SpecimenImage from "./SpecimenImage";
import backdrop1 from "../assets/backdrops/backdrop-1.jpg";

const SLIDE_INTERVAL = 5200;
const SLIDE_COUNT = 5;

/* Cinematic background slider — 4 atmospheric gallery plates.
   Only the first backdrop is eagerly imported; the rest are loaded lazily
   via dynamic import so they don't block the initial page load. */
const BACKDROP_SRCS = [
  backdrop1,
  () => import("../assets/backdrops/backdrop-2.jpg").then((m) => m.default),
  () => import("../assets/backdrops/backdrop-3.jpg").then((m) => m.default),
  () => import("../assets/backdrops/backdrop-4.jpg").then((m) => m.default),
];
const BACKDROP_INTERVAL = 7000;

const cnDot = (active: boolean) =>
  [
    "relative h-1.5 overflow-hidden rounded-full transition-all duration-500",
    active ? "w-9 bg-ivory/20" : "w-1.5 bg-ivory/35 hover:bg-ivory/70",
  ].join(" ");

export default function Hero({
  onExplore,
  onStartTour,
  onOpen,
}: {
  onExplore: () => void;
  onStartTour: () => void;
  onOpen: (id: string) => void;
}) {
  const { config, getPhoto } = useCms();
  const h = config.hero;

  // Slider: featured specimen first, then a handful of samples from the vault
  const slides = useMemo(() => {
    const first =
      config.minerals.find((m) => m.id === h.featuredSpecimenId) ?? config.minerals[0];
    if (!first) return [];
    const rest = config.minerals.filter((m) => m.id !== first.id);
    return [first, ...rest].slice(0, SLIDE_COUNT);
  }, [config.minerals, h.featuredSpecimenId]);

  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (slides.length === 0) return;
      setDirection(dir);
      setSlide(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );
  const nextSlide = useCallback(() => goTo(slide + 1, 1), [goTo, slide]);
  const prevSlide = useCallback(() => goTo(slide - 1, -1), [goTo, slide]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setInterval(() => goTo(slide + 1, 1), SLIDE_INTERVAL);
    return () => window.clearInterval(id);
  }, [paused, slide, slides.length, goTo]);

  useEffect(() => {
    if (slide >= slides.length) setSlide(0);
  }, [slides.length, slide]);

  const featured = slides[slide] ?? slides[0];
  const featuredPhoto = getPhoto(featured?.photoId);

  // Background plate rotation (independent of the specimen card)
  // resolvedBackdrops caches lazily loaded image URLs
  const [backdrop, setBackdrop] = useState(0);
  const [resolvedBackdrops, setResolvedBackdrops] = useState<string[]>([backdrop1]);

  useEffect(() => {
    // Preload the remaining backdrops after first paint
    BACKDROP_SRCS.slice(1).forEach((load, i) => {
      (load as () => Promise<string>)().then((src) => {
        setResolvedBackdrops((prev) => {
          const next = [...prev];
          next[i + 1] = src;
          return next;
        });
      });
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => setBackdrop((b) => (b + 1) % BACKDROP_SRCS.length),
      BACKDROP_INTERVAL
    );
    return () => window.clearInterval(id);
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // bgY حذف شد — parallax روی backdrop سنگین‌ترین عامل janky scroll بود
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // Spotlight: با RAF throttle تا از storm رندر جلوگیری شه
  const spotRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const onSceneMove = (e: MouseEvent<HTMLElement>) => {
    if (rafIdRef.current !== null) return;
    const x = e.clientX;
    const y = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    rafIdRef.current = requestAnimationFrame(() => {
      spotRef.current?.style.setProperty("--sx", `${x - rect.left}px`);
      spotRef.current?.style.setProperty("--sy", `${y - rect.top}px`);
      rafIdRef.current = null;
    });
  };

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // stiffness پایین‌تر = انیمیشن سبک‌تر روی GPU
  const rotateY = useSpring(mx, { stiffness: 80, damping: 20 });
  const rotateX = useSpring(my, { stiffness: 80, damping: 20 });

  const onCardMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 7);
    my.set(((e.clientY - r.top) / r.height - 0.5) * -5);
  };
  const onCardLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const ticker = config.minerals.map((m) => m.name.toUpperCase());

  return (
    <section
      ref={ref}
      onMouseMove={onSceneMove}
      className="relative flex min-h-svh flex-col overflow-x-clip"
      aria-label={`${config.brand.name} exhibition introduction`}
    >
      {/* atmospheric layers — cinematic background slider
          bgY parallax حذف شد تا scroll از compositor thread خارج نشه */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        data-backdrop={backdrop}
      >
        <AnimatePresence initial={false}>
          {resolvedBackdrops[backdrop] && (
            <motion.img
              key={backdrop}
              src={resolvedBackdrops[backdrop]}
              alt=""
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 2.0, ease: [0.4, 0, 0.2, 1] },
                scale: { duration: BACKDROP_INTERVAL / 1000 + 2, ease: "linear" },
              }}
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ filter: "saturate(1.08) contrast(1.04)", willChange: "transform, opacity" }}
            />
          )}
        </AnimatePresence>
        {/* Directional scrim: protects the copy on the left, lets the plate breathe on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/78 via-ink/38 to-ink/8" />
        {/* Soft vertical fade so the section melts into the page below */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink" />
        {/* Gentle vignette for a lens-like, premium finish */}
        <div className="absolute inset-0 [background:radial-gradient(120%_85%_at_50%_40%,transparent_55%,rgba(14,29,33,0.55)_100%)]" />
      </div>
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      {/* Static ambient glows — blur کاهش یافت تا GPU کمتر درگیر شه */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-[90px]" />
        <div className="absolute top-1/4 -right-24 h-[28rem] w-[28rem] rounded-full bg-aqua/8 blur-[80px]" />
      </div>
      <div
        ref={spotRef}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px circle at var(--sx, 50%) var(--sy, 45%), rgba(230,180,90,0.07), transparent 68%)",
        }}
        aria-hidden
      />

      {/* vertical margin rail */}
      <div
        className="pointer-events-none absolute top-1/2 left-3 z-20 hidden -translate-y-1/2 items-center gap-4 xl:flex"
        aria-hidden
      >
        <span className="font-mono text-[9px] tracking-[0.4em] text-dusk uppercase [writing-mode:vertical-rl]">
          {config.brand.estLabel}
        </span>
        <span className="h-16 w-px bg-gradient-to-b from-gold/60 to-transparent" />
      </div>

      <motion.div
        style={{ opacity: fade, willChange: "opacity" }}
        className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 items-center px-5 pt-28 pb-16 sm:px-8 lg:px-12"
      >
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 xl:gap-24">
          {/* LEFT */}
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.28em] text-mist uppercase"
            >
              <span className="flex items-center gap-2.5">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-malachite" />
                {h.badgeText}
              </span>
              <span className="hidden h-px w-8 bg-edge sm:block" />
              <span className="text-gold">{h.editionText}</span>
            </motion.div>

            <h1 className="relative mt-7 font-display text-[clamp(3.15rem,7.1vw,7.4rem)] leading-[0.88] text-ivory">
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: EASE }}
                >
                  {h.titleLine1}
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.1em]">
                <motion.span
                  className="block whitespace-nowrap"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.32, ease: EASE }}
                >
                  {h.titleLine2Prefix}{" "}
                  <em className="bg-gradient-to-r from-goldbright via-gold to-rhodo bg-clip-text text-transparent">
                    {h.titleLine2Highlight}
                  </em>
                  <span className="ml-1 inline-block h-[0.12em] w-[0.12em] rounded-full bg-gold align-super shadow-[0_0_14px_#e6b45a]" />
                </motion.span>
              </span>
              <span
                aria-hidden
                className="sheen-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay"
              />
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
              className="mt-8 flex items-start gap-5"
            >
              <span className="mt-3 h-px w-12 shrink-0 bg-gradient-to-r from-gold to-transparent" />
              <p className="max-w-md text-[15px] leading-[1.75] text-mist">{h.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
            >
              <motion.button
                onClick={onExplore}
                whileHover={{ scale: 1.035 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-4 rounded-full border border-gold/60 bg-gold py-2 pr-2 pl-6 text-sm font-bold text-[#1a1206] shadow-[0_0_38px_rgba(230,180,90,0.22)] transition-colors hover:bg-goldbright"
              >
                {h.primaryCtaText}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-goldbright transition-transform duration-300 group-hover:rotate-45">
                  <ArrowDownRight className="h-4 w-4" />
                </span>
              </motion.button>

              <button
                onClick={onStartTour}
                className="group flex items-center gap-2.5 text-sm font-bold text-ivory transition-colors hover:text-goldbright"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-surface/95 text-orchid transition-colors group-hover:border-amethyst">
                  <Compass className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
                {h.secondaryCtaText}
                <ArrowUpRight className="h-3.5 w-3.5 text-dusk transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-goldbright" />
              </button>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.05 }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-edge/80 pt-6 sm:gap-6"
            >
              {h.stats.map((s, i) => (
                <div key={s.label} className={i > 0 ? "border-l border-edge/70 pl-4 sm:pl-6" : ""}>
                  <dd className="font-display text-3xl leading-none text-goldbright sm:text-4xl">
                    <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                  </dd>
                  <dt className="mt-2 text-[9px] leading-snug font-medium tracking-[0.14em] text-dusk uppercase sm:text-[10px]">
                    {s.label}
                  </dt>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* RIGHT */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
              className="relative mx-auto w-full max-w-[540px] lg:mx-0 lg:ml-auto"
            >
              {/* rotating museum seal */}
              <div className="absolute -top-8 -right-2 z-20 h-24 w-24 sm:-right-8 sm:h-28 sm:w-28" aria-hidden>
                <div className="rotate-slow absolute inset-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <defs>
                      <path
                        id="hero-seal-path"
                        d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                      />
                    </defs>
                    <text
                      fill="#e6b45a"
                      fontFamily="IBM Plex Mono, monospace"
                      fontSize="9"
                      letterSpacing="2.6"
                    >
                      <textPath href="#hero-seal-path">
                        {config.brand.name} · COLLECTION · 2026 ·
                      </textPath>
                    </text>
                  </svg>
                </div>
                <span className="absolute inset-0 flex items-center justify-center">
                  <GemMark className="h-7 w-7 text-amethyst drop-shadow-[0_0_10px_#b48cf2]" />
                </span>
              </div>

              <motion.div
                style={{ y: cardY, rotateX, rotateY, transformPerspective: 1200, willChange: "transform" }}
                onMouseMove={onCardMove}
                onMouseLeave={() => {
                  onCardLeave();
                  setPaused(false);
                }}
                onMouseEnter={() => setPaused(true)}
                className="group/slider relative aspect-[4/3.32] w-full overflow-hidden rounded-[28px] border border-white/12 bg-surface shadow-[0_40px_100px_-35px_rgba(230,180,90,0.38)] sm:rounded-[36px]"
                role="region"
                aria-roledescription="carousel"
                aria-label="Featured specimens"
              >
                {/* Specimen slides — cinematic crossfade with subtle drift */}
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={featured.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 48, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: direction * -48, scale: 1.03 }}
                    transition={{ duration: 0.85, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <SpecimenImage photo={featuredPhoto} accent={featured.accent} variant="hero" priority />
                  </motion.div>
                </AnimatePresence>

                {/* accent wash that follows the active specimen's colour */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  animate={{
                    background: `radial-gradient(70% 55% at 50% 100%, ${featured.accent}2e, transparent 70%)`,
                  }}
                  transition={{ duration: 1.1, ease: EASE }}
                />

                <span className="absolute top-5 left-5 h-8 w-8 border-t border-l border-gold/70" aria-hidden />
                <span className="absolute right-5 bottom-5 h-8 w-8 border-r border-b border-gold/70" aria-hidden />

                <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-ivory/20 bg-abyss/90 px-3.5 py-2 font-mono text-[9px] tracking-[0.24em] text-ivory/85 uppercase backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#e6b45a]" />
                  Featured specimen · {String(slide + 1).padStart(2, "0")}
                  <span className="text-dusk">/ {String(slides.length).padStart(2, "0")}</span>
                </div>

                {/* prev / next — appear on hover, always reachable by keyboard */}
                {slides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      aria-label="Previous featured specimen"
                      className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/15 bg-abyss/70 text-ivory opacity-0 backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:border-gold/60 hover:text-goldbright focus-visible:opacity-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextSlide}
                      aria-label="Next featured specimen"
                      className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/15 bg-abyss/70 text-ivory opacity-0 backdrop-blur-md transition-all duration-300 group-hover/slider:opacity-100 hover:border-gold/60 hover:text-goldbright focus-visible:opacity-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                <div className="absolute right-6 bottom-24 left-6 sm:bottom-28">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={featured.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <div className="font-mono text-[10px] tracking-[0.25em] text-gold/90 uppercase">
                        {featured.locality}
                      </div>
                      <h2 className="mt-1.5 font-display text-4xl leading-none text-ivory sm:text-5xl">
                        {featured.name}
                      </h2>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* slide indicators with live timing bar */}
                {slides.length > 1 && (
                  <div
                    className="absolute right-6 bottom-6 z-10 flex items-center gap-1.5"
                    role="tablist"
                    aria-label="Choose specimen"
                  >
                    {slides.map((s: typeof slides[0], i: number) => {
                      const active = i === slide;
                      return (
                        <button
                          key={s.id}
                          role="tab"
                          aria-selected={active}
                          aria-label={`Show ${s.name}`}
                          onClick={() => goTo(i, i > slide ? 1 : -1)}
                          className={cnDot(active)}
                        >
                          {active && (
                            <motion.span
                              key={`${s.id}-${paused ? "p" : "r"}`}
                              className="absolute inset-y-0 left-0 rounded-full bg-gold"
                              initial={{ width: "0%" }}
                              animate={{ width: paused ? "0%" : "100%" }}
                              transition={{ duration: SLIDE_INTERVAL / 1000, ease: "linear" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
                className="absolute -bottom-7 -left-3 z-20 w-[236px] rounded-2xl border border-white/12 bg-abyss/90 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:-left-10 sm:w-[262px] sm:p-5"
              >
                <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-dusk uppercase">
                  <span>Specimen file</span>
                  <span className="text-malachite">{featured.catalog}</span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-display text-2xl leading-none text-ivory">{featured.formula}</div>
                    <div className="mt-1.5 text-[11px] text-mist">
                      {featured.system} · {featured.luster}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpen(featured.id)}
                    aria-label={`Open the ${featured.name} specimen file`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-[#1a1206] transition-all hover:bg-goldbright hover:shadow-[0_0_20px_rgba(230,180,90,0.5)] active:scale-90"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* gallery index ticker */}
      {h.showTicker && ticker.length > 0 && (
        <div className="relative z-10 border-t border-edge/70 bg-abyss/90 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-6 overflow-hidden">
            <span className="hidden shrink-0 border-r border-edge/80 pr-6 font-mono text-[9px] tracking-[0.3em] text-gold uppercase sm:block">
              {h.tickerLabel} ({config.minerals.length})
            </span>
            <div className="flex overflow-hidden" aria-hidden>
              <div className="marquee-track flex shrink-0 items-center gap-8 pr-8">
                {[...ticker, ...ticker].map((name, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-8 font-mono text-[10px] tracking-[0.26em] whitespace-nowrap text-dusk"
                  >
                    {name}
                    <GemMark className="h-2.5 w-2.5 text-gold/60" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* opening title card */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center bg-ink"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
        aria-hidden
      >
        <motion.span
          className="font-display text-5xl tracking-[0.34em] text-gold sm:text-6xl"
          initial={{ opacity: 0, letterSpacing: "0.7em" }}
          animate={{ opacity: [0, 1, 1, 0], letterSpacing: "0.34em" }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
        >
          {config.brand.name}
        </motion.span>
      </motion.div>
    </section>
  );
}
