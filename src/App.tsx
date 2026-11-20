import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import FloatingActions from "./components/FloatingActions";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import { slugifyCategory } from "./data/categoryPages";
import { contactContentFor, navContentFor } from "./data/navigation";
import { navPageFor } from "./data/arabic";
import { catLabel, ui } from "./data/i18n";
import { CmsProvider, useCms } from "./data/store";
import { takePendingAnchor, useRoute } from "./router";

// All sections below the hero fold — loaded after first paint
const Intro       = lazy(() => import("./components/Intro"));
const Highlights  = lazy(() => import("./components/Highlights"));
const Categories  = lazy(() => import("./components/Categories"));
const CustomSection = lazy(() => import("./components/CustomSection"));
const Collection  = lazy(() => import("./components/Collection"));
const GlowRoom    = lazy(() => import("./components/GlowRoom"));
const DeepTime    = lazy(() => import("./components/DeepTime"));
const Stories     = lazy(() => import("./components/Stories"));
const Visit       = lazy(() => import("./components/Visit"));
const Footer      = lazy(() => import("./components/Footer"));

// Dedicated per-category & per-nav-button pages + 404 — loaded only when routed to
const CategoryPage  = lazy(() => import("./components/CategoryPage"));
const NavPage       = lazy(() => import("./components/NavPage"));
const RouteNotFound = lazy(() =>
  import("./components/CategoryPage").then((m) => ({ default: m.RouteNotFound }))
);

// Modal overlays — loaded only when triggered
const SpecimenModal = lazy(() => import("./components/SpecimenModal"));
const AdminPanel    = lazy(() => import("./components/AdminPanel"));

const SAVED_KEY = "lithos-saved-specimens";
const DEFAULT_TITLE = "Vernajewel — Haute Mineralogie · Private Salon & Archive";
const DEFAULT_DESC =
  "Vernajewel Haute Mineralogie — An international private salon and archival exhibition of museum-grade crystals, native metals, and cosmic meteorites.";

function GalleryShell() {
  const { config, lang } = useCms();
  const route = useRoute();
  const [saved, setSaved] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (!raw) return new Set();
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [tour, setTour] = useState(false);
  const [adminOpen, setAdminOpen] = useState(() => window.location.hash === "#admin");
  const [adminReturnHash, setAdminReturnHash] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    } catch {
      /* private mode */
    }
  }, [saved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setAdminOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Direct admin link (#admin) — opens the panel whenever the hash
  // arrives, not only on a fresh page load.
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#admin") {
        setAdminReturnHash(null);
        setAdminOpen(true);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  /* ————— Per-route document title, meta description & scroll handling ————— */
  useEffect(() => {
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (route.name === "page") {
      const meta = navPageFor(route.page, lang);
      const label =
        route.page === "visit"
          ? contactContentFor(config).label
          : navContentFor(config, route.page)?.label ?? route.page;
      document.title = `${label} — ${meta.tagline} · Vernajewel Haute Mineralogie`;
      if (metaDesc) metaDesc.content = `${meta.intro.slice(0, 155)}…`;
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } else if (route.name === "category") {
      const cat = config.categories.find((c) => slugifyCategory(c.name) === route.slug);
      const count = cat
        ? config.minerals.filter((m) => m.category === cat.name).length
        : 0;
      document.title = cat
        ? `${catLabel(cat.name, lang)} · ${count} ${ui(lang, "specimensWord")} — Vernajewel Haute Mineralogie`
        : "Cabinet not found — Vernajewel Haute Mineralogie";
      if (metaDesc && cat) {
        metaDesc.content = `The ${cat.name} cabinet of the Vernajewel private salon: ${count} museum-grade specimens with full provenance, locality and catalogue records.`;
      }
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } else if (route.name === "not-found") {
      document.title = "Not found — Vernajewel Haute Mineralogie";
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } else {
      document.title = DEFAULT_TITLE;
      if (metaDesc) metaDesc.content = DEFAULT_DESC;
      const anchor = route.anchor ?? takePendingAnchor();
      if (anchor) {
        // Home sections are lazy — retry briefly until the anchor mounts.
        let tries = 0;
        const tick = () => {
          const el = document.getElementById(anchor);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else if (tries++ < 40) {
            window.setTimeout(tick, 50);
          }
        };
        window.setTimeout(tick, 30);
      } else if (window.location.hash === "#/" || window.location.hash === "") {
        // Plain home navigation (no anchor): start at the top — but only
        // when arriving from another route, not on first load.
        if (routeChangedOnce.current) {
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }
      }
    }
    routeChangedOnce.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, config.categories, lang]);

  const toggleSave = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openSpecimen = useCallback((id: string) => {
    setTour(false);
    setOpenId(id);
  }, []);

  const startTour = useCallback(() => {
    if (config.minerals.length === 0) return;
    setTour(true);
    setOpenId(config.minerals[0].id);
  }, [config.minerals]);

  const closeModal = useCallback(() => {
    setOpenId(null);
    setTour(false);
  }, []);

  const exploreCollection = useCallback(() => {
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const openAdmin = useCallback(() => {
    setAdminReturnHash(
      window.location.hash && window.location.hash !== "#admin"
        ? window.location.hash
        : null
    );
    setAdminOpen(true);
  }, []);

  const closeAdmin = useCallback(() => {
    setAdminOpen(false);
    if (window.location.hash === "#admin") {
      window.history.replaceState(
        null,
        "",
        adminReturnHash ?? `${window.location.pathname}${window.location.search}#/`
      );
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    setAdminReturnHash(null);
  }, [adminReturnHash]);

  const isHome = route.name === "home";

  return (
    <div className="grain relative min-h-screen bg-ink text-ivory antialiased">
      <Nav route={route} />
      <div className="cinema-grade" aria-hidden />
      <div className="cinema-vignette" aria-hidden />
      <main
        key={
          route.name === "category"
            ? `cat-${route.slug}`
            : route.name === "page"
              ? `page-${route.page}`
              : route.name
        }
      >
        {route.name === "category" && (
          <Suspense
            fallback={
              <div className="flex min-h-[60vh] items-center justify-center pt-24 font-mono text-[11px] tracking-[0.3em] text-dusk uppercase">
                {lang === "ar" ? "جارٍ فتح الخزانة…" : "Opening the cabinet…"}
              </div>
            }
          >
            <CategoryPage
              slug={route.slug}
              saved={saved}
              onToggleSave={toggleSave}
              onOpen={openSpecimen}
            />
          </Suspense>
        )}

        {route.name === "page" && (
          <Suspense
            fallback={
              <div className="flex min-h-[60vh] items-center justify-center pt-24 font-mono text-[11px] tracking-[0.3em] text-dusk uppercase">
                {lang === "ar" ? "جارٍ تجهيز الغرفة…" : "Preparing the room…"}
              </div>
            }
          >
            <NavPage
              page={route.page}
              saved={saved}
              onToggleSave={toggleSave}
              onOpen={openSpecimen}
              onStartTour={startTour}
            />
          </Suspense>
        )}

        {route.name === "not-found" && (
          <Suspense fallback={null}>
            <RouteNotFound path={`#${route.path}`} />
          </Suspense>
        )}

        {isHome &&
          config.sectionsOrder.map((sec) => {
            if (!sec.visible) return null;
            switch (sec.id) {
              case "hero":
                return (
                  <Hero
                    key="hero"
                    onExplore={exploreCollection}
                    onStartTour={startTour}
                    onOpen={openSpecimen}
                  />
                );
              case "intro":
                return <Suspense key="intro" fallback={null}><Intro /></Suspense>;
              case "highlights":
                return <Suspense key="highlights" fallback={null}><Highlights onOpen={openSpecimen} /></Suspense>;
              case "categories":
                return <Suspense key="categories" fallback={null}><Categories /></Suspense>;
              case "collection":
                return (
                  <Suspense key="collection" fallback={null}>
                    <Collection saved={saved} onToggleSave={toggleSave} onOpen={openSpecimen} />
                  </Suspense>
                );
              case "glow":
                return <Suspense key="glow" fallback={null}><GlowRoom /></Suspense>;
              case "deeptime":
                return <Suspense key="deeptime" fallback={null}><DeepTime /></Suspense>;
              case "stories":
                return <Suspense key="stories" fallback={null}><Stories /></Suspense>;
              case "visit":
                return <Suspense key="visit" fallback={null}><Visit onStartTour={startTour} /></Suspense>;
              default: {
                // Admin-authored custom sections, managed 0–100 in the panel
                const custom = config.customSections.find((cs) => cs.id === sec.id);
                if (!custom) return null;
                return (
                  <Suspense key={sec.id} fallback={null}>
                    <CustomSection section={custom} />
                  </Suspense>
                );
              }
            }
          })}
      </main>
      <Suspense fallback={null}>
        <Footer onOpenAdmin={openAdmin} />
      </Suspense>
      <FloatingActions />
      <Suspense fallback={null}>
        <SpecimenModal
          openId={openId}
          tour={tour}
          saved={saved}
          onToggleSave={toggleSave}
          onClose={closeModal}
          onNavigate={setOpenId}
        />
      </Suspense>
      <Suspense fallback={null}>
        <AdminPanel open={adminOpen} onClose={closeAdmin} />
      </Suspense>
    </div>
  );
}

// Tracks whether the route effect has run at least once (module-level is
// fine: a single app instance is mounted per document).
const routeChangedOnce = { current: false };

export default function App() {
  return (
    <CmsProvider>
      <GalleryShell />
    </CmsProvider>
  );
}
