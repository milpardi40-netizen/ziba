import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

const CMS_STORAGE_KEY = "lithos-cms-v2";

function mergeConfig(raw: Partial<SiteConfig> | null | undefined): SiteConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_CONFIG;
  return {
    brand: { ...DEFAULT_CONFIG.brand, ...raw.brand },
    contact: { ...DEFAULT_CONFIG.contact, ...raw.contact },
    sectionsOrder:
      Array.isArray(raw.sectionsOrder) && raw.sectionsOrder.length > 0
        ? raw.sectionsOrder
        : DEFAULT_CONFIG.sectionsOrder,
    hero: { ...DEFAULT_CONFIG.hero, ...raw.hero },
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
    categories: Array.isArray(raw.categories)
      ? raw.categories
      : DEFAULT_CONFIG.categories,
    media: { ...PHOTOS, ...(raw.media ?? {}) },
    minerals: Array.isArray(raw.minerals)
      ? raw.minerals
      : DEFAULT_CONFIG.minerals,
    inquiries: Array.isArray(raw.inquiries) ? raw.inquiries : [],
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
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
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
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(loadConfig);

  useEffect(() => {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore quota errors in restricted environments */
    }
  }, [config]);

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
      return inquiry;
    },
    []
  );

  const toggleInquiryStatus = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      inquiries: prev.inquiries.map((inq) =>
        inq.id === id
          ? { ...inq, status: inq.status === "new" ? "replied" : "new" }
          : inq
      ),
    }));
  }, []);

  const deleteInquiry = useCallback((id: string) => {
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
      config,
      setConfig,
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
    }),
    [
      config,
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
    ]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used inside CmsProvider");
  return ctx;
}
