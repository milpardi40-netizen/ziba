import { Power, Zap } from "lucide-react";
import { useState } from "react";
import { useCms } from "../data/store";
import { cn } from "../utils/cn";
import { Reveal, SectionHeading } from "./ui";
import SpecimenImage from "./SpecimenImage";

export default function GlowRoom() {
  const { config, getPhoto } = useCms();
  const s = config.glow;
  const photo = getPhoto(s.photoId);

  const [lampOn, setLampOn] = useState(true);
  const [wavelength, setWavelength] = useState<254 | 365>(254);
  const [intensity, setIntensity] = useState(75);

  const power = intensity / 100;
  const hue = wavelength === 254 ? 0 : 9;
  const imgFilter = lampOn
    ? `saturate(${1 + power * 0.12}) brightness(${0.8 + power * 0.3}) hue-rotate(${hue}deg)`
    : "grayscale(0.92) brightness(0.42) contrast(0.95)";
  const glowShadow = lampOn
    ? `0 0 ${60 + power * 90}px rgba(166,255,138,${0.16 + power * 0.2}), 0 0 ${140 * power}px rgba(180,140,242,${0.2 * power})`
    : "none";

  return (
    <section id="glow" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: lampOn ? 0.6 + power * 0.4 : 0.15,
          background:
            "radial-gradient(60% 50% at 30% 40%, rgba(180,140,242,0.16), transparent 70%), radial-gradient(45% 40% at 75% 65%, rgba(166,255,138,0.07), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 rule-gem opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          overline={s.overline}
          chapter={s.chapter}
          title={
            <>
              {s.titlePrefix}
              <em className="bg-gradient-to-r from-malachite via-aqua to-orchid bg-clip-text text-transparent">
                {s.titleHighlight}
              </em>
            </>
          }
          sub={s.subtitle}
          accent={s.accent}
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-14">
          <Reveal y={40}>
            <div
              className="relative overflow-hidden rounded-3xl border transition-all duration-700"
              style={{
                borderColor: lampOn ? "#b48cf280" : "#3d656c",
                boxShadow: glowShadow,
              }}
            >
              <div className="relative h-[280px] sm:h-[340px]">
                <div className="absolute inset-0 transition-[filter] duration-700" style={{ filter: imgFilter }}>
                  <SpecimenImage photo={photo} variant="stage" accent={s.accent} />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                  style={{
                    opacity: lampOn ? 0.25 * power : 0,
                    background:
                      "radial-gradient(70% 60% at 50% 45%, rgba(180,140,242,0.35), transparent 75%)",
                    mixBlendMode: "screen",
                  }}
                />
                <div className="scanlines pointer-events-none absolute inset-0" aria-hidden />
                <div
                  className="uv-beam beam-sway pointer-events-none absolute -top-10 left-[14%] h-[125%] w-1/3"
                  style={{ opacity: lampOn ? 0.14 + power * 0.16 : 0 }}
                  aria-hidden
                />

                <div className="absolute top-4 left-4 flex items-center gap-2.5 rounded-full border border-ivory/15 bg-ink/75 px-4 py-2 backdrop-blur-md">
                  <span
                    className={cn("h-2 w-2 rounded-full transition-all", lampOn && "lamp-pulse")}
                    style={{
                      background: lampOn ? "#a3f58a" : "#557b81",
                      boxShadow: lampOn ? "0 0 10px #a3f58a" : "none",
                    }}
                  />
                  <span className="font-mono text-[10px] tracking-[0.24em] text-ivory/85 uppercase">
                    {lampOn ? `UV lamp · ${wavelength} nm` : "Daylight · lamp off"}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 rounded-full border border-ivory/15 bg-ink/75 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-ivory/70 uppercase backdrop-blur-md">
                  {s.specimenLabel}
                </div>
              </div>
            </div>
            <p className="mt-4 text-center font-mono text-[11px] tracking-wider text-dusk">
              {lampOn
                ? wavelength === 254
                  ? s.caption254
                  : s.caption365
                : s.captionOff}
            </p>
            <p className="mt-2 text-center text-[10px] text-dusk/80">
              Interactive lighting visualization. Photo credit: {photo.author}.
            </p>
          </Reveal>

          <Reveal delay={0.12} y={40}>
            <div className="flex h-full flex-col gap-5">
              <div className="rounded-3xl border border-edge bg-surface p-6 backdrop-blur">
                <div className="font-mono text-[10px] tracking-[0.28em] text-dusk uppercase">
                  Lamp console
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-sm font-bold text-ivory">
                    <Power className={cn("h-4 w-4", lampOn ? "text-malachite" : "text-dusk")} />
                    Ultraviolet lamp
                  </span>
                  <button
                    onClick={() => setLampOn((v) => !v)}
                    role="switch"
                    aria-checked={lampOn}
                    aria-label="Toggle ultraviolet lamp"
                    className={cn(
                      "relative h-8 w-15 rounded-full border transition-all duration-300",
                      lampOn
                        ? "border-malachite/70 bg-malachite/25 shadow-[0_0_18px_rgba(79,217,166,0.35)]"
                        : "border-edge bg-ink"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full transition-all duration-300",
                        lampOn ? "left-[calc(100%-1.7rem)] bg-malachite" : "left-1 bg-dusk"
                      )}
                    />
                  </button>
                </div>

                <div className="mt-6">
                  <div className="mb-2.5 flex items-center justify-between text-sm">
                    <span className="font-bold text-ivory">Wavelength</span>
                    <span className="font-mono text-xs text-orchid">{wavelength} nm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-edge bg-abyss/90 p-1.5">
                    {([254, 365] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setWavelength(w)}
                        aria-pressed={wavelength === w}
                        className={cn(
                          "rounded-xl py-2.5 text-xs font-bold transition-all duration-300",
                          wavelength === w
                            ? "bg-amethyst text-ink shadow-[0_0_20px_rgba(180,140,242,0.45)]"
                            : "text-mist hover:text-ivory"
                        )}
                      >
                        {w === 254 ? "Shortwave · 254" : "Longwave · 365"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-bold text-ivory">Lamp intensity</span>
                    <span className="font-mono text-xs text-malachite">{intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="gem-range w-full"
                    aria-label="Lamp intensity"
                  />
                </div>

                <button
                  onClick={() => {
                    setLampOn(true);
                    setWavelength(254);
                    setIntensity(75);
                  }}
                  className="mt-6 w-full rounded-full border border-edge py-3 text-xs font-bold tracking-wide text-mist uppercase transition-colors hover:border-gold/60 hover:text-goldbright"
                >
                  Reset console
                </button>
              </div>

              <div className="rounded-3xl border border-edge bg-surface p-6 backdrop-blur">
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] text-dusk uppercase">
                  <Zap className="h-3.5 w-3.5 text-gold" /> What you're seeing
                </div>
                <ul className="mt-4 space-y-3">
                  {s.emissions.map((f) => (
                    <li key={f.name} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <span
                          className={cn("h-3 w-3 rounded-full transition-all duration-500", lampOn && "lamp-pulse")}
                          style={{
                            background: lampOn ? f.color : "#46696f",
                            boxShadow: lampOn ? `0 0 12px ${f.color}` : "none",
                          }}
                        />
                        <span className="text-sm font-bold text-ivory">{f.name}</span>
                        <span className="font-mono text-xs text-dusk">{f.formula}</span>
                      </span>
                      <span className="text-xs font-semibold" style={{ color: lampOn ? f.color : "#7b9b98" }}>
                        {f.emits}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-edge/60 pt-4 text-xs leading-relaxed text-dusk">
                  {s.note}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
