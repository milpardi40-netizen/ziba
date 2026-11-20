import { ChevronDown, Languages, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { slugifyCategory } from "../data/categoryPages";
import { categoryMetaFor } from "../data/arabic";
import { catLabel, ui } from "../data/i18n";
import { contactContentFor, navContentFor, navMeta } from "../data/navigation";
import { useCms } from "../data/store";
import { categoryHref, navigateHome, type Route } from "../router";
import { cn } from "../utils/cn";
import { LogoMark, LogoWordmark } from "./Logo";

export default function Nav({ route }: { route: Route }) {
  const { config, isSectionVisible, lang, setLang } = useCms();
  const isHome = route.name === "home";
  const activeCategory = route.name === "category" ? route.slug : null;
  const activePage = route.name === "page" ? route.page : null;
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Only the audited, content-backed destinations belong in the header.
  // "visit" is intentionally absent: the gold Direct-contact CTA below
  // is the single contact action (the old Contact link duplicated it).
  // Labels, blurbs, promises and hrefs are CMS-editable (Admin → Header);
  // the audited defaults in data/navigation.ts remain the fallback.
  const contact = contactContentFor(config);
  const sectionLinks = config.sectionsOrder
    .filter((s) => s.visible)
    .map((s) => {
      const item = config.header.navItems.find((n) => n.id === s.id);
      if (item && !item.visible) return null;
      const content = navContentFor(config, s.id);
      return content ? { ...content } : null;
    })
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const customLinks = config.header.navItems
    .filter((n) => n.custom && n.visible)
    .map((n) => ({ id: n.id, href: n.href, label: n.label, blurb: n.blurb, promise: n.promise }));
  const links = [...sectionLinks, ...customLinks];

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? y / max : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const goHome = () => {
    setOpen(false);
    if (isHome) window.scrollTo({ top: 0, behavior: "smooth" });
    else navigateHome();
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
            onClick={goHome}
            className="group flex items-center gap-3"
            aria-label={`${config.brand.name} — home`}
          >
            <span className="relative shrink-0">
              <LogoMark className="h-11 w-auto drop-shadow-[0_0_14px_rgba(230,180,90,0.45)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" />
              <span className="absolute inset-0 -z-10 rounded-full bg-gold/30 blur-lg opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            <span className="text-start leading-none">
              <LogoWordmark className="h-[26px] w-auto max-w-none transition-opacity group-hover:opacity-90" />
              <span className="mt-1.5 block font-mono text-[8px] tracking-[0.28em] text-dusk uppercase">
                {config.brand.subtitle}
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {links.map((l) =>
              l.id === "categories" ? (
                <div key={l.id} className="group relative">
                  <a
                    href={l.href}
                    title={`${l.blurb} — ${l.promise}`}
                    aria-current={activePage === "categories" || activeCategory ? "page" : undefined}
                    className={cn(
                      "nav-link flex items-center gap-1 text-[13px] font-semibold whitespace-nowrap tracking-wide transition-colors",
                      activePage === "categories" || activeCategory
                        ? "active text-goldbright"
                        : "text-mist hover:text-ivory"
                    )}
                    aria-haspopup="true"
                  >
                    {l.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                  </a>
                  {/* Category pages dropdown */}
                  <div className="invisible absolute top-full left-1/2 z-50 w-72 -translate-x-1/2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-3xl border border-edge bg-abyss/97 p-2 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                      {config.categories.map((c) => {
                        const slug = slugifyCategory(c.name);
                        const count = config.minerals.filter((m) => m.category === c.name).length;
                        return (
                          <a
                            key={c.id}
                            href={categoryHref(c.name)}
                            aria-current={activeCategory === slug ? "page" : undefined}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-colors hover:bg-surface",
                              activeCategory === slug && "bg-surface"
                            )}
                          >
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: c.color, boxShadow: `0 0 12px ${c.color}` }}
                              aria-hidden
                            />
                            <span className="flex-1">
                              <span className="block text-[13px] font-bold text-ivory">{catLabel(c.name, lang)}</span>
                              <span className="block text-[11px] leading-snug text-dusk italic">
                                {categoryMetaFor(c.name, lang).tagline}
                              </span>
                              <span className="mt-0.5 block font-mono text-[9px] tracking-[0.14em] text-dusk/80 uppercase">
                                {count} {ui(lang, "specimensWord")} · {config.header.dropdownPageSuffix}
                              </span>
                            </span>
                            <ChevronDown className="flip-rtl h-3.5 w-3.5 -rotate-90 text-dusk" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={l.id}
                  href={l.href}
                  title={`${l.blurb} — ${l.promise}`}
                  aria-current={activePage === l.id ? "page" : undefined}
                  className={cn(
                    "nav-link text-[13px] font-semibold whitespace-nowrap tracking-wide transition-colors",
                    activePage === l.id ? "active text-goldbright" : "text-mist hover:text-ivory"
                  )}
                >
                  {l.label}
                </a>
              )
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* The single contact action. The old plain "Contact" nav link
                duplicated this CTA and has been merged into it; the Admin
                button was removed from the public header entirely (owner
                access lives in the footer / Ctrl+Shift+A / #admin). */}
            {isSectionVisible("visit") && config.header.showContactCta && (
              <a
                href={contact.href}
                title={`${contact.blurb} — ${contact.promise}`}
                aria-label={`${contact.label} — ${config.contact.phoneDisplay}`}
                aria-current={activePage === "visit" ? "page" : undefined}
                className="group hidden items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[13px] font-bold whitespace-nowrap text-[#1a1206] shadow-[0_0_24px_rgba(230,180,90,0.25)] transition-all hover:bg-goldbright hover:shadow-[0_0_36px_rgba(230,180,90,0.45)] sm:flex"
              >
                <Phone className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
                {contact.label}
              </a>
            )}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex h-11 items-center gap-1.5 rounded-full border border-edge bg-surface/95 px-3.5 text-[12px] font-bold text-ivory transition-colors hover:border-gold/60 hover:text-goldbright"
              aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
              title={ui(lang, "languageName")}
            >
              <Languages className="h-4 w-4 text-gold" />
              {ui(lang, "languageName")}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-surface/95 text-ivory lg:hidden"
              aria-label={lang === "ar" ? "فتح القائمة" : "Open menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-transparent">
          <div
            className="h-full origin-left bg-gradient-to-r from-amethyst via-rhodo to-gold rtl:origin-right"
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
          <button
            onClick={goHome}
            className="flex items-center gap-3"
            aria-label={`${config.brand.name} — home`}
          >
            <LogoMark className="h-9 w-auto" />
            <LogoWordmark className="h-[22px] w-auto max-w-none" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-surface text-ivory"
            aria-label={lang === "ar" ? "إغلاق القائمة" : "Close menu"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-8 py-6" aria-label="Mobile">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={activePage === l.id ? "page" : undefined}
              className="group flex items-baseline gap-4 border-b border-edge/50 py-3.5 text-start"
            >
              <span className="font-mono text-xs text-gold">0{i + 1}</span>
              <span className="flex-1">
                <span className="block font-display text-[26px] leading-tight font-light text-ivory transition-colors group-hover:text-goldbright">
                  {l.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-dusk italic">{l.blurb}</span>
                <span className="mt-1 block font-mono text-[9px] tracking-[0.18em] text-dusk/80 uppercase">
                  {navMeta(l.id, config)}
                </span>
              </span>
            </a>
          ))}
          {/* Dedicated category pages */}
          <div className="pt-5">
            <span className="font-mono text-[10px] tracking-[0.3em] text-dusk uppercase">
              {config.header.categoryPagesLabel}
            </span>
            <div className="mt-3 flex flex-col gap-2">
              {config.categories.map((c) => {
                const slug = slugifyCategory(c.name);
                return (
                  <a
                    key={c.id}
                    href={categoryHref(c.name)}
                    onClick={() => setOpen(false)}
                    aria-current={activeCategory === slug ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-edge bg-surface/80 px-4 py-3",
                      activeCategory === slug && "border-gold/60"
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: c.color, boxShadow: `0 0 12px ${c.color}` }}
                      aria-hidden
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-ivory">{catLabel(c.name, lang)}</span>
                      <span className="block text-[11px] text-dusk italic">
                        {categoryMetaFor(c.name, lang).tagline}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] text-dusk">
                      {config.minerals.filter((m) => m.category === c.name).length} {ui(lang, "pcsWord")}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {isSectionVisible("visit") && config.header.showContactCta && (
              <>
                <a
                  href={contact.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-bold text-[#1a1206]"
                >
                  <Phone className="h-4 w-4" /> {contact.label}
                </a>
                <p className="px-2 text-center text-[12px] leading-relaxed text-dusk">
                  {contact.blurb} ·{" "}
                  <a
                    href={`tel:${config.contact.phoneHref}`}
                    className="font-semibold text-goldbright"
                  >
                    {config.contact.phoneDisplay}
                  </a>
                  <span className="mt-1 block">{contact.promise}</span>
                </p>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
