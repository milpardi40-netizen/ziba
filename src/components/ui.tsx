import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 30,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  overline,
  title,
  sub,
  align = "left",
  accent = "#e6b45a",
  chapter,
}: {
  overline: string;
  title: ReactNode;
  sub?: string;
  align?: "left" | "center";
  accent?: string;
  chapter?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <Reveal>
        <div
          className={cn(
            "flex items-center gap-3 font-mono text-[11px] tracking-[0.32em] uppercase",
            align === "center" && "justify-center"
          )}
          style={{ color: accent }}
        >
          <GemMark className="h-3 w-3" />
          {chapter && (
            <span className="rounded-full border border-edge bg-surface/95 px-2.5 py-1 text-[9px] text-ivory">
              {chapter}
            </span>
          )}
          {overline}
          <span
            className="hidden h-px w-16 sm:block"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
          />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-4 font-display text-4xl leading-[1.06] font-light text-ivory sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base leading-relaxed text-mist sm:text-lg">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

export function GemMark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} style={style} aria-hidden>
      <path d="M16 2 28 12 16 30 4 12Z" fill="currentColor" opacity="0.45" />
      <path d="M16 2 22 12 16 30 10 12Z" fill="currentColor" />
      <path d="M4 12h24" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

export function RarityGems({ value, accent, className }: { value: number; accent: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} title={`Rarity ${value} of 5`} aria-label={`Rarity ${value} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <GemMark
          key={i}
          className="h-2.5 w-2.5"
          style={{ color: i < value ? accent : "#46696f", opacity: i < value ? 1 : 0.6 }}
        />
      ))}
    </span>
  );
}

export function CountUp({
  value,
  suffix = "",
  decimals = 0,
  duration = 1800,
  className,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(2, -10 * t);
      setDisplay(value * (t === 1 ? 1 : eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function MohsBar({ value, accent }: { value: number; accent: string }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label={`Mohs hardness ${value} of 10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="h-2.5 w-1 rounded-full transition-colors"
          style={{
            background: i < Math.round(value) ? accent : "#3d656c",
            opacity: i < Math.round(value) ? 0.45 + (i / 10) * 0.55 : 1,
          }}
        />
      ))}
    </div>
  );
}

export { EASE };