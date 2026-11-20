import { ArrowUp, Phone, Sliders } from "lucide-react";
import { useCms } from "../data/store";
import { GemMark } from "./ui";
import PhotographyCredits from "./PhotographyCredits";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
    </svg>
  );
}

const COLS = [
  {
    title: "Exhibition",
    links: [
      { label: "Masterwork Highlights", id: "highlights" },
      { label: "The Specimen Vault", id: "collection" },
      { label: "Photoluminescence Lab", id: "glow" },
      { label: "Deep Time Chronology", id: "deeptime" },
    ],
  },
  {
    title: "Curatorial Journal",
    links: [
      { label: "All Dispatches", id: "stories" },
      { label: "Laws of Crystalline Matter", id: "stories" },
      { label: "Crystal Growth Physics", id: "stories" },
      { label: "Pre-Terrestrial Iron", id: "stories" },
    ],
  },
  {
    title: "Private Salon",
    links: [
      { label: "Collector Concierge", id: "visit" },
      { label: "Telephone & WhatsApp Desk", id: "visit" },
      { label: "Request a Dossier", id: "visit" },
      { label: "Curatorial Manifesto", id: "exhibition" },
    ],
  },
];

export default function Footer({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { config } = useCms();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden border-t border-edge/70 bg-abyss">
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[26rem] w-[50rem] -translate-x-1/2 rounded-full bg-gold/8 blur-[140px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-10 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <div className="flex items-center gap-3">
              <GemMark className="h-9 w-9 text-amethyst" />
              <div>
                <div className="font-display text-2xl tracking-[0.18em] text-ivory">
                  {config.brand.name}
                </div>
                <div className="font-mono text-[9px] tracking-[0.3em] text-dusk uppercase">
                  {config.brand.subtitle}
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">
              {config.brand.footerTagline}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-goldbright">
              <Phone className="h-3.5 w-3.5" />
              <a href={`tel:${config.contact.phoneHref}`} className="hover:underline">
                {config.contact.phoneDisplay}
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {[
                { icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com" },
                { icon: YoutubeIcon, label: "YouTube", href: "https://www.youtube.com" },
                { icon: XIcon, label: "X (Twitter)", href: "https://www.x.com" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-surface/95 text-mist transition-all hover:border-gold/60 hover:text-goldbright"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-2 rounded-full border border-edge bg-surface/95 px-4 py-2 text-xs font-semibold text-mist transition-all hover:border-gold/60 hover:text-goldbright"
              >
                <Sliders className="h-3.5 w-3.5 text-gold" />
                Admin Panel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h4 className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={() => go(l.id)}
                        className="text-sm text-mist transition-colors hover:text-goldbright"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <PhotographyCredits />

        <div className="mt-5 flex flex-col items-center justify-between gap-5 border-t border-edge/60 pt-7 sm:flex-row">
          <p className="text-center font-mono text-[10px] tracking-[0.18em] text-dusk uppercase">
            {config.brand.copyrightText}
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 rounded-full border border-edge px-5 py-2.5 text-xs font-bold text-mist transition-all hover:border-amethyst hover:text-orchid"
          >
            Back to the surface
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
