import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CONFIG,
  type ArticleItem,
  type BuyerInquiry,
  type CategoryItem,
  type EraItem,
  type MineralItem,
  type SectionId,
  type SiteConfig,
} from "./defaults";
import { PHOTOS, type SpecimenPhoto } from "./photography";
import { applyOverlay, type Lang } from "./i18n";
import { DEFAULT_AR } from "./arabic";
import {
  backendEnabled,
  deleteRemoteInquiry,
  fetchRemoteConfig,
  fetchRemoteInquiries,
  insertRemoteInquiry,
  saveRemoteConfig,
  setRemoteInquiryStatus,
  signInOwner,
  signOutOwner,
  supabase,
  type Session,
} from "./backend";
import {
  collectChangedLeaves,
  collectUntranslatedLeaves,
  setAtPath,
  translateEnToAr,
  type ChangedLeaf,
} from "./autotranslate";

const CMS_STORAGE_KEY = "lithos-cms-v2";
const LANG_STORAGE_KEY = "vernajewel-lang";
const AUTOSYNC_STORAGE_KEY = "vernajewel-autosync-ar";

/** Above this many changed strings at once (bulk import / reset), the
 *  automatic translator stands aside — the admin can run a manual sync. */
const AUTO_SYNC_MAX_LEAVES = 40;

export interface SyncState {
  status: "idle" | "working" | "done" | "error";
  /** Strings waiting to be translated. */
  pending: number;
  /** Strings translated in the last finished run. */
  translated: number;
  /** Last run copied English because no translator was reachable. */
  fellBack: boolean;
}

/** Saved configs may predate newly added sections — splice any missing
 *  default sections back in at their canonical position, preserving the
 *  admin's chosen order & visibility for everything already saved. */
function mergeSections(
  saved: SiteConfig["sectionsOrder"] | undefined,
  customIds: string[] = [],
  deletedIds: string[] = []
): SiteConfig["sectionsOrder"] {
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_CONFIG.sectionsOrder;
  const known = new Set([
    ...DEFAULT_CONFIG.sectionsOrder.map((s) => s.id),
    ...customIds,
  ]);
  const deleted = new Set(deletedIds);
  const merged = saved.filter((s) => s && known.has(s.id) && !deleted.has(s.id));
  DEFAULT_CONFIG.sectionsOrder.forEach((def, i) => {
    if (deleted.has(def.id)) return; // admin deleted it on purpose — keep it gone
    if (merged.some((s) => s.id === def.id)) return;
    // Insert after the nearest preceding default section that is present.
    let insertAt = merged.length;
    for (let j = i - 1; j >= 0; j--) {
      const pos = merged.findIndex((s) => s.id === DEFAULT_CONFIG.sectionsOrder[j].id);
      if (pos >= 0) {
        insertAt = pos + 1;
        break;
      }
      insertAt = 0;
    }
    merged.splice(insertAt, 0, { ...def });
  });
  return merged;
}

function mergeConfig(raw: Partial<SiteConfig> | null | undefined): SiteConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_CONFIG;
  return {
    // Brand migration: configs saved before the Vernajewel identity still
    // carry the template's old default name — upgrade exactly that value,
    // while preserving any name the admin deliberately customised.
    brand: {
      ...DEFAULT_CONFIG.brand,
      ...raw.brand,
      ...(raw.brand?.name === "LITHOS" ? { name: DEFAULT_CONFIG.brand.name } : {}),
    },
    contact: { ...DEFAULT_CONFIG.contact, ...raw.contact },
    header: {
      ...DEFAULT_CONFIG.header,
      ...raw.header,
      navItems: Array.isArray(raw.header?.navItems)
        ? raw.header.navItems
        : DEFAULT_CONFIG.header.navItems,
    },
    footer: {
      ...DEFAULT_CONFIG.footer,
      ...raw.footer,
      columns: Array.isArray(raw.footer?.columns)
        ? raw.footer.columns
        : DEFAULT_CONFIG.footer.columns,
      socials: Array.isArray(raw.footer?.socials)
        ? raw.footer.socials
        : DEFAULT_CONFIG.footer.socials,
    },
    sectionsOrder: mergeSections(
      raw.sectionsOrder,
      Array.isArray(raw.customSections)
        ? raw.customSections.map((s) => s?.id).filter(Boolean)
        : [],
      Array.isArray(raw.deletedSectionIds) ? raw.deletedSectionIds : []
    ),
    hero: {
      ...DEFAULT_CONFIG.hero,
      ...raw.hero,
      backdropPhotoIds: Array.isArray(raw.hero?.backdropPhotoIds)
        ? raw.hero.backdropPhotoIds
        : DEFAULT_CONFIG.hero.backdropPhotoIds,
      slideSpecimenIds: Array.isArray(raw.hero?.slideSpecimenIds)
        ? raw.hero.slideSpecimenIds
        : DEFAULT_CONFIG.hero.slideSpecimenIds,
    },
    intro: { ...DEFAULT_CONFIG.intro, ...raw.intro },
    highlights: { ...DEFAULT_CONFIG.highlights, ...raw.highlights },
    collection: { ...DEFAULT_CONFIG.collection, ...raw.collection },
    glow: { ...DEFAULT_CONFIG.glow, ...raw.glow },
    deeptime: {
      ...DEFAULT_CONFIG.deeptime,
      ...raw.deeptime,
      eras: Array.isArray(raw.deeptime?.eras)
        ? raw.deeptime.eras
        : DEFAULT_CONFIG.deeptime.eras,
    },
    stories: {
      ...DEFAULT_CONFIG.stories,
      ...raw.stories,
      articles: Array.isArray(raw.stories?.articles)
        ? raw.stories.articles
        : DEFAULT_CONFIG.stories.articles,
    },
    visit: {
      ...DEFAULT_CONFIG.visit,
      ...raw.visit,
      protocolSteps: Array.isArray(raw.visit?.protocolSteps)
        ? raw.visit.protocolSteps
        : DEFAULT_CONFIG.visit.protocolSteps,
      infoCards: Array.isArray(raw.visit?.infoCards)
        ? raw.visit.infoCards
        : DEFAULT_CONFIG.visit.infoCards,
    },
    categoriesSection: {
      ...DEFAULT_CONFIG.categoriesSection,
      ...raw.categoriesSection,
    },
    categories: Array.isArray(raw.categories)
      ? raw.categories
      : DEFAULT_CONFIG.categories,
    customSections: Array.isArray(raw.customSections)
      ? raw.customSections
      : DEFAULT_CONFIG.customSections,
    deletedSectionIds: Array.isArray(raw.deletedSectionIds)
      ? raw.deletedSectionIds
      : [],
    media: { ...PHOTOS, ...(raw.media ?? {}) },
    minerals: Array.isArray(raw.minerals)
      ? raw.minerals
      : DEFAULT_CONFIG.minerals,
    inquiries: Array.isArray(raw.inquiries) ? raw.inquiries : [],
    ar: raw.ar,
  };
}

function loadConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return mergeConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_CONFIG;
  }
}

export interface CmsContextValue {
  /** Effective config for rendering — in Arabic mode the base config
   *  with the Arabic string overlay merged over it. */
  config: SiteConfig;
  /** The base (primary-language) config as stored. The Admin Panel
   *  edits this unless its Arabic editing mode is on. */
  rawConfig: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  /** Site display language. */
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Automatic English→Arabic sync: every admin add/edit in the base
   *  language is machine-translated into the Arabic overlay. */
  autoSyncAr: boolean;
  setAutoSyncAr: (on: boolean) => void;
  syncState: SyncState;
  /** Translate every string that still renders as English in Arabic. */
  syncArabicNow: () => void;
  getPhoto: (photoId?: string) => SpecimenPhoto;
  getCategoryColor: (categoryName: string) => string;
  getMineralById: (id: string) => MineralItem | undefined;
  isSectionVisible: (id: SectionId) => boolean;

  // Section order & visibility
  toggleSectionVisibility: (id: SectionId) => void;
  moveSection: (id: SectionId, direction: -1 | 1) => void;

  // Categories CRUD
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string, fallbackName?: string) => void;

  // Media CRUD
  upsertPhoto: (photo: SpecimenPhoto) => void;
  deletePhoto: (id: string) => void;

  // Minerals CRUD
  upsertMineral: (mineral: MineralItem) => void;
  deleteMineral: (id: string) => void;

  // Deep Time CRUD
  upsertEra: (era: EraItem) => void;
  deleteEra: (id: string) => void;
  moveEra: (id: string, dir: -1 | 1) => void;

  // Articles CRUD
  upsertArticle: (article: ArticleItem) => void;
  deleteArticle: (id: string) => void;

  // Inquiries
  submitInquiry: (
    payload: Omit<BuyerInquiry, "id" | "createdAt" | "status">
  ) => BuyerInquiry;
  toggleInquiryStatus: (id: string) => void;
  deleteInquiry: (id: string) => void;

  // Backup / Reset
  importJson: (jsonText: string) => { ok: boolean; error?: string };
  resetAll: () => void;

  // Real backend (Supabase) — all false/null in local-only mode
  backendEnabled: boolean;
  /** Owner auth session; null when signed out or backend is off. */
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(loadConfig);
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY) === "ar" ? "ar" : "en";
    } catch {
      return "en";
    }
  });

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  // Reflect the language on the document: Arabic runs fully RTL.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  /* ————— Real backend (Supabase) —————
     When configured, the published config lives in Postgres: the
     signed-in owner's edits are debounce-saved server-side and every
     visitor loads (and realtime-receives) the same content. Without
     a backend the site stays in localStorage-only mode, untouched. */
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const remoteReadyRef = useRef(false);
  const lastSavedHashRef = useRef<string>("");

  const configHash = useCallback((c: SiteConfig) => {
    try {
      return JSON.stringify({ ...c, inquiries: [] });
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteConfig();
      if (!cancelled && remote && typeof remote === "object") {
        const merged = mergeConfig(remote as Partial<SiteConfig>);
        // An empty/seed row ({}) must not wipe the local defaults.
        if (Object.keys(remote as Record<string, unknown>).length > 0) {
          lastSavedHashRef.current = configHash(merged);
          setConfig(merged);
        }
      }
      remoteReadyRef.current = true;
    })();
    client.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      sessionRef.current = data.session;
      setSession(data.session);
    });
    const { data: sub } = client.auth.onAuthStateChange((_e, next) => {
      sessionRef.current = next;
      setSession(next);
    });
    // Visitors (not signed in) receive the owner's edits live.
    const channel = client
      .channel("site-config-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_config", filter: "id=eq.main" },
        (payload) => {
          if (sessionRef.current) return; // the editor already has it
          const next = (payload.new as { config?: unknown })?.config;
          if (next && typeof next === "object") {
            setConfig(mergeConfig(next as Partial<SiteConfig>));
          }
        }
      )
      .subscribe();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      if (supabase) void supabase.removeChannel(channel);
    };
  }, [configHash]);

  // Debounce-save the owner's edits to the server.
  useEffect(() => {
    if (!supabase || !session || !remoteReadyRef.current) return;
    const hash = configHash(config);
    if (!hash || hash === lastSavedHashRef.current) return;
    const timer = setTimeout(async () => {
      const ok = await saveRemoteConfig(config);
      if (ok) lastSavedHashRef.current = hash;
    }, 1200);
    return () => clearTimeout(timer);
  }, [config, session, configHash]);

  // Owner signed in → load the server-side buyer inbox.
  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteInquiries();
      if (!cancelled && remote) {
        setConfig((prev) => ({ ...prev, inquiries: remote }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const signIn = useCallback(
    (email: string, password: string) => signInOwner(email, password),
    []
  );
  const signOut = useCallback(async () => {
    await signOutOwner();
    sessionRef.current = null;
    setSession(null);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore quota errors in restricted environments */
    }
  }, [config]);

  // Effective config: Arabic = shipped translations of the default
  // content, then the admin's own Arabic edits, over the base config.
  const effectiveConfig = useMemo<SiteConfig>(() => {
    if (lang !== "ar") return config;
    return applyOverlay(applyOverlay(config, DEFAULT_AR), config.ar);
  }, [config, lang]);

  /* ————— Automatic English → Arabic synchronisation —————
     Structural admin changes (add / delete / reorder) already apply to
     Arabic automatically: both languages render from this one base
     config. This watcher covers the wording: whenever human-readable
     strings are added or edited in the base language, the changed
     leaves are machine-translated and written into `config.ar`, so
     the Arabic section shows the same change in the same place.
     Arabic-mode edits touch only `ar`, which the diff ignores, so the
     watcher never overwrites the admin's own translations. */
  const [autoSyncAr, setAutoSyncArState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTOSYNC_STORAGE_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    pending: 0,
    translated: 0,
    fellBack: false,
  });
  const prevConfigRef = useRef<SiteConfig | null>(null);
  const syncRunningRef = useRef(false);
  const syncQueueRef = useRef<ChangedLeaf[]>([]);

  const setAutoSyncAr = useCallback((on: boolean) => {
    setAutoSyncArState(on);
    try {
      localStorage.setItem(AUTOSYNC_STORAGE_KEY, on ? "on" : "off");
    } catch {
      /* ignore */
    }
  }, []);

  const runSyncQueue = useCallback(async () => {
    if (syncRunningRef.current) return;
    syncRunningRef.current = true;
    let translated = 0;
    let fellBack = false;
    try {
      while (syncQueueRef.current.length > 0) {
        const batch = syncQueueRef.current.splice(0, syncQueueRef.current.length);
        setSyncState({
          status: "working",
          pending: batch.length,
          translated,
          fellBack,
        });
        const results: { path: ChangedLeaf["path"]; value: string }[] = [];
        // Gentle concurrency so long specimen stories don't flood the API.
        for (let i = 0; i < batch.length; i += 3) {
          const slice = batch.slice(i, i + 3);
          await Promise.all(
            slice.map(async (leaf) => {
              const ar = await translateEnToAr(leaf.text);
              if (ar) translated += 1;
              else fellBack = true;
              results.push({ path: leaf.path, value: ar ?? leaf.text });
            })
          );
        }
        if (results.length > 0) {
          setConfig((prev) => {
            let ar: unknown = prev.ar;
            for (const r of results) ar = setAtPath(ar, r.path, r.value);
            return { ...prev, ar };
          });
        }
      }
      setSyncState({ status: "done", pending: 0, translated, fellBack });
    } catch {
      setSyncState({ status: "error", pending: 0, translated, fellBack });
    } finally {
      syncRunningRef.current = false;
    }
  }, []);

  useEffect(() => {
    const prev = prevConfigRef.current;
    prevConfigRef.current = config;
    if (!prev || prev === config || !autoSyncAr) return;
    const leaves = collectChangedLeaves(prev, config);
    if (leaves.length === 0 || leaves.length > AUTO_SYNC_MAX_LEAVES) return;
    syncQueueRef.current.push(...leaves);
    void runSyncQueue();
  }, [config, autoSyncAr, runSyncQueue]);

  /** Manual full sync: translate everything still shown in English. */
  const syncArabicNow = useCallback(() => {
    const effectiveAr = applyOverlay(applyOverlay(config, DEFAULT_AR), config.ar);
    const leaves = collectUntranslatedLeaves(config, effectiveAr);
    if (leaves.length === 0) {
      setSyncState({ status: "done", pending: 0, translated: 0, fellBack: false });
      return;
    }
    syncQueueRef.current.push(...leaves);
    void runSyncQueue();
  }, [config, runSyncQueue]);

  const getPhoto = useCallback(
    (photoId?: string): SpecimenPhoto => {
      if (photoId && config.media[photoId]) return config.media[photoId];
      const firstKey = Object.keys(config.media)[0];
      return config.media[firstKey] ?? PHOTOS.amethyst;
    },
    [config.media]
  );

  const getCategoryColor = useCallback(
    (categoryName: string): string => {
      const found = config.categories.find((c) => c.name === categoryName);
      return found?.color ?? "#8fe4df";
    },
    [config.categories]
  );

  const getMineralById = useCallback(
    (id: string) => config.minerals.find((m) => m.id === id),
    [config.minerals]
  );

  const isSectionVisible = useCallback(
    (id: SectionId) =>
      config.sectionsOrder.find((s) => s.id === id)?.visible ?? true,
    [config.sectionsOrder]
  );

  const toggleSectionVisibility = useCallback((id: SectionId) => {
    setConfig((prev) => ({
      ...prev,
      sectionsOrder: prev.sectionsOrder.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
    }));
  }, []);

  const moveSection = useCallback((id: SectionId, direction: -1 | 1) => {
    setConfig((prev) => {
      const idx = prev.sectionsOrder.findIndex((s) => s.id === id);
      const nextIdx = idx + direction;
      if (idx < 0 || nextIdx < 0 || nextIdx >= prev.sectionsOrder.length) {
        return prev;
      }
      const next = [...prev.sectionsOrder];
      [next[idx], next[nextIdx]] = [next[nextIdx], next[idx]];
      return { ...prev, sectionsOrder: next };
    });
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setConfig((prev) => {
      if (prev.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: trimmed,
        color,
      };
      return { ...prev, categories: [...prev.categories, newCat] };
    });
  }, []);

  const updateCategory = useCallback((id: string, name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setConfig((prev) => {
      const existing = prev.categories.find((c) => c.id === id);
      if (!existing) return prev;
      const oldName = existing.name;
      return {
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id ? { ...c, name: trimmed, color } : c
        ),
        minerals:
          oldName !== trimmed
            ? prev.minerals.map((m) =>
                m.category === oldName ? { ...m, category: trimmed } : m
              )
            : prev.minerals,
      };
    });
  }, []);

  const deleteCategory = useCallback((id: string, fallbackName?: string) => {
    setConfig((prev) => {
      const target = prev.categories.find((c) => c.id === id);
      if (!target) return prev;
      const remaining = prev.categories.filter((c) => c.id !== id);
      const fallback = fallbackName || remaining[0]?.name || "Uncategorized";
      return {
        ...prev,
        categories: remaining,
        minerals: prev.minerals.map((m) =>
          m.category === target.name ? { ...m, category: fallback } : m
        ),
      };
    });
  }, []);

  const upsertPhoto = useCallback((photo: SpecimenPhoto) => {
    setConfig((prev) => ({
      ...prev,
      media: { ...prev.media, [photo.id]: photo },
    }));
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setConfig((prev) => {
      const nextMedia = { ...prev.media };
      delete nextMedia[id];
      const fallbackId = Object.keys(nextMedia)[0] || "amethyst";
      return {
        ...prev,
        media: nextMedia,
        minerals: prev.minerals.map((m) =>
          m.photoId === id ? { ...m, photoId: fallbackId } : m
        ),
        deeptime: {
          ...prev.deeptime,
          eras: prev.deeptime.eras.map((e) =>
            e.photoId === id ? { ...e, photoId: undefined } : e
          ),
        },
        stories: {
          ...prev.stories,
          articles: prev.stories.articles.map((a) =>
            a.photoId === id ? { ...a, photoId: fallbackId } : a
          ),
        },
        glow:
          prev.glow.photoId === id
            ? { ...prev.glow, photoId: fallbackId }
            : prev.glow,
        visit:
          prev.visit.tourPhotoId === id
            ? { ...prev.visit, tourPhotoId: fallbackId }
            : prev.visit,
      };
    });
  }, []);

  const upsertMineral = useCallback((mineral: MineralItem) => {
    setConfig((prev) => {
      const exists = prev.minerals.some((m) => m.id === mineral.id);
      return {
        ...prev,
        minerals: exists
          ? prev.minerals.map((m) => (m.id === mineral.id ? mineral : m))
          : [mineral, ...prev.minerals],
      };
    });
  }, []);

  const deleteMineral = useCallback((id: string) => {
    setConfig((prev) => {
      const remaining = prev.minerals.filter((m) => m.id !== id);
      return {
        ...prev,
        minerals: remaining,
        hero:
          prev.hero.featuredSpecimenId === id
            ? { ...prev.hero, featuredSpecimenId: remaining[0]?.id ?? "" }
            : prev.hero,
      };
    });
  }, []);

  const upsertEra = useCallback((era: EraItem) => {
    setConfig((prev) => {
      const exists = prev.deeptime.eras.some((e) => e.id === era.id);
      return {
        ...prev,
        deeptime: {
          ...prev.deeptime,
          eras: exists
            ? prev.deeptime.eras.map((e) => (e.id === era.id ? era : e))
            : [...prev.deeptime.eras, era],
        },
      };
    });
  }, []);

  const deleteEra = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      deeptime: {
        ...prev.deeptime,
        eras: prev.deeptime.eras.filter((e) => e.id !== id),
      },
    }));
  }, []);

  const moveEra = useCallback((id: string, dir: -1 | 1) => {
    setConfig((prev) => {
      const eras = [...prev.deeptime.eras];
      const i = eras.findIndex((e) => e.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= eras.length) return prev;
      [eras[i], eras[j]] = [eras[j], eras[i]];
      return { ...prev, deeptime: { ...prev.deeptime, eras } };
    });
  }, []);

  const upsertArticle = useCallback((article: ArticleItem) => {
    setConfig((prev) => {
      const exists = prev.stories.articles.some((a) => a.id === article.id);
      return {
        ...prev,
        stories: {
          ...prev.stories,
          articles: exists
            ? prev.stories.articles.map((a) => (a.id === article.id ? article : a))
            : [article, ...prev.stories.articles],
        },
      };
    });
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      stories: {
        ...prev.stories,
        articles: prev.stories.articles.filter((a) => a.id !== id),
      },
    }));
  }, []);

  const submitInquiry = useCallback(
    (payload: Omit<BuyerInquiry, "id" | "createdAt" | "status">) => {
      const inquiry: BuyerInquiry = {
        ...payload,
        id: `inq-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "new",
      };
      setConfig((prev) => ({
        ...prev,
        inquiries: [inquiry, ...prev.inquiries],
      }));
      // Real backend: store in Postgres + notify owner (Telegram/email).
      void insertRemoteInquiry(payload);
      return inquiry;
    },
    []
  );

  const toggleInquiryStatus = useCallback((id: string) => {
    setConfig((prev) => {
      const target = prev.inquiries.find((inq) => inq.id === id);
      if (target) {
        void setRemoteInquiryStatus(
          id,
          target.status === "new" ? "replied" : "new"
        );
      }
      return {
        ...prev,
        inquiries: prev.inquiries.map((inq) =>
          inq.id === id
            ? { ...inq, status: inq.status === "new" ? "replied" : "new" }
            : inq
        ),
      };
    });
  }, []);

  const deleteInquiry = useCallback((id: string) => {
    void deleteRemoteInquiry(id);
    setConfig((prev) => ({
      ...prev,
      inquiries: prev.inquiries.filter((inq) => inq.id !== id),
    }));
  }, []);

  const importJson = useCallback((jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      setConfig(mergeConfig(parsed));
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Invalid JSON",
      };
    }
  }, []);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(CMS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setConfig(DEFAULT_CONFIG);
  }, []);

  const value = useMemo<CmsContextValue>(
    () => ({
      config: effectiveConfig,
      rawConfig: config,
      setConfig,
      lang,
      setLang,
      autoSyncAr,
      setAutoSyncAr,
      syncState,
      syncArabicNow,
      getPhoto,
      getCategoryColor,
      getMineralById,
      isSectionVisible,
      toggleSectionVisibility,
      moveSection,
      addCategory,
      updateCategory,
      deleteCategory,
      upsertPhoto,
      deletePhoto,
      upsertMineral,
      deleteMineral,
      upsertEra,
      deleteEra,
      moveEra,
      upsertArticle,
      deleteArticle,
      submitInquiry,
      toggleInquiryStatus,
      deleteInquiry,
      importJson,
      resetAll,
      backendEnabled,
      session,
      signIn,
      signOut,
    }),
    [
      effectiveConfig,
      config,
      lang,
      setLang,
      autoSyncAr,
      setAutoSyncAr,
      syncState,
      syncArabicNow,
      getPhoto,
      getCategoryColor,
      getMineralById,
      isSectionVisible,
      toggleSectionVisibility,
      moveSection,
      addCategory,
      updateCategory,
      deleteCategory,
      upsertPhoto,
      deletePhoto,
      upsertMineral,
      deleteMineral,
      upsertEra,
      deleteEra,
      moveEra,
      upsertArticle,
      deleteArticle,
      submitInquiry,
      toggleInquiryStatus,
      deleteInquiry,
      importJson,
      resetAll,
      session,
      signIn,
      signOut,
    ]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used inside CmsProvider");
  return ctx;
}
