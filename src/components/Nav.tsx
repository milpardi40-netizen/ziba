import { Menu, Phone, Sliders, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCms } from "../data/store";
import { cn } from "../utils/cn";
import { GemMark } from "./ui";

const NAV_LABELS: Record<string, string> = {
  highlights: "Highlights",
  collection: "Collection",
  glow: "Glow Room",
  deeptime: "Deep Time",
  stories: "Field Notes",
  visit: "Contact",
};

export default function Nav({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { config, isSectionVisible } = useCms();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const links = config.sectionsOrder
    .filter((s) => s.visible && s.id in NAV_LABELS)
    .map((s) => ({ id: s.id, label: NAV_LABELS[s.id] }));

  const unreadCount = config.inquiries.filter((i) => i.status === "new").length;

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? y / max : 0);
        let current = "";
        for (const l of links) {
          const el = document.getElementById(l.id);
          if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = l.id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [links]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-edge/70 bg-ink/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
            aria-label={`${config.brand.name} — back to top`}
          >
            <span className="relative">
              <GemMark className="h-8 w-8 text-amethyst transition-transform duration-500 group-hover:rotate-[20deg]" />
              <span className="absolute inset-0 -z-10 rounded-full bg-amethyst/40 blur-lg opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            <span className="text-left leading-none">
              <span className="block font-display text-xl font-medium tracking-[0.18em] text-ivory">
                {config.brand.name}
              </span>
              <span className="mt-1 block font-mono text-[8.5px] tracking-[0.3em] text-dusk uppercase">
                {config.brand.subtitle}
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={cn(
                  "nav-link text-[13px] font-semibold tracking-wide transition-colors",
                  active === l.id ? "active text-goldbright" : "text-mist hover:text-ivory"
                )}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAdmin}
              className="relative hidden items-center gap-1.5 rounded-full border border-edge bg-surface/90 px-3.5 py-2 text-[12px] font-semibold text-mist transition-all hover:border-gold/60 hover:text-goldbright sm:flex"
              aria-label="Open Admin Panel"
            >
              <Sliders className="h-3.5 w-3.5 text-gold" />
              <span>Admin</span>
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rhodo px-1 font-mono text-[9px] font-bold text-ink">
                  {unreadCount}
                </span>
              )}
            </button>
            {isSectionVisible("visit") && (
              <button
                onClick={() => go("visit")}
                className="group hidden items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[13px] font-bold text-[#1a1206] shadow-[0_0_24px_rgba(230,180,90,0.25)] transition-all hover:bg-goldbright hover:shadow-[0_0_36px_rgba(230,180,90,0.45)] sm:flex"
              >
                <Phone className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
                Direct contact
              </button>
            )}
            <button
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-surface/95 text-ivory lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-transparent">
          <div
            className="h-full origin-left bg-gradient-to-r from-amethyst via-rhodo to-gold"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>

      {/* Mobile menu — CSS transition only, no framer-motion */}
      <div
        ref={menuRef}
        className={cn(
          "fixed inset-0 z-[80] flex flex-col bg-ink/97 backdrop-blur-2xl lg:hidden",
          "transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div className="flex h-[72px] items-center justify-between px-5 sm:px-8">
          <span className="flex items-center gap-3">
            <GemMark className="h-7 w-7 text-amethyst" />
            <span className="font-display text-lg tracking-[0.18em] text-ivory">
              {config.brand.name}
            </span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-surface text-ivory"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col justify-center gap-1 px-8" aria-label="Mobile">
          {links.map((l, i) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="group flex items-baseline gap-4 border-b border-edge/50 py-4 text-left"
            >
              <span className="font-mono text-xs text-gold">0{i + 1}</span>
              <span className="font-display text-3xl font-light text-ivory transition-colors group-hover:text-goldbright">
                {l.label}
              </span>
            </button>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            {isSectionVisible("visit") && (
              <button
                onClick={() => go("visit")}
                className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-bold text-[#1a1206]"
              >
                <Phone className="h-4 w-4" /> Direct contact
              </button>
            )}
            <button
              onClick={() => {
                setOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 rounded-full border border-edge bg-surface px-6 py-3.5 text-sm font-bold text-ivory"
            >
              <Sliders className="h-4 w-4 text-gold" /> Admin Panel
              {unreadCount > 0 && ` (${unreadCount})`}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
