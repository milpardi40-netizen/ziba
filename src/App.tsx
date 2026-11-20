import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import { CmsProvider, useCms } from "./data/store";

// All sections below the hero fold — loaded after first paint
const Intro       = lazy(() => import("./components/Intro"));
const Highlights  = lazy(() => import("./components/Highlights"));
const Collection  = lazy(() => import("./components/Collection"));
const GlowRoom    = lazy(() => import("./components/GlowRoom"));
const DeepTime    = lazy(() => import("./components/DeepTime"));
const Stories     = lazy(() => import("./components/Stories"));
const Visit       = lazy(() => import("./components/Visit"));
const Footer      = lazy(() => import("./components/Footer"));

// Modal overlays — loaded only when triggered
const SpecimenModal = lazy(() => import("./components/SpecimenModal"));
const AdminPanel    = lazy(() => import("./components/AdminPanel"));

const SAVED_KEY = "lithos-saved-specimens";

function GalleryShell() {
  const { config } = useCms();
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

  return (
    <div className="grain relative min-h-screen bg-ink text-ivory antialiased">
      <Nav onOpenAdmin={() => setAdminOpen(true)} />
      <div className="cinema-grade" aria-hidden />
      <div className="cinema-vignette" aria-hidden />
      <main>
        {config.sectionsOrder.map((sec) => {
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
            default:
              return null;
          }
        })}
      </main>
      <Suspense fallback={null}>
        <Footer onOpenAdmin={() => setAdminOpen(true)} />
      </Suspense>
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
        <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <GalleryShell />
    </CmsProvider>
  );
}
