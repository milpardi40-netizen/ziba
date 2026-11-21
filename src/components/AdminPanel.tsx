import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  Crown,
  Download,
  Eye,
  EyeOff,
  FlaskConical,
  FolderKanban,
  Gem,
  Hourglass,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Newspaper,
  PanelBottom,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ScrollText,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { DEFAULT_AR } from "../data/arabic";
import { applyOverlay, extractStringOverlay, type Lang } from "../data/i18n";
import {
  DEFAULT_CONFIG,
  type ArticleItem,
  type CustomSectionItem,
  type EraItem,
  type FooterSocial,
  type HeaderNavItem,
  type MineralItem,
  type SectionId,
  type SiteConfig,
  type VisitInfoCard,
} from "../data/defaults";
import { getCategoryMeta, slugifyCategory } from "../data/categoryPages";
import { type SpecimenPhoto } from "../data/photography";
import { useCms } from "../data/store";
import { cn } from "../utils/cn";
import { LogoMark } from "./Logo";
import backdropPlate1 from "../assets/backdrops/backdrop-1.jpg";
import backdropPlate2 from "../assets/backdrops/backdrop-2.jpg";
import backdropPlate3 from "../assets/backdrops/backdrop-3.jpg";
import backdropPlate4 from "../assets/backdrops/backdrop-4.jpg";

/** Built-in cinematic plates shown when a hero backdrop slot is empty. */
const BACKDROP_PLATES = [backdropPlate1, backdropPlate2, backdropPlate3, backdropPlate4];

type AdminTab =
  | "hero"
  | "intro"
  | "highlights"
  | "cabinets"
  | "collection"
  | "glow"
  | "deeptime"
  | "stories"
  | "visit"
  | "header"
  | "footer"
  | "overview"
  | "sections"
  | "minerals"
  | "categories"
  | "media"
  | "inquiries";

const TABS: {
  id: AdminTab;
  fa: string;
  en: string;
  icon: typeof Settings;
}[] = [
  { id: "hero", fa: "سکشن هیرو", en: "Hero Section", icon: Sparkles },
  { id: "intro", fa: "مانیفست کیوریتور", en: "Curatorial Manifesto", icon: ScrollText },
  { id: "highlights", fa: "شاهکارهای سالن", en: "Masterworks of the Salon", icon: Crown },
  { id: "cabinets", fa: "کابینت‌ها", en: "The Cabinets", icon: LayoutGrid },
  { id: "collection", fa: "کاتالوگ نمونه‌ها", en: "Catalogue Raisonné", icon: BookOpen },
  { id: "glow", fa: "اتاق درخشش (UV)", en: "Glow Room · UV Lab", icon: FlaskConical },
  { id: "deeptime", fa: "گاه‌شمار زمین", en: "Planetary Chronology", icon: Hourglass },
  { id: "stories", fa: "ژورنال کیوریتور", en: "Curatorial Journal", icon: Newspaper },
  { id: "visit", fa: "بازدید و تماس", en: "Visit & Contact", icon: MapPin },
  { id: "header", fa: "هدر و ناوبری", en: "Header & Navigation", icon: Navigation },
  { id: "footer", fa: "فوتر", en: "Footer", icon: PanelBottom },
  { id: "overview", fa: "تنظیمات کلی و تماس", en: "Brand & Contact", icon: Settings },
  { id: "sections", fa: "مدیریت سکشن‌ها", en: "Sections", icon: Layers },
  { id: "minerals", fa: "نمونه‌ها و کانی‌ها", en: "Specimens", icon: Gem },
  { id: "categories", fa: "دسته‌بندی‌ها", en: "Categories", icon: FolderKanban },
  { id: "media", fa: "عکس‌ها و گالری", en: "Media Library", icon: ImageIcon },
  { id: "inquiries", fa: "پیام‌های خریداران", en: "Buyer Inbox", icon: Mail },
];

async function compressFileToDataUrl(file: File): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        const maxSide = 960;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          const ratio = Math.min(maxSide / width, maxSide / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === "image/png" || file.type === "image/webp";
        const dataUrl = canvas.toDataURL(isPng ? "image/webp" : "image/jpeg", 0.84);
        resolve({ dataUrl, width, height });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-mist">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-edge bg-ink/90 px-3.5 py-2.5 text-sm text-ivory placeholder:text-dusk focus:border-gold focus:outline-none [unicode-bidi:plaintext]";

function PhotoPicker({
  value,
  onChange,
  media,
  label,
}: {
  value?: string;
  onChange: (id: string) => void;
  media: Record<string, SpecimenPhoto>;
  label: string;
}) {
  const photos = Object.values(media);
  const current = value && media[value] ? media[value] : photos[0];
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-mist">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-edge bg-ink/60 p-3">
        {current && (
          <img
            src={current.thumbnail || current.src}
            alt={current.subject}
            className="h-14 w-14 shrink-0 rounded-xl bg-plate object-contain p-1"
          />
        )}
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputCls, "flex-1 [&>option]:bg-surface")}
        >
          {photos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.subject} ({p.id})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function AdminPanel({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
}) {
  const {
    rawConfig,
    setConfig: setBaseConfig,
    autoSyncAr,
    setAutoSyncAr,
    syncState,
    syncArabicNow,
    toggleSectionVisibility,
    moveSection,
    addCategory,
    updateCategory,
    deleteCategory,
    upsertPhoto,
    deletePhoto,
    upsertMineral: upsertMineralBase,
    deleteMineral,
    upsertEra: upsertEraBase,
    deleteEra,
    moveEra,
    upsertArticle: upsertArticleBase,
    deleteArticle,
    toggleInquiryStatus,
    deleteInquiry,
    importJson,
    resetAll,
  } = useCms();

  /* ——— Content language editing mode ———
     "en" edits the base config. "ar" edits the Arabic string overlay:
     every text field shows its Arabic value (shipped translations plus
     the admin's edits), and saves are diffed back into `config.ar` via
     extractStringOverlay — structure, photos, numbers and toggles are
     shared and always live in the base config. */
  const [editLang, setEditLang] = useState<Lang>("en");
  const config: SiteConfig =
    editLang === "ar"
      ? applyOverlay(applyOverlay(rawConfig, DEFAULT_AR), rawConfig.ar)
      : rawConfig;
  const setConfig: React.Dispatch<React.SetStateAction<SiteConfig>> = (action) => {
    if (editLang === "en") {
      setBaseConfig(action);
      return;
    }
    setBaseConfig((prev) => {
      const arPrev = applyOverlay(applyOverlay(prev, DEFAULT_AR), prev.ar);
      const nextFull =
        typeof action === "function"
          ? (action as (p: SiteConfig) => SiteConfig)(arPrev)
          : action;
      const delta = extractStringOverlay(arPrev, nextFull);
      if (!delta) return prev;
      const mergedAr = prev.ar ? applyOverlay(prev.ar, delta) : delta;
      return { ...prev, ar: mergedAr };
    });
  };
  const upsertMineral = (m: MineralItem) => {
    if (editLang === "en") return upsertMineralBase(m);
    setConfig((prev) => ({
      ...prev,
      minerals: prev.minerals.some((x) => x.id === m.id)
        ? prev.minerals.map((x) => (x.id === m.id ? m : x))
        : [m, ...prev.minerals],
    }));
  };
  const upsertEra = (e: EraItem) => {
    if (editLang === "en") return upsertEraBase(e);
    setConfig((prev) => ({
      ...prev,
      deeptime: {
        ...prev.deeptime,
        eras: prev.deeptime.eras.some((x) => x.id === e.id)
          ? prev.deeptime.eras.map((x) => (x.id === e.id ? e : x))
          : [...prev.deeptime.eras, e],
      },
    }));
  };
  const upsertArticle = (a: ArticleItem) => {
    if (editLang === "en") return upsertArticleBase(a);
    setConfig((prev) => ({
      ...prev,
      stories: {
        ...prev.stories,
        articles: prev.stories.articles.some((x) => x.id === a.id)
          ? prev.stories.articles.map((x) => (x.id === a.id ? a : x))
          : [a, ...prev.stories.articles],
      },
    }));
  };

  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [tab, setTab] = useState<AdminTab>("hero");
  const [toast, setToast] = useState<string | null>(null);

  // Selected sub-editors
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [mineralSearch, setMineralSearch] = useState("");
  const [editingMineral, setEditingMineral] = useState<MineralItem | null>(null);
  const [editingEra, setEditingEra] = useState<EraItem | null>(null);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<SpecimenPhoto | null>(null);

  // New Category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#8fe4df");

  // Hero slider — specimen waiting to be added as a slide
  const [newSlideId, setNewSlideId] = useState("");

  // Section builder (add / delete / restore)
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionLayout, setNewSectionLayout] =
    useState<CustomSectionItem["layout"]>("split");
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);

  const missingBuiltins = DEFAULT_CONFIG.sectionsOrder.filter(
    (def) => !config.sectionsOrder.some((s) => s.id === def.id)
  );

  const createCustomSection = () => {
    const title = newSectionTitle.trim() || "New Section";
    const id = `custom-${Date.now()}`;
    const firstPhotoId = Object.keys(config.media)[0] ?? "";
    const item: CustomSectionItem = {
      id,
      label: title,
      overline: "From the Curatorial Desk",
      titlePrefix: title,
      titleHighlight: "in focus",
      subtitle: "Write the standfirst for this section here — what should the visitor feel and learn?",
      body: "Add the main story of this section. Every word, the photograph, the accent colour, the points and the call-to-action below are editable, and the section can be reordered, hidden or deleted like any built-in room of the salon.",
      accent: "#e6b45a",
      photoId: firstPhotoId,
      layout: newSectionLayout,
      points: [
        "First key point — edit or delete me",
        "Second key point — add as many as you need",
      ],
      ctaText: "Explore the collection",
      ctaHref: "#/collection",
    };
    setConfig((p) => ({
      ...p,
      customSections: [...p.customSections, item],
      sectionsOrder: [
        ...p.sectionsOrder,
        { id, label: title, visible: true },
      ],
    }));
    setNewSectionTitle("");
    setActiveSection(id);
    notify(t("سکشن جدید ساخته شد", "New section created — now make it yours below"));
  };

  const deleteSection = (id: string) => {
    setConfig((p) => ({
      ...p,
      sectionsOrder: p.sectionsOrder.filter((s) => s.id !== id),
      // Custom sections lose their content too; built-ins are remembered
      // as deleted so a reload never resurrects them (restore is below).
      customSections: p.customSections.filter((cs) => cs.id !== id),
      deletedSectionIds: id.startsWith("custom-")
        ? p.deletedSectionIds
        : [...new Set([...p.deletedSectionIds, id])],
    }));
    setArmedDeleteId(null);
    if (activeSection === id) {
      setActiveSection(
        config.sectionsOrder.find((s) => s.id !== id)?.id ?? "hero"
      );
    }
    notify(t("سکشن حذف شد", "Section deleted"));
  };

  const restoreBuiltin = (id: string, label: string) => {
    setConfig((p) => ({
      ...p,
      deletedSectionIds: p.deletedSectionIds.filter((d) => d !== id),
      sectionsOrder: [...p.sectionsOrder, { id, label, visible: true }],
    }));
    setActiveSection(id);
    notify(t("سکشن بازگردانده شد", "Section restored"));
  };

  // ── Hero Section tab helpers ──────────────────────────────
  const updateHero = (patch: Partial<typeof config.hero>) =>
    setConfig((p) => ({ ...p, hero: { ...p.hero, ...patch } }));

  const heroSectionEntry = config.sectionsOrder.find((s) => s.id === "hero");

  // ── Curatorial Manifesto (Intro) tab helpers ──────────────
  const updateIntro = (patch: Partial<typeof config.intro>) =>
    setConfig((p) => ({ ...p, intro: { ...p.intro, ...patch } }));

  const introSectionEntry = config.sectionsOrder.find((s) => s.id === "intro");

  // ── Masterworks of the Salon (Highlights) tab helpers ─────
  const updateHighlights = (patch: Partial<typeof config.highlights>) =>
    setConfig((p) => ({ ...p, highlights: { ...p.highlights, ...patch } }));

  const highlightsSectionEntry = config.sectionsOrder.find((s) => s.id === "highlights");

  /** Masterwork specimens in the exact order the site renders them. */
  const masterworks = config.minerals
    .filter((m) => m.highlight)
    .sort((a, b) => a.highlight!.index.localeCompare(b.highlight!.index));

  const renumberMasterworks = (ordered: MineralItem[]) =>
    ordered.forEach((m, i) => {
      const idx = String(i + 1).padStart(2, "0");
      if (m.highlight && m.highlight.index !== idx)
        upsertMineral({ ...m, highlight: { ...m.highlight, index: idx } });
    });

  const moveMasterwork = (id: string, dir: -1 | 1) => {
    const arr = [...masterworks];
    const i = arr.findIndex((m) => m.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    renumberMasterworks(arr);
  };

  const updateMasterwork = (
    m: MineralItem,
    patch: Partial<NonNullable<MineralItem["highlight"]>>
  ) => upsertMineral({ ...m, highlight: { ...m.highlight!, ...patch } });

  const removeMasterwork = (m: MineralItem) => {
    upsertMineral({ ...m, highlight: undefined });
    notify(t("از فهرست شاهکارها حذف شد", "Removed from the masterworks"));
  };

  const [newMasterworkId, setNewMasterworkId] = useState("");

  const addMasterwork = () => {
    const m = config.minerals.find((x) => x.id === newMasterworkId);
    if (!m) return;
    upsertMineral({
      ...m,
      highlight: {
        index: String(masterworks.length + 1).padStart(2, "0"),
        title: "",
        body: "",
      },
    });
    setNewMasterworkId("");
    notify(t("به فهرست شاهکارها اضافه شد — حالا تیتر و متنش را بنویسید", "Added to the masterworks — now write its title and story"));
  };

  // ── The Cabinets (Categories section) tab helpers ─────────
  const updateCabinetsSection = (patch: Partial<typeof config.categoriesSection>) =>
    setConfig((p) => ({ ...p, categoriesSection: { ...p.categoriesSection, ...patch } }));

  const cabinetsSectionEntry = config.sectionsOrder.find((s) => s.id === "categories");

  const moveCabinet = (id: string, dir: -1 | 1) =>
    setConfig((p) => {
      const arr = [...p.categories];
      const i = arr.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, categories: arr };
    });

  const [armedCabinetDeleteId, setArmedCabinetDeleteId] = useState<string | null>(null);

  // ── Catalogue Raisonné (Collection) tab helpers ───────────
  const updateCollection = (patch: Partial<typeof config.collection>) =>
    setConfig((p) => ({ ...p, collection: { ...p.collection, ...patch } }));

  const collectionSectionEntry = config.sectionsOrder.find((s) => s.id === "collection");

  const [armedSpecimenDeleteId, setArmedSpecimenDeleteId] = useState<string | null>(null);

  // ── Glow Room (Photoluminescence Lab) tab helpers ─────────
  const updateGlow = (patch: Partial<typeof config.glow>) =>
    setConfig((p) => ({ ...p, glow: { ...p.glow, ...patch } }));

  const glowSectionEntry = config.sectionsOrder.find((s) => s.id === "glow");

  // Direct upload for the UV stage photograph.
  const glowFileRef = useRef<HTMLInputElement>(null);
  const handleGlowPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { dataUrl, width, height } = await compressFileToDataUrl(file);
      const id = `glow-${Date.now()}`;
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      upsertPhoto({
        id,
        src: dataUrl,
        thumbnail: dataUrl,
        alt: baseName,
        subject: baseName,
        author: "Uploaded by Admin",
        license: "Gallery Archive",
        licenseUrl: "",
        sourceUrl: "",
        changes: "Uploaded via Glow Room tab",
        width,
        height,
      });
      updateGlow({ photoId: id });
      notify(t("عکس صحنه UV آپلود و جایگزین شد", "UV stage photo uploaded and applied"));
    } catch {
      notify(t("خطا در خواندن فایل تصویر", "Failed to read image file"));
    }
  };

  // ── Planetary Chronology (Deep Time) tab helpers ──────────
  const updateDeeptime = (patch: Partial<typeof config.deeptime>) =>
    setConfig((p) => ({ ...p, deeptime: { ...p.deeptime, ...patch } }));

  const deeptimeSectionEntry = config.sectionsOrder.find((s) => s.id === "deeptime");

  // ── Curatorial Journal (Stories) tab helpers ──────────────
  const updateStories = (patch: Partial<typeof config.stories>) =>
    setConfig((p) => ({ ...p, stories: { ...p.stories, ...patch } }));

  const storiesSectionEntry = config.sectionsOrder.find((s) => s.id === "stories");

  // ── Visit & Contact (Private Salon) tab helpers ───────────
  const updateVisit = (patch: Partial<typeof config.visit>) =>
    setConfig((p) => ({ ...p, visit: { ...p.visit, ...patch } }));

  const updateContact = (patch: Partial<typeof config.contact>) =>
    setConfig((p) => ({ ...p, contact: { ...p.contact, ...patch } }));

  const visitSectionEntry = config.sectionsOrder.find((s) => s.id === "visit");

  // Direct upload for the virtual-tour banner photograph.
  const visitFileRef = useRef<HTMLInputElement>(null);
  const handleVisitPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { dataUrl, width, height } = await compressFileToDataUrl(file);
      const id = `visit-${Date.now()}`;
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      upsertPhoto({
        id,
        src: dataUrl,
        thumbnail: dataUrl,
        alt: baseName,
        subject: baseName,
        author: "Uploaded by Admin",
        license: "Gallery Archive",
        licenseUrl: "",
        sourceUrl: "",
        changes: "Uploaded via Visit tab",
        width,
        height,
      });
      updateVisit({ tourPhotoId: id });
      notify(t("عکس بنر تور آپلود و جایگزین شد", "Tour banner photo uploaded and applied"));
    } catch {
      notify(t("خطا در خواندن فایل تصویر", "Failed to read image file"));
    }
  };

  // ── Header & Footer tab helpers ───────────────────────────
  const updateBrand = (patch: Partial<typeof config.brand>) =>
    setConfig((p) => ({ ...p, brand: { ...p.brand, ...patch } }));

  const updateHeader = (patch: Partial<typeof config.header>) =>
    setConfig((p) => ({ ...p, header: { ...p.header, ...patch } }));

  const updateFooter = (patch: Partial<typeof config.footer>) =>
    setConfig((p) => ({ ...p, footer: { ...p.footer, ...patch } }));

  const updateNavItem = (id: string, patch: Partial<HeaderNavItem>) =>
    updateHeader({
      navItems: config.header.navItems.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    });

  const [newNavLabel, setNewNavLabel] = useState("");
  const [newNavHref, setNewNavHref] = useState("#/collection");
  const heroIsExplicitSlides = (config.hero.slideSpecimenIds ?? []).length > 0;
  // The slider the visitor actually sees: explicit list, or the
  // automatic one (featured specimen first, then the next four).
  const heroEffectiveSlideIds = (() => {
    if (heroIsExplicitSlides) return config.hero.slideSpecimenIds;
    const first =
      config.minerals.find((m) => m.id === config.hero.featuredSpecimenId) ??
      config.minerals[0];
    if (!first) return [];
    return [first, ...config.minerals.filter((m) => m.id !== first.id)]
      .slice(0, 5)
      .map((m) => m.id);
  })();

  const setHeroSlides = (ids: string[]) => updateHero({ slideSpecimenIds: ids });

  const addHeroSlide = (id: string) => {
    if (!id) return;
    const base = heroIsExplicitSlides
      ? config.hero.slideSpecimenIds
      : heroEffectiveSlideIds;
    if (base.includes(id)) {
      notify(t("این نمونه در اسلایدر هست", "That specimen is already in the slider"));
      return;
    }
    setHeroSlides([...base, id]);
    setNewSlideId("");
    notify(t("اسلاید اضافه شد", "Slide added"));
  };

  const removeHeroSlide = (id: string) => {
    const base = heroIsExplicitSlides
      ? config.hero.slideSpecimenIds
      : heroEffectiveSlideIds;
    // Removing the last slide returns the hero to automatic mode.
    setHeroSlides(base.filter((s) => s !== id));
  };

  const moveHeroSlide = (index: number, dir: -1 | 1) => {
    const base = [...(heroIsExplicitSlides
      ? config.hero.slideSpecimenIds
      : heroEffectiveSlideIds)];
    const target = index + dir;
    if (target < 0 || target >= base.length) return;
    [base[index], base[target]] = [base[target], base[index]];
    setHeroSlides(base);
  };

  // ── Hero photo uploads ────────────────────────────────────
  // One hidden file input serves every hero photo target: a backdrop
  // slot or a slider specimen. The uploaded image joins the media
  // library, then is wired straight into the hero.
  const heroFileRef = useRef<HTMLInputElement>(null);
  const heroUploadTarget = useRef<
    { kind: "backdrop"; slot: number } | { kind: "specimen"; id: string } | null
  >(null);

  const pickHeroPhoto = (
    target: { kind: "backdrop"; slot: number } | { kind: "specimen"; id: string }
  ) => {
    heroUploadTarget.current = target;
    heroFileRef.current?.click();
  };

  const handleHeroPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = heroUploadTarget.current;
    e.target.value = "";
    if (!file || !target) return;
    try {
      const { dataUrl, width, height } = await compressFileToDataUrl(file);
      const id = `hero-${Date.now()}`;
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      upsertPhoto({
        id,
        src: dataUrl,
        thumbnail: dataUrl,
        alt: baseName,
        subject: baseName,
        author: "Uploaded by Admin",
        license: "Gallery Archive",
        licenseUrl: "",
        sourceUrl: "",
        changes: "Uploaded via Hero tab",
        width,
        height,
      });
      if (target.kind === "backdrop") {
        const next = [...(config.hero.backdropPhotoIds ?? ["", "", "", ""])];
        next[target.slot] = id;
        updateHero({ backdropPhotoIds: next });
        notify(t("پس‌زمینه هیرو آپلود و جایگزین شد", "Hero backdrop uploaded and applied"));
      } else {
        const m = config.minerals.find((x) => x.id === target.id);
        if (m) upsertMineral({ ...m, photoId: id });
        notify(t("عکس نمونه آپلود و جایگزین شد", "Specimen photo uploaded and applied"));
      }
    } catch {
      notify(t("خطا در خواندن فایل تصویر", "Failed to read image file"));
    }
  };

  /** The photo a specimen actually shows (same fallback as the site). */
  const specimenPhoto = (m: MineralItem) =>
    config.media[m.photoId] ?? Object.values(config.media)[0];

  // New Photo by URL form
  const [urlPhotoSubject, setUrlPhotoSubject] = useState("");
  const [urlPhotoSrc, setUrlPhotoSrc] = useState("");
  const [urlPhotoAuthor, setUrlPhotoAuthor] = useState("Gallery Archive");

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  const t = (fa: string, en: string) => (lang === "fa" ? fa : en);
  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const filteredMinerals = useMemo(() => {
    const q = mineralSearch.trim().toLowerCase();
    if (!q) return config.minerals;
    return config.minerals.filter((m) =>
      [m.name, m.catalog, m.category, m.formula, m.locality].join(" ").toLowerCase().includes(q)
    );
  }, [config.minerals, mineralSearch]);

  const unreadCount = config.inquiries.filter((i) => i.status === "new").length;

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, width, height } = await compressFileToDataUrl(file);
      const id = `custom-${Date.now()}`;
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const photo: SpecimenPhoto = {
        id,
        src: dataUrl,
        thumbnail: dataUrl,
        alt: baseName,
        subject: baseName,
        author: "Uploaded by Admin",
        license: "Gallery Archive",
        licenseUrl: "",
        sourceUrl: "",
        changes: "Uploaded via Admin Panel",
        width,
        height,
      };
      upsertPhoto(photo);
      setEditingPhoto(photo);
      notify(t("عکس با موفقیت آپلود و به کتابخانه اضافه شد", "Image uploaded to Media Library"));
    } catch {
      notify(t("خطا در خواندن فایل تصویر", "Failed to read image file"));
    }
    e.target.value = "";
  };

  const handleAddPhotoUrl = () => {
    if (!urlPhotoSrc.trim() || !urlPhotoSubject.trim()) return;
    const id = `url-${Date.now()}`;
    const photo: SpecimenPhoto = {
      id,
      src: urlPhotoSrc.trim(),
      thumbnail: urlPhotoSrc.trim(),
      alt: urlPhotoSubject.trim(),
      subject: urlPhotoSubject.trim(),
      author: urlPhotoAuthor.trim() || "Gallery Archive",
      license: "External Source",
      licenseUrl: "",
      sourceUrl: urlPhotoSrc.trim(),
      changes: "Added by URL via Admin Panel",
      width: 1000,
      height: 1000,
    };
    upsertPhoto(photo);
    setUrlPhotoSrc("");
    setUrlPhotoSubject("");
    notify(t("عکس جدید اضافه شد", "Photo added by URL"));
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lithos-site-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify(t("فایل پشتیبان دانلود شد", "Backup JSON downloaded"));
  };

  const handleImportJson = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importJson(String(reader.result));
      if (res.ok) notify(t("اطلاعات سایت با موفقیت بازیابی شد", "Configuration imported"));
      else notify(t("فایل JSON معتبر نیست", "Invalid JSON file"));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const startNewMineral = () => {
    const firstPhoto = Object.keys(config.media)[0] ?? "amethyst";
    const firstCat = config.categories[0]?.name ?? "Gemstones";
    setEditingMineral({
      id: `mineral-${Date.now()}`,
      catalog: `LTH.${Math.floor(10000 + Math.random() * 89999)}`,
      name: "",
      epithet: "",
      formula: "",
      category: firstCat,
      mohs: 5,
      mohsLabel: "5",
      system: "Cubic",
      luster: "Vitreous",
      locality: "",
      acquired: "2026",
      size: "",
      rarity: 3,
      accent: "#e6b45a",
      photoId: firstPhoto,
      story: "",
      curatorNote: "",
    });
  };

  const startNewEra = () => {
    setEditingEra({
      id: `era-${Date.now()}`,
      age: "100",
      unit: "million years ago",
      title: "",
      body: "",
      minerals: ["Quartz"],
      accent: "#e6b45a",
    });
  };

  const startNewArticle = () => {
    const firstPhoto = Object.keys(config.media)[0] ?? "aquamarine";
    setEditingArticle({
      id: `article-${Date.now()}`,
      tag: "Notes",
      tagColor: "#8fe4df",
      title: "",
      excerpt: "",
      minutes: 5,
      author: config.intro.curatorName,
      role: config.intro.curatorRole,
      photoId: firstPhoto,
      paragraphs: [""],
      pullQuote: "",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex flex-col bg-ink/98 text-ivory backdrop-blur-xl"
          dir={lang === "fa" ? "rtl" : "ltr"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Admin Panel"
        >
          {/* Top Bar */}
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-edge bg-abyss px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 px-1.5">
                <LogoMark className="h-9 w-auto" />
              </span>
              <div>
                <h2 className="font-display text-2xl leading-none text-ivory">
                  {t("پنل مدیریت جامع گالری", "Comprehensive Gallery Admin")}
                </h2>
                <p className="mt-1 text-xs text-dusk">
                  {t(
                    "مدیریت ۱۰۰٪ تمام سکشن‌ها، عکس‌ها، دسته‌بندی‌ها، کانی‌ها و پیام‌های خریداران",
                    "100% control over all sections, photos, categories, specimens, and buyer inquiries"
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {toast && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-malachite/50 bg-malachite/15 px-3.5 py-1.5 text-xs font-bold text-malachite">
                  <Check className="h-3.5 w-3.5" /> {toast}
                </span>
              )}
              <div
                className="flex items-center gap-1 rounded-full border border-edge bg-surface p-1"
                role="group"
                aria-label={t("زبان ویرایش محتوا", "Content editing language")}
              >
                <span className="px-2 font-mono text-[9px] tracking-[0.14em] text-dusk uppercase">
                  {t("محتوا", "Content")}
                </span>
                {(["en", "ar"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setEditLang(l);
                      setEditingMineral(null);
                      setEditingEra(null);
                      setEditingArticle(null);
                    }}
                    aria-pressed={editLang === l}
                    className={
                      editLang === l
                        ? "rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold text-[#1a1206]"
                        : "rounded-full px-3 py-1.5 text-[11px] font-bold text-mist hover:text-ivory"
                    }
                  >
                    {l === "en" ? "EN" : "عربي"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoSyncAr(!autoSyncAr)}
                  aria-pressed={autoSyncAr}
                  title={t(
                    "هر افزودن، حذف یا ویرایش در زبان اصلی، خودکار در بخش عربی همان سکشن هم اعمال و ترجمه می‌شود",
                    "Every add, delete or edit in the primary language is automatically applied and translated in the Arabic version of the same section"
                  )}
                  className={
                    autoSyncAr
                      ? "rounded-full border border-malachite/60 bg-malachite/15 px-3.5 py-2 text-xs font-bold text-malachite"
                      : "rounded-full border border-edge bg-surface px-3.5 py-2 text-xs font-bold text-mist hover:text-ivory"
                  }
                >
                  {t("همگام‌سازی عربی", "AR Sync")}: {autoSyncAr ? t("روشن", "On") : t("خاموش", "Off")}
                </button>
                <button
                  onClick={syncArabicNow}
                  disabled={syncState.status === "working"}
                  title={t(
                    "ترجمه خودکار همه متن‌هایی که هنوز در نسخه عربی انگلیسی نمایش داده می‌شوند",
                    "Machine-translate every string that still renders in English in the Arabic version"
                  )}
                  className="rounded-full border border-edge bg-surface px-3.5 py-2 text-xs font-bold text-mist transition-colors hover:border-gold/60 hover:text-goldbright disabled:cursor-wait disabled:opacity-60"
                >
                  {syncState.status === "working"
                    ? t(`در حال ترجمه… ${syncState.pending}`, `Translating… ${syncState.pending}`)
                    : t("ترجمه موارد ترجمه‌نشده", "Translate untranslated")}
                </button>
              </div>
              <button
                onClick={() => setLang((l) => (l === "fa" ? "en" : "fa"))}
                className="rounded-full border border-edge bg-surface px-3.5 py-2 text-xs font-bold text-mist hover:border-gold/60 hover:text-goldbright"
              >
                {lang === "fa" ? "English UI" : "نمای فارسی"}
              </button>
              <button
                onClick={onLogout}
                className="rounded-full border border-edge bg-surface px-4 py-2 text-xs font-bold text-mist hover:border-red-400/60 hover:text-red-300"
              >
                {t("خروج مدیر", "Admin logout")}
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-bold text-[#1a1206] hover:bg-goldbright"
              >
                <X className="h-4 w-4" />
                {t("بازگشت به سایت", "Back to Site")}
              </button>
            </div>
          </header>

          {editLang === "ar" && (
            <div className="border-b border-gold/40 bg-gold/10 px-4 py-2.5 text-center text-xs font-semibold text-goldbright sm:px-6" dir="rtl">
              وضع تحرير المحتوى العربي — كل الحقول النصية بالعربية الآن وتُحفظ كترجمة فوق المحتوى الأساسي؛ البنية والصور والأرقام مشتركة بين اللغتين.
            </div>
          )}
          {syncState.status !== "idle" && (
            <div
              className={
                syncState.status === "error"
                  ? "border-b border-rhodo/40 bg-rhodo/10 px-4 py-2 text-center text-xs font-semibold text-rhodo sm:px-6"
                  : "border-b border-malachite/40 bg-malachite/10 px-4 py-2 text-center text-xs font-semibold text-malachite sm:px-6"
              }
              role="status"
            >
              {syncState.status === "working" &&
                t(
                  `همگام‌سازی عربی در حال انجام است — ${syncState.pending} متن در صف ترجمه…`,
                  `Arabic sync running — ${syncState.pending} string(s) queued…`
                )}
              {syncState.status === "done" &&
                (syncState.translated > 0
                  ? t(
                      `همگام‌سازی عربی کامل شد — ${syncState.translated} متن ترجمه و در بخش عربی اعمال شد.${syncState.fellBack ? " (برخی متن‌ها به‌دلیل عدم دسترسی به مترجم، موقتاً انگلیسی کپی شدند)" : ""}`,
                      `Arabic sync complete — ${syncState.translated} string(s) translated and applied.${syncState.fellBack ? " (some strings were temporarily copied in English — translator unreachable)" : ""}`
                    )
                  : t(
                      `همه متن‌ها در بخش عربی به‌روز هستند.${syncState.fellBack ? " (مترجم در دسترس نبود؛ تغییرات انگلیسی کپی شدند تا گم نشوند)" : ""}`,
                      `Arabic is fully up to date.${syncState.fellBack ? " (translator unreachable — English was copied so no change is lost)" : ""}`
                    ))}
              {syncState.status === "error" &&
                t(
                  "خطا در همگام‌سازی عربی — تغییرات شما ذخیره شده‌اند و با دکمه «ترجمه موارد ترجمه‌نشده» دوباره تلاش کنید.",
                  "Arabic sync failed — your changes are saved; retry with “Translate untranslated”."
                )}
            </div>
          )}

          {/* Body */}
          <div className="grid flex-1 overflow-hidden lg:grid-cols-[260px_1fr]">
            {/* Sidebar */}
            <aside className="flex gap-1.5 overflow-x-auto border-b border-edge bg-abyss/70 p-3 lg:flex-col lg:overflow-y-auto lg:border-e lg:border-b-0">
              {TABS.map((item) => {
                const active = tab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "flex shrink-0 items-center justify-between gap-2.5 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all lg:w-full",
                      active
                        ? "bg-gold text-[#1a1206] shadow-[0_0_24px_rgba(230,180,90,0.25)]"
                        : "text-mist hover:bg-surface hover:text-ivory"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{lang === "fa" ? item.fa : item.en}</span>
                    </span>
                    {item.id === "inquiries" && unreadCount > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[10px]",
                          active ? "bg-ink text-goldbright" : "bg-rhodo text-ink"
                        )}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </aside>

            {/* Content Area */}
            <div className="overflow-y-auto p-5 sm:p-8">
              <div className="mx-auto max-w-5xl space-y-6">
                {/* 0. HERO SECTION — everything in the hero, 0–100 */}
                {tab === "hero" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل سکشن هیرو", "Hero Section — Full Control")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای اولین صفحه‌ی سایت اینجاست: تیترها، توضیح، دکمه‌ها، اسلایدر نمونه‌ها، آمار، پس‌زمینه‌ها و المان‌های تزئینی. هر چیزی را می‌توانید ویرایش، حذف یا اضافه کنید؛ فیلد متنی را خالی بگذارید تا همان المان از سایت ناپدید شود.",
                              "Everything on the landing hero lives here: headlines, copy, buttons, the specimen slider, statistics, backdrops and decorative elements. Edit, delete or add anything — clearing a text field hides that element on the site."
                            )}
                          </p>
                        </div>
                        {heroSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("hero")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              heroSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {heroSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {heroSectionEntry.visible
                              ? t("هیرو در سایت نمایش داده می‌شود", "Hero is visible on the site")
                              : t("هیرو مخفی است — برای نمایش کلیک کنید", "Hero is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("hero", "Hero — Vernajewel")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("سکشن هیرو حذف شده — بازگردانی", "Hero section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* headline & copy */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیترها و متن‌های اصلی", "Headline & Copy")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("متن نشان بالا (نقطه سبز) — خالی = حذف", "Top Badge — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.hero.badgeText}
                            onChange={(e) => updateHero({ badgeText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("متن نسخه/سال (طلایی) — خالی = حذف", "Edition Label — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.hero.editionText}
                            onChange={(e) => updateHero({ editionText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر خط اول", "Title Line 1")}>
                          <input
                            className={inputCls}
                            value={config.hero.titleLine1}
                            onChange={(e) => updateHero({ titleLine1: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر خط دوم (قسمت ساده)", "Title Line 2 Prefix")}>
                          <input
                            className={inputCls}
                            value={config.hero.titleLine2Prefix}
                            onChange={(e) => updateHero({ titleLine2Prefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("کلمه درخشان تیتر (گرادیان طلایی)", "Highlighted Word (gold gradient)")}>
                          <input
                            className={inputCls}
                            value={config.hero.titleLine2Highlight}
                            onChange={(e) => updateHero({ titleLine2Highlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("نمونه ویژه (شروع اسلایدر خودکار)", "Featured Specimen (automatic slider start)")}>
                          <select
                            className={cn(inputCls, "[&>option]:bg-surface")}
                            value={config.hero.featuredSpecimenId}
                            onChange={(e) => updateHero({ featuredSpecimenId: e.target.value })}
                          >
                            {config.minerals.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.catalog})
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label={t("دکمه اصلی (طلایی)", "Primary CTA (gold button)")}>
                          <input
                            className={inputCls}
                            value={config.hero.primaryCtaText}
                            onChange={(e) => updateHero({ primaryCtaText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("دکمه دوم (تور راهنما)", "Secondary CTA (guided tour)")}>
                          <input
                            className={inputCls}
                            value={config.hero.secondaryCtaText}
                            onChange={(e) => updateHero({ secondaryCtaText: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر", "Description under the title")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.hero.description}
                          onChange={(e) => updateHero({ description: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* specimen slider */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("اسلایدر نمونه‌های ویژه (کارت بزرگ)", "Featured Specimen Slider (big card)")}
                        </h3>
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide uppercase",
                            heroIsExplicitSlides
                              ? "border-gold/50 text-goldbright"
                              : "border-edge text-dusk"
                          )}
                        >
                          {heroIsExplicitSlides
                            ? t("حالت دستی — فهرست شما", "Manual — your list")
                            : t("حالت خودکار — نمونه ویژه + ۴ نمونه بعدی", "Automatic — featured + next four")}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "ترتیب نمایش کارت بزرگ هیرو. اسلاید اضافه یا حذف کنید و با فلش‌ها جابه‌جا کنید؛ حذف آخرین اسلاید، اسلایدر را به حالت خودکار برمی‌گرداند.",
                          "The order of the big hero card. Add or remove slides and reorder with the arrows; removing the last slide returns the slider to automatic mode."
                        )}
                      </p>
                      <div className="space-y-2">
                        {heroEffectiveSlideIds.map((id, idx) => {
                          const m = config.minerals.find((x) => x.id === id);
                          if (!m) return null;
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-3 rounded-2xl border border-edge bg-ink/60 px-4 py-3"
                            >
                              <span className="font-mono text-[10px] text-gold">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ background: m.accent }}
                                aria-hidden
                              />
                              <span className="flex-1 truncate text-sm font-bold text-ivory">
                                {m.name}
                                <span className="ms-2 font-mono text-[10px] font-normal text-dusk">
                                  {m.catalog}
                                </span>
                              </span>
                              <button
                                onClick={() => moveHeroSlide(idx, -1)}
                                disabled={idx === 0}
                                className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                title={t("بالا", "Move up")}
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => moveHeroSlide(idx, 1)}
                                disabled={idx === heroEffectiveSlideIds.length - 1}
                                className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                title={t("پایین", "Move down")}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => removeHeroSlide(id)}
                                className="rounded-lg p-1.5 text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                                title={t("حذف از اسلایدر", "Remove from slider")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                        {heroEffectiveSlideIds.length === 0 && (
                          <p className="rounded-2xl border border-dashed border-edge px-4 py-3 text-xs text-dusk">
                            {t(
                              "هنوز نمونه‌ای وجود ندارد — اول از تب «نمونه‌ها» یک نمونه بسازید.",
                              "No specimens yet — create one from the Specimens tab first."
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          className={cn(inputCls, "max-w-xs flex-1 [&>option]:bg-surface")}
                          value={newSlideId}
                          onChange={(e) => setNewSlideId(e.target.value)}
                        >
                          <option value="">{t("انتخاب نمونه برای افزودن…", "Choose a specimen to add…")}</option>
                          {config.minerals
                            .filter((m) => !heroEffectiveSlideIds.includes(m.id))
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.catalog})
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => addHeroSlide(newSlideId)}
                          disabled={!newSlideId}
                          className="flex items-center gap-1.5 rounded-full border border-gold/50 px-4 py-2 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("افزودن اسلاید", "Add slide")}
                        </button>
                        {heroIsExplicitSlides && (
                          <button
                            onClick={() => setHeroSlides([])}
                            className="flex items-center gap-1.5 rounded-full border border-edge px-4 py-2 text-[11px] font-bold text-mist transition-colors hover:border-gold/60 hover:text-goldbright"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {t("بازگشت به حالت خودکار", "Back to automatic")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* statistics */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-xl text-ivory">
                        {t("آمارهای پایین هیرو", "Hero Statistics")}
                      </h3>
                      {config.hero.stats.map((st, idx) => (
                        <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_90px_70px_1.4fr_auto]">
                          <input
                            type="number"
                            step="0.1"
                            className={inputCls}
                            value={st.value}
                            aria-label={t("عدد", "Value")}
                            onChange={(e) => {
                              const next = [...config.hero.stats];
                              next[idx] = { ...next[idx], value: Number(e.target.value) };
                              updateHero({ stats: next });
                            }}
                          />
                          <input
                            className={inputCls}
                            placeholder={t("پسوند (+)", "Suffix (+)")}
                            value={st.suffix}
                            onChange={(e) => {
                              const next = [...config.hero.stats];
                              next[idx] = { ...next[idx], suffix: e.target.value };
                              updateHero({ stats: next });
                            }}
                          />
                          <input
                            type="number"
                            min={0}
                            max={3}
                            className={inputCls}
                            placeholder={t("اعشار", "Decimals")}
                            value={st.decimals ?? 0}
                            aria-label={t("تعداد رقم اعشار", "Decimal places")}
                            onChange={(e) => {
                              const next = [...config.hero.stats];
                              next[idx] = { ...next[idx], decimals: Number(e.target.value) };
                              updateHero({ stats: next });
                            }}
                          />
                          <input
                            className={inputCls}
                            placeholder={t("برچسب آمار", "Label")}
                            value={st.label}
                            onChange={(e) => {
                              const next = [...config.hero.stats];
                              next[idx] = { ...next[idx], label: e.target.value };
                              updateHero({ stats: next });
                            }}
                          />
                          <button
                            onClick={() =>
                              updateHero({ stats: config.hero.stats.filter((_, j) => j !== idx) })
                            }
                            className="rounded-xl border border-edge px-2.5 text-dusk transition-colors hover:border-rhodo/60 hover:text-rhodo"
                            aria-label={t("حذف آمار", "Delete statistic")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          updateHero({
                            stats: [...config.hero.stats, { value: 100, suffix: "+", label: "New statistic" }],
                          })
                        }
                        className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                      >
                        <Plus className="h-3 w-3" /> {t("افزودن آمار", "Add statistic")}
                      </button>
                    </div>

                    {/* hero photos — visual manager */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-6">
                      <input
                        ref={heroFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeroPhotoUpload}
                      />
                      <div>
                        <h3 className="font-display text-xl text-ivory">
                          {t("مدیریت عکس‌های هیرو", "Hero Photos")}
                        </h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-dusk">
                          {t(
                            "همه‌ی عکس‌هایی که بازدیدکننده در هیرو می‌بیند اینجاست: پس‌زمینه‌های سینمایی و عکس نمونه‌های اسلایدر. برای هرکدام می‌توانید عکس تازه آپلود کنید، از کتابخانه انتخاب کنید یا حذفش کنید. عکس‌های آپلودی خودکار به کتابخانه رسانه هم اضافه می‌شوند.",
                            "Every photograph the visitor sees in the hero lives here: the cinematic backdrops and the slider specimen photos. Upload a fresh image, pick one from the library, or remove it. Uploads are also added to the Media Library automatically."
                          )}
                        </p>
                      </div>

                      {/* backdrop slots */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold tracking-wide text-gold uppercase">
                          {t("پس‌زمینه‌های سینمایی (۴ اسلات چرخان)", "Cinematic Backdrops (4 rotating slots)")}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {[0, 1, 2, 3].map((slot) => {
                            const customId = config.hero.backdropPhotoIds?.[slot] ?? "";
                            const custom = customId ? config.media[customId] : undefined;
                            return (
                              <div
                                key={slot}
                                className="overflow-hidden rounded-2xl border border-edge bg-ink/60"
                              >
                                <div className="relative">
                                  <img
                                    src={custom?.src ?? BACKDROP_PLATES[slot]}
                                    alt={custom?.alt ?? `Backdrop plate ${slot + 1}`}
                                    className="h-36 w-full object-cover"
                                  />
                                  <span className="absolute top-2.5 right-2.5 rounded-full bg-abyss/85 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-ivory uppercase backdrop-blur-sm">
                                    {t(`اسلات ${slot + 1}`, `Plate ${slot + 1}`)}
                                  </span>
                                  <span
                                    className={cn(
                                      "absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[9px] font-bold backdrop-blur-sm",
                                      custom
                                        ? "bg-gold/90 text-ink"
                                        : "bg-abyss/85 text-mist"
                                    )}
                                  >
                                    {custom
                                      ? t("عکس سفارشی شما", "Your photo")
                                      : t("پیش‌فرض داخلی", "Built-in plate")}
                                  </span>
                                </div>
                                <div className="space-y-2 p-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => pickHeroPhoto({ kind: "backdrop", slot })}
                                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold px-3 py-2 text-[11px] font-bold text-ink transition-colors hover:bg-goldbright"
                                    >
                                      <Upload className="h-3.5 w-3.5" />
                                      {t("آپلود عکس جدید", "Upload new photo")}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const next = [
                                          ...(config.hero.backdropPhotoIds ?? ["", "", "", ""]),
                                        ];
                                        next[slot] = "";
                                        updateHero({ backdropPhotoIds: next });
                                        notify(
                                          t("عکس اسلات حذف شد — پیش‌فرض داخلی برگشت", "Slot photo removed — built-in plate restored")
                                        );
                                      }}
                                      disabled={!customId}
                                      className="flex items-center gap-1.5 rounded-xl border border-edge px-3 py-2 text-[11px] font-bold text-dusk transition-colors hover:border-rhodo/60 hover:text-rhodo disabled:opacity-35"
                                      title={t("حذف عکس از هیرو", "Remove photo from hero")}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      {t("حذف", "Delete")}
                                    </button>
                                  </div>
                                  <select
                                    className={cn(inputCls, "w-full [&>option]:bg-surface")}
                                    value={customId}
                                    onChange={(e) => {
                                      const next = [
                                        ...(config.hero.backdropPhotoIds ?? ["", "", "", ""]),
                                      ];
                                      next[slot] = e.target.value;
                                      updateHero({ backdropPhotoIds: next });
                                    }}
                                    aria-label={t("انتخاب از کتابخانه", "Pick from library")}
                                  >
                                    <option value="">{t("پیش‌فرض داخلی گالری", "Built-in gallery plate")}</option>
                                    {Object.values(config.media).map((ph) => (
                                      <option key={ph.id} value={ph.id}>
                                        {ph.subject} ({ph.id})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* slider specimen photos */}
                      <div className="space-y-3 border-t border-edge/60 pt-5">
                        <div className="text-xs font-bold tracking-wide text-gold uppercase">
                          {t("عکس نمونه‌های اسلایدر (کارت بزرگ)", "Slider Specimen Photos (big card)")}
                        </div>
                        <p className="text-[11px] leading-relaxed text-dusk">
                          {t(
                            "عکس هر نمونه را همین‌جا عوض کنید — آپلود تازه یا انتخاب از کتابخانه. توجه: عکس نمونه در کل سایت (کالکشن، دسته‌بندی‌ها و…) همان است، پس تغییرش همه‌جا دیده می‌شود. برای حذف یک عکس از هیرو، اسلایدش را از کارت «اسلایدر نمونه‌های ویژه» در بالا حذف کنید.",
                            "Change each specimen's photo right here — a fresh upload or a library pick. Note: a specimen's photo is the same across the whole site (collection, categories…), so the change shows everywhere. To remove a photo from the hero, delete its slide in the slider card above."
                          )}
                        </p>
                        <div className="space-y-2">
                          {heroEffectiveSlideIds.map((id, idx) => {
                            const m = config.minerals.find((x) => x.id === id);
                            if (!m) return null;
                            const ph = specimenPhoto(m);
                            return (
                              <div
                                key={id}
                                className="flex flex-wrap items-center gap-3 rounded-2xl border border-edge bg-ink/60 px-3 py-2.5"
                              >
                                {ph && (
                                  <img
                                    src={ph.thumbnail || ph.src}
                                    alt={ph.alt}
                                    className="h-14 w-14 shrink-0 rounded-xl bg-plate object-cover"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-bold text-ivory">
                                    <span className="me-2 font-mono text-[10px] text-gold">
                                      {String(idx + 1).padStart(2, "0")}
                                    </span>
                                    {m.name}
                                  </div>
                                  <div className="truncate font-mono text-[10px] text-dusk">
                                    {ph ? `${ph.subject} (${ph.id})` : m.catalog}
                                  </div>
                                </div>
                                <button
                                  onClick={() => pickHeroPhoto({ kind: "specimen", id: m.id })}
                                  className="flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[11px] font-bold text-ink transition-colors hover:bg-goldbright"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                  {t("آپلود عکس", "Upload photo")}
                                </button>
                                <select
                                  className={cn(inputCls, "w-44 [&>option]:bg-surface")}
                                  value={config.media[m.photoId] ? m.photoId : ""}
                                  onChange={(e) => {
                                    if (e.target.value) upsertMineral({ ...m, photoId: e.target.value });
                                  }}
                                  aria-label={t("انتخاب از کتابخانه", "Pick from library")}
                                >
                                  <option value="">{t("از کتابخانه…", "From library…")}</option>
                                  {Object.values(config.media).map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.subject} ({p.id})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                          {heroEffectiveSlideIds.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-edge px-4 py-3 text-xs text-dusk">
                              {t(
                                "اسلایدر خالی است — اول از کارت اسلایدر در بالا یک نمونه اضافه کنید.",
                                "The slider is empty — add a specimen from the slider card above first."
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* decorative elements */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("المان‌های تزئینی هیرو", "Hero Decorative Elements")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("متن دور مهر چرخان (بعد از نام برند)", "Rotating seal text (after brand name)")}>
                          <input
                            className={inputCls}
                            value={config.hero.sealText}
                            onChange={(e) => updateHero({ sealText: e.target.value })}
                          />
                        </Field>
                        <div className="space-y-3 pt-1">
                          <label className="flex items-center gap-3 text-sm font-semibold text-ivory">
                            <input
                              type="checkbox"
                              checked={config.hero.showSeal}
                              onChange={(e) => updateHero({ showSeal: e.target.checked })}
                              className="h-4 w-4 accent-gold"
                            />
                            {t("نمایش مهر چرخان موزه (لوگوی طلایی)", "Show rotating museum seal (gold logo)")}
                          </label>
                          <label className="flex items-center gap-3 text-sm font-semibold text-ivory">
                            <input
                              type="checkbox"
                              checked={config.hero.showOpening}
                              onChange={(e) => updateHero({ showOpening: e.target.checked })}
                              className="h-4 w-4 accent-gold"
                            />
                            {t("نمایش کارت افتتاحیه (نام برند هنگام ورود)", "Show opening title card (brand name on load)")}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* ticker */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-xl text-ivory">
                        {t("نوار متحرک پایین هیرو", "Bottom Ticker Marquee")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("عنوان نوار (با شمارش خودکار نمونه‌ها)", "Ticker label (specimen count is automatic)")}>
                          <input
                            className={inputCls}
                            value={config.hero.tickerLabel}
                            onChange={(e) => updateHero({ tickerLabel: e.target.value })}
                          />
                        </Field>
                        <label className="flex items-center gap-3 pt-6 text-sm font-semibold text-ivory">
                          <input
                            type="checkbox"
                            checked={config.hero.showTicker}
                            onChange={(e) => updateHero({ showTicker: e.target.checked })}
                            className="h-4 w-4 accent-gold"
                          />
                          {t("نمایش نوار متحرک پایین هیرو", "Show bottom ticker")}
                        </label>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "آیتم‌های نوار از نام همه‌ی نمونه‌های کلکسیون به‌صورت خودکار ساخته می‌شوند؛ برای تغییرشان از تب «نمونه‌ها» نام کانی‌ها را ویرایش کنید.",
                          "Ticker items are built automatically from every specimen name in the collection; edit specimen names in the Specimens tab to change them."
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* 0b. CURATORIAL MANIFESTO (INTRO) — everything, 0–100 */}
                {tab === "intro" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل مانیفست کیوریتور (01 / 06)", "Curatorial Manifesto — Full Control (01 / 06)")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای سکشن «مانیفست کیوریتور» اینجاست: نقل‌قول بزرگ، امضای کیوریتور، پاراگراف‌ها، کاشی‌های آماری و بنر مشاوره خصوصی. هر المان را ویرایش کنید، با خالی‌گذاشتن فیلد حذفش کنید، یا از کلیدهای نمایش/مخفی استفاده کنید.",
                              "Everything in the Curatorial Manifesto section lives here: the big quote, the curator signature, paragraphs, stat tiles and the private-consultation banner. Edit anything, clear a field to hide it, or use the visibility switches."
                            )}
                          </p>
                        </div>
                        {introSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("intro")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              introSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {introSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {introSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("intro", "Curatorial Manifesto")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* header + big quote */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("سربرگ و نقل‌قول بزرگ", "Header & Big Quote")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره فصل (مثل 01 / 06) — خالی = حذف", "Chapter (e.g. 01 / 06) — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.intro.chapter}
                            onChange={(e) => updateIntro({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان بالای نقل‌قول (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.intro.overline}
                            onChange={(e) => updateIntro({ overline: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("شروع نقل‌قول", "Quote — opening")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.intro.quotePrefix}
                          onChange={(e) => updateIntro({ quotePrefix: e.target.value })}
                        />
                      </Field>
                      <Field label={t("قسمت رنگی نقل‌قول (گرادیان سبز-فیروزه‌ای)", "Quote — highlighted part (green-aqua gradient)")}>
                        <input
                          className={inputCls}
                          value={config.intro.quoteHighlight}
                          onChange={(e) => updateIntro({ quoteHighlight: e.target.value })}
                        />
                      </Field>
                      <Field label={t("ادامه و پایان نقل‌قول", "Quote — closing")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.intro.quoteSuffix}
                          onChange={(e) => updateIntro({ quoteSuffix: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* curator signature */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("امضای کیوریتور (زیر نقل‌قول)", "Curator Signature (under the quote)")}
                        </h3>
                        <label className="flex items-center gap-3 text-sm font-semibold text-ivory">
                          <input
                            type="checkbox"
                            checked={config.intro.showCurator}
                            onChange={(e) => updateIntro({ showCurator: e.target.checked })}
                            className="h-4 w-4 accent-gold"
                          />
                          {t("نمایش امضای کیوریتور", "Show curator signature")}
                        </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label={t("حروف اول (داخل دایره طلایی)", "Initials (gold circle)")}>
                          <input
                            className={inputCls}
                            value={config.intro.curatorInitials}
                            onChange={(e) => updateIntro({ curatorInitials: e.target.value })}
                          />
                        </Field>
                        <Field label={t("نام کیوریتور — خالی = حذف کل امضا", "Curator name — empty removes the signature")}>
                          <input
                            className={inputCls}
                            value={config.intro.curatorName}
                            onChange={(e) => updateIntro({ curatorName: e.target.value })}
                          />
                        </Field>
                        <Field label={t("سمت کیوریتور", "Curator role")}>
                          <input
                            className={inputCls}
                            value={config.intro.curatorRole}
                            onChange={(e) => updateIntro({ curatorRole: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>

                    {/* paragraphs */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("متن‌های اصلی (ستون راست)", "Main Copy (right column)")}
                      </h3>
                      <Field label={t("پاراگراف اول (بزرگ‌تر) — خالی = حذف", "Paragraph 1 (lead) — empty hides it")}>
                        <textarea
                          rows={4}
                          className={inputCls}
                          value={config.intro.paragraph1}
                          onChange={(e) => updateIntro({ paragraph1: e.target.value })}
                        />
                      </Field>
                      <Field label={t("پاراگراف دوم — خالی = حذف", "Paragraph 2 — empty hides it")}>
                        <textarea
                          rows={4}
                          className={inputCls}
                          value={config.intro.paragraph2}
                          onChange={(e) => updateIntro({ paragraph2: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* stat tiles */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-xl text-ivory">
                        {t("کاشی‌های آماری (زیر پاراگراف‌ها)", "Stat Tiles (under the paragraphs)")}
                      </h3>
                      {config.intro.tiles.map((tl, idx) => (
                        <div key={idx} className="grid gap-2 sm:grid-cols-[130px_1fr_64px_auto]">
                          <input
                            className={inputCls}
                            placeholder={t("مقدار", "Value")}
                            value={tl.value}
                            onChange={(e) => {
                              const next = [...config.intro.tiles];
                              next[idx] = { ...next[idx], value: e.target.value };
                              updateIntro({ tiles: next });
                            }}
                          />
                          <input
                            className={inputCls}
                            placeholder={t("برچسب", "Label")}
                            value={tl.label}
                            onChange={(e) => {
                              const next = [...config.intro.tiles];
                              next[idx] = { ...next[idx], label: e.target.value };
                              updateIntro({ tiles: next });
                            }}
                          />
                          <input
                            type="color"
                            className="h-10 w-full cursor-pointer rounded-xl border border-edge bg-ink p-1"
                            value={tl.accent}
                            aria-label={t("رنگ مقدار", "Value colour")}
                            onChange={(e) => {
                              const next = [...config.intro.tiles];
                              next[idx] = { ...next[idx], accent: e.target.value };
                              updateIntro({ tiles: next });
                            }}
                          />
                          <button
                            onClick={() =>
                              updateIntro({ tiles: config.intro.tiles.filter((_, j) => j !== idx) })
                            }
                            className="rounded-xl border border-edge px-2.5 text-dusk transition-colors hover:border-rhodo/60 hover:text-rhodo"
                            aria-label={t("حذف کاشی", "Delete tile")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          updateIntro({
                            tiles: [
                              ...config.intro.tiles,
                              { value: "100%", label: "New tile", accent: "#e6b45a" },
                            ],
                          })
                        }
                        className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                      >
                        <Plus className="h-3 w-3" /> {t("افزودن کاشی", "Add tile")}
                      </button>
                      {config.intro.tiles.length === 0 && (
                        <p className="text-[11px] text-dusk">
                          {t("همه کاشی‌ها حذف شده‌اند — ردیف کاشی‌ها در سایت نمایش داده نمی‌شود.", "All tiles are deleted — the tile row will not appear on the site.")}
                        </p>
                      )}
                    </div>

                    {/* consultation banner */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("بنر مشاوره خصوصی (پایین سکشن)", "Private Consultation Banner (bottom of section)")}
                        </h3>
                        <label className="flex items-center gap-3 text-sm font-semibold text-ivory">
                          <input
                            type="checkbox"
                            checked={config.intro.showBanner}
                            onChange={(e) => updateIntro({ showBanner: e.target.checked })}
                            className="h-4 w-4 accent-gold"
                          />
                          {t("نمایش بنر مشاوره", "Show consultation banner")}
                        </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("برچسب بالای بنر (Overline)", "Banner overline")}>
                          <input
                            className={inputCls}
                            value={config.intro.pubOverline}
                            onChange={(e) => updateIntro({ pubOverline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر بنر (قسمت ساده)", "Banner title — opening")}>
                          <input
                            className={inputCls}
                            value={config.intro.pubTitlePrefix}
                            onChange={(e) => updateIntro({ pubTitlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر بنر (قسمت طلایی)", "Banner title — gold part")}>
                          <input
                            className={inputCls}
                            value={config.intro.pubTitleHighlight}
                            onChange={(e) => updateIntro({ pubTitleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("متن دکمه بنر", "Banner button text")}>
                          <input
                            className={inputCls}
                            value={config.intro.pubButtonText}
                            onChange={(e) => updateIntro({ pubButtonText: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیحات بنر", "Banner description")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.intro.pubDescription}
                          onChange={(e) => updateIntro({ pubDescription: e.target.value })}
                        />
                      </Field>
                      <Field label={t("مقصد دکمه بنر — #visit یعنی اسکرول به سکشن بازدید، #/contact یعنی صفحه تماس", "Button destination — #visit scrolls to the visit section, #/contact opens the contact page")}>
                        <input
                          className={inputCls}
                          value={config.intro.pubButtonHref}
                          placeholder="#visit"
                          onChange={(e) => updateIntro({ pubButtonHref: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* 0c. MASTERWORKS OF THE SALON (HIGHLIGHTS) — everything, 0–100 */}
                {tab === "highlights" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل شاهکارهای سالن", "Masterworks of the Salon — Full Control")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای سکشن «شاهکارهای سالن» اینجاست: تیتر سکشن و فهرست شاهکارها. هر نمونه‌ای را به شاهکار تبدیل کنید، تیتر و داستانش را بنویسید، جابه‌جا کنید یا از فهرست بردارید.",
                              "Everything in the Masterworks of the Salon section lives here: the section heading and the masterwork list. Promote any specimen to a masterwork, write its title and story, reorder it, or remove it."
                            )}
                          </p>
                        </div>
                        {highlightsSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("highlights")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              highlightsSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {highlightsSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {highlightsSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("highlights", "Masterwork Highlights")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* section heading */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیتر سکشن", "Section Heading")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره فصل — خالی = حذف", "Chapter — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.highlights.chapter}
                            onChange={(e) => updateHighlights({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان کوچک بالا (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.highlights.overline}
                            onChange={(e) => updateHighlights({ overline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت ساده)", "Title — opening")}>
                          <input
                            className={inputCls}
                            value={config.highlights.titlePrefix}
                            onChange={(e) => updateHighlights({ titlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت رنگی)", "Title — coloured part")}>
                          <input
                            className={inputCls}
                            value={config.highlights.titleHighlight}
                            onChange={(e) => updateHighlights({ titleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("رنگ لهجه سکشن", "Section accent colour")}>
                          <span className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.highlights.accent}
                              onChange={(e) => updateHighlights({ accent: e.target.value })}
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                            />
                            <input
                              className={inputCls}
                              value={config.highlights.accent}
                              onChange={(e) => updateHighlights({ accent: e.target.value })}
                            />
                          </span>
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر — خالی = حذف", "Subtitle — empty hides it")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.highlights.subtitle}
                          onChange={(e) => updateHighlights({ subtitle: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* masterworks manager */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("فهرست شاهکارها", "The Masterworks")}
                        </h3>
                        <span className="rounded-full border border-edge px-3 py-1 font-mono text-[10px] tracking-wide text-dusk uppercase">
                          {masterworks.length} {t("شاهکار", "masterworks")}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "ترتیب نمایش با شماره‌های ۰۱، ۰۲، … مشخص می‌شود و با فلش‌ها خودکار بازشماری می‌شود. نام، عکس، فرمول و محله‌ی هر نمونه از تب «نمونه‌ها» ویرایش می‌شود؛ اینجا تیتر نمایشی و داستان اختصاصی شاهکار را می‌نویسید.",
                          "Display order follows the 01, 02, … numbers and is renumbered automatically with the arrows. Name, photo, formula and locality live in the Specimens tab; here you write the masterwork's display title and its exclusive story."
                        )}
                      </p>
                      {masterworks.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-rhodo/40 bg-rhodo/5 px-4 py-3 text-xs text-rhodo">
                          {t(
                            "هیچ شاهکاری انتخاب نشده — تا وقتی شاهکاری نباشد، این سکشن در سایت نمایش داده نمی‌شود. از پایین یک نمونه اضافه کنید.",
                            "No masterworks selected — the section stays hidden on the site until you add one below."
                          )}
                        </p>
                      )}
                      <div className="space-y-3">
                        {masterworks.map((m, i) => {
                          const ph = specimenPhoto(m);
                          return (
                            <div
                              key={m.id}
                              className="space-y-3 rounded-2xl border border-edge bg-ink/60 p-4"
                            >
                              <div className="flex flex-wrap items-center gap-3">
                                {ph && (
                                  <img
                                    src={ph.thumbnail || ph.src}
                                    alt={ph.alt}
                                    className="h-14 w-14 shrink-0 rounded-xl bg-plate object-cover"
                                  />
                                )}
                                <span
                                  className="font-display text-3xl font-light italic"
                                  style={{ color: `${m.accent}88` }}
                                >
                                  {m.highlight!.index}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-bold text-ivory">{m.name}</div>
                                  <div className="truncate font-mono text-[10px] text-dusk">
                                    {m.catalog} · {m.locality}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveMasterwork(m.id, -1)}
                                    disabled={i === 0}
                                    className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                    title={t("بالا", "Move up")}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => moveMasterwork(m.id, 1)}
                                    disabled={i === masterworks.length - 1}
                                    className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                    title={t("پایین", "Move down")}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => removeMasterwork(m)}
                                    className="rounded-lg p-1.5 text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                                    title={t("حذف از شاهکارها (خود نمونه پاک نمی‌شود)", "Remove from masterworks (the specimen itself is kept)")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-[110px_1fr]">
                                <Field label={t("شماره نمایشی", "Display №")}>
                                  <input
                                    className={inputCls}
                                    value={m.highlight!.index}
                                    onChange={(e) => updateMasterwork(m, { index: e.target.value })}
                                  />
                                </Field>
                                <Field label={t("تیتر نمایشی شاهکار (کنار نام نمونه، رنگی)", "Masterwork display title (beside the name, coloured)")}>
                                  <input
                                    className={inputCls}
                                    value={m.highlight!.title}
                                    placeholder={t("مثل: تاج یاقوتی بورما", "e.g. The Ruby Crown of Burma")}
                                    onChange={(e) => updateMasterwork(m, { title: e.target.value })}
                                  />
                                </Field>
                              </div>
                              <Field label={t("داستان شاهکار (پاراگراف اختصاصی این سکشن)", "Masterwork story (this section's exclusive paragraph)")}>
                                <textarea
                                  rows={3}
                                  className={inputCls}
                                  value={m.highlight!.body}
                                  onChange={(e) => updateMasterwork(m, { body: e.target.value })}
                                />
                              </Field>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 border-t border-edge/60 pt-4">
                        <select
                          className={cn(inputCls, "max-w-xs flex-1 [&>option]:bg-surface")}
                          value={newMasterworkId}
                          onChange={(e) => setNewMasterworkId(e.target.value)}
                        >
                          <option value="">{t("انتخاب نمونه برای شاهکار شدن…", "Choose a specimen to promote…")}</option>
                          {config.minerals
                            .filter((m) => !m.highlight)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.catalog})
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={addMasterwork}
                          disabled={!newMasterworkId}
                          className="flex items-center gap-1.5 rounded-full border border-gold/50 px-4 py-2 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("افزودن شاهکار", "Add masterwork")}
                        </button>
                        <button
                          onClick={() => setTab("minerals")}
                          className="rounded-full border border-edge px-4 py-2 text-[11px] font-bold text-mist transition-colors hover:border-gold/60 hover:text-goldbright"
                        >
                          {t("ویرایش خود نمونه‌ها →", "Edit the specimens themselves →")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 0d. THE CABINETS (CATEGORIES SECTION) — everything, 0–100 */}
                {tab === "cabinets" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل کابینت‌ها (The Cabinets)", "The Cabinets — Full Control")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای سکشن «کابینت‌ها» در صفحه اصلی اینجاست: تیتر سکشن و خود کارت‌های کابینت. کابینت تازه بسازید، اسم و رنگش را عوض کنید، جابه‌جا کنید یا حذفش کنید — هر تغییری هم در سکشن صفحه اصلی و هم در صفحه اختصاصی همان کابینت دیده می‌شود.",
                              "Everything in the home-page Cabinets section lives here: the section heading and the cabinet cards themselves. Create a cabinet, rename or recolour it, reorder it, or delete it — every change shows both in the home section and on that cabinet's own page."
                            )}
                          </p>
                        </div>
                        {cabinetsSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("categories")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              cabinetsSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {cabinetsSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {cabinetsSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("categories", "The Cabinets (Category Pages)")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* section heading */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیتر سکشن", "Section Heading")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("نشان کوچک (Chapter) — خالی = حذف", "Chapter badge — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.categoriesSection.chapter}
                            onChange={(e) => updateCabinetsSection({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان کوچک بالا (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.categoriesSection.overline}
                            onChange={(e) => updateCabinetsSection({ overline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت ساده) — {count} یعنی تعداد کابینت‌ها", "Title opening — {count} inserts the cabinet count")}>
                          <input
                            className={inputCls}
                            value={config.categoriesSection.titlePrefix}
                            onChange={(e) => updateCabinetsSection({ titlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت رنگی) — {count} یعنی تعداد کابینت‌ها", "Title coloured part — {count} inserts the cabinet count")}>
                          <input
                            className={inputCls}
                            value={config.categoriesSection.titleHighlight}
                            onChange={(e) => updateCabinetsSection({ titleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("رنگ لهجه سکشن", "Section accent colour")}>
                          <span className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.categoriesSection.accent}
                              onChange={(e) => updateCabinetsSection({ accent: e.target.value })}
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                            />
                            <input
                              className={inputCls}
                              value={config.categoriesSection.accent}
                              onChange={(e) => updateCabinetsSection({ accent: e.target.value })}
                            />
                          </span>
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر — خالی = حذف", "Subtitle — empty hides it")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.categoriesSection.subtitle}
                          onChange={(e) => updateCabinetsSection({ subtitle: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* cabinets manager */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("کابینت‌ها (کارت‌های سکشن)", "The Cabinets (section cards)")}
                        </h3>
                        <span className="rounded-full border border-edge px-3 py-1 font-mono text-[10px] tracking-wide text-dusk uppercase">
                          {config.categories.length} {t("کابینت", "cabinets")}
                        </span>
                      </div>

                      {/* add cabinet */}
                      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-4">
                        <input
                          className={cn(inputCls, "max-w-xs flex-1")}
                          placeholder={t("نام کابینت جدید…", "New cabinet name…")}
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                        />
                        <input
                          type="color"
                          className="h-11 w-14 cursor-pointer rounded-xl border border-edge bg-ink p-1"
                          value={newCatColor}
                          onChange={(e) => setNewCatColor(e.target.value)}
                          aria-label={t("رنگ کابینت", "Cabinet colour")}
                        />
                        <button
                          onClick={() => {
                            if (!newCatName.trim()) return;
                            addCategory(newCatName, newCatColor);
                            setNewCatName("");
                            notify(t("کابینت تازه ساخته شد — حالا از تب نمونه‌ها به آن نمونه بدهید تا در سایت ظاهر شود", "New cabinet created — give it specimens from the Specimens tab so it appears on the site"));
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-bold text-[#1a1206] transition-colors hover:bg-goldbright"
                        >
                          <Plus className="h-4 w-4" />
                          {t("ساختن کابینت", "Create cabinet")}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {config.categories.map((cat, i) => {
                          const items = config.minerals.filter((m) => m.category === cat.name);
                          const featured =
                            [...items].sort(
                              (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name)
                            )[0] ?? null;
                          const ph = featured ? specimenPhoto(featured) : null;
                          const meta = getCategoryMeta(cat.name);
                          const armed = armedCabinetDeleteId === cat.id;
                          return (
                            <div
                              key={cat.id}
                              className="space-y-3 rounded-2xl border border-edge bg-ink/60 p-4"
                            >
                              <div className="flex flex-wrap items-center gap-3">
                                {ph ? (
                                  <img
                                    src={ph.thumbnail || ph.src}
                                    alt={ph.alt}
                                    className="h-14 w-14 shrink-0 rounded-xl bg-plate object-cover"
                                  />
                                ) : (
                                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-edge font-mono text-[9px] text-dusk">
                                    {t("بدون عکس", "No photo")}
                                  </span>
                                )}
                                <span className="font-mono text-[10px] tracking-[0.2em] text-dusk uppercase">
                                  Cabinet {String(i + 1).padStart(2, "0")}
                                </span>
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-[9px] font-bold",
                                    items.length > 0
                                      ? "bg-malachite/15 text-malachite"
                                      : "bg-rhodo/15 text-rhodo"
                                  )}
                                >
                                  {items.length > 0
                                    ? t("در سایت دیده می‌شود", "Live on the site")
                                    : t("مخفی — هنوز نمونه ندارد", "Hidden — no specimens yet")}
                                </span>
                                <span className="font-mono text-[10px] text-dusk">
                                  #/category/{slugifyCategory(cat.name)} · {items.length}{" "}
                                  {t("نمونه", "specimens")}
                                </span>
                                <div className="ms-auto flex items-center gap-1">
                                  <button
                                    onClick={() => moveCabinet(cat.id, -1)}
                                    disabled={i === 0}
                                    className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                    title={t("بالا", "Move up")}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => moveCabinet(cat.id, 1)}
                                    disabled={i === config.categories.length - 1}
                                    className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                    title={t("پایین", "Move down")}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!armed) {
                                        setArmedCabinetDeleteId(cat.id);
                                        setTimeout(() => setArmedCabinetDeleteId(null), 3000);
                                        return;
                                      }
                                      if (config.categories.length <= 1) {
                                        notify(t("حداقل یک کابینت لازم است", "Keep at least one cabinet"));
                                        setArmedCabinetDeleteId(null);
                                        return;
                                      }
                                      deleteCategory(cat.id);
                                      setArmedCabinetDeleteId(null);
                                      notify(t("کابینت حذف شد — نمونه‌هایش به اولین کابینت منتقل شدند", "Cabinet deleted — its specimens moved to the first cabinet"));
                                    }}
                                    className={cn(
                                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors",
                                      armed
                                        ? "bg-rhodo text-ink"
                                        : "text-dusk hover:bg-rhodo/15 hover:text-rhodo"
                                    )}
                                    title={t("حذف کابینت", "Delete cabinet")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {armed ? t("مطمئنی؟ حذف کن", "Sure? Delete") : t("حذف", "Delete")}
                                  </button>
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-[64px_1fr]">
                                <Field label={t("رنگ", "Colour")}>
                                  <span className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                                      value={cat.color}
                                      onChange={(e) => updateCategory(cat.id, cat.name, e.target.value)}
                                    />
                                  </span>
                                </Field>
                                <Field label={t("نام کابینت (تغییر نام، نمونه‌ها را هم به‌روز می‌کند)", "Cabinet name (renaming updates its specimens too)")}>
                                  <input
                                    className={inputCls}
                                    value={cat.name}
                                    onChange={(e) => updateCategory(cat.id, e.target.value, cat.color)}
                                  />
                                </Field>
                              </div>
                              <p className="text-[11px] leading-relaxed text-dusk italic">
                                {meta.tagline}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3 border-t border-edge/60 pt-4">
                        <button
                          onClick={() => setTab("minerals")}
                          className="rounded-full border border-gold/50 px-4 py-2 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                        >
                          {t("دادن نمونه به کابینت‌ها →", "Assign specimens to cabinets →")}
                        </button>
                        <button
                          onClick={() => setTab("categories")}
                          className="rounded-full border border-edge px-4 py-2 text-[11px] font-bold text-mist transition-colors hover:border-gold/60 hover:text-goldbright"
                        >
                          {t("مدیریت صفحات کابینت‌ها →", "Manage cabinet pages →")}
                        </button>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "عکس روی هر کارت، عکس باارزش‌ترین نمونه‌ی همان کابینت است و خودکار انتخاب می‌شود؛ برای تغییرش، نمونه‌ی دیگری را کمیاب‌تر کنید یا عکس نمونه را از تب «سکشن هیرو / نمونه‌ها» عوض کنید. کابینت خالی تا وقتی نمونه نگیرد در سایت مخفی می‌ماند.",
                          "Each card's photo is that cabinet's rarest specimen, chosen automatically; change it by raising another specimen's rarity or editing the specimen's photo. An empty cabinet stays hidden on the site until it holds a specimen."
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* 0e. CATALOGUE RAISONNÉ (COLLECTION) — everything, 0–100 */}
                {tab === "collection" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل کاتالوگ نمونه‌ها (02 / 06)", "Catalogue Raisonné — Full Control (02 / 06)")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای سکشن کاتالوگ (Catalogue Raisonné) اینجاست: تیتر، نوار ابزار جستجو و مرتب‌سازی، متن‌های کارت‌ها و حالت خالی، و فهرست نمونه‌های داخل کاتالوگ. نمونه‌ها را از همین‌جا حذف کنید و برای افزودن یا ویرایش کامل، میانبر تب نمونه‌ها هست.",
                              "Everything in the Catalogue Raisonné section lives here: the heading, the search & sort toolbar, card and empty-state texts, and the specimen roster. Delete specimens right here; the Specimens tab shortcut handles adding and full editing."
                            )}
                          </p>
                        </div>
                        {collectionSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("collection")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              collectionSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {collectionSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {collectionSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("collection", "The Specimen Vault")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* heading */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیتر سکشن", "Section Heading")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره فصل — خالی = حذف", "Chapter — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.collection.chapter}
                            onChange={(e) => updateCollection({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان کوچک بالا (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.collection.overline}
                            onChange={(e) => updateCollection({ overline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت ساده)", "Title — opening")}>
                          <input
                            className={inputCls}
                            value={config.collection.titlePrefix}
                            onChange={(e) => updateCollection({ titlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت رنگی)", "Title — coloured part")}>
                          <input
                            className={inputCls}
                            value={config.collection.titleHighlight}
                            onChange={(e) => updateCollection({ titleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("رنگ لهجه سکشن", "Section accent colour")}>
                          <span className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.collection.accent}
                              onChange={(e) => updateCollection({ accent: e.target.value })}
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                            />
                            <input
                              className={inputCls}
                              value={config.collection.accent}
                              onChange={(e) => updateCollection({ accent: e.target.value })}
                            />
                          </span>
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر — خالی = حذف", "Subtitle — empty hides it")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.collection.subtitle}
                          onChange={(e) => updateCollection({ subtitle: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* toolbar */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("نوار ابزار کاتالوگ (جستجو، مرتب‌سازی، فیلترها)", "Catalogue Toolbar (search, sort, filters)")}
                      </h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {(
                          [
                            ["showSearch", t("نوار جستجو", "Search bar")],
                            ["showSort", t("مرتب‌سازی", "Sort menu")],
                            ["showSavedFilter", t("دکمه علاقه‌مندی‌ها (قلب)", "Saved (heart) filter")],
                            ["showCategoryChips", t("فیلتر دسته‌بندی‌ها", "Category chips")],
                          ] as const
                        ).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2.5 text-sm font-semibold text-ivory">
                            <input
                              type="checkbox"
                              checked={config.collection[key]}
                              onChange={(e) => updateCollection({ [key]: e.target.checked })}
                              className="h-4 w-4 accent-gold"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("متن راهنمای داخل نوار جستجو", "Search placeholder text")}>
                          <input
                            className={inputCls}
                            value={config.collection.searchPlaceholder}
                            onChange={(e) => updateCollection({ searchPlaceholder: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب دکمه علاقه‌مندی‌ها", "Saved button label")}>
                          <input
                            className={inputCls}
                            value={config.collection.savedLabel}
                            onChange={(e) => updateCollection({ savedLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("مرتب‌سازی: برچسب «نام الفبایی»", "Sort label — name")}>
                          <input
                            className={inputCls}
                            value={config.collection.sortLabelName}
                            onChange={(e) => updateCollection({ sortLabelName: e.target.value })}
                          />
                        </Field>
                        <Field label={t("مرتب‌سازی: برچسب «کمیاب‌ترین»", "Sort label — rarest")}>
                          <input
                            className={inputCls}
                            value={config.collection.sortLabelRarity}
                            onChange={(e) => updateCollection({ sortLabelRarity: e.target.value })}
                          />
                        </Field>
                        <Field label={t("مرتب‌سازی: برچسب «سخت‌ترین»", "Sort label — hardest")}>
                          <input
                            className={inputCls}
                            value={config.collection.sortLabelHardest}
                            onChange={(e) => updateCollection({ sortLabelHardest: e.target.value })}
                          />
                        </Field>
                        <Field label={t("مرتب‌سازی: برچسب «نرم‌ترین»", "Sort label — softest")}>
                          <input
                            className={inputCls}
                            value={config.collection.sortLabelSoftest}
                            onChange={(e) => updateCollection({ sortLabelSoftest: e.target.value })}
                          />
                        </Field>
                        <Field label={t("متن شمارش نتایج — {shown} و {total}", "Result count text — {shown} and {total}")}>
                          <input
                            className={inputCls}
                            value={config.collection.resultCountText}
                            onChange={(e) => updateCollection({ resultCountText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("متن دکمه «بازنشانی فیلترها»", "“Reset filters” text")}>
                          <input
                            className={inputCls}
                            value={config.collection.resetFiltersText}
                            onChange={(e) => updateCollection({ resetFiltersText: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>

                    {/* card + empty state texts */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("متن‌های کارت‌ها و حالت خالی", "Card & Empty-State Texts")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("متن دکمه پایین هر کارت نمونه", "Button text on every specimen card")}>
                          <input
                            className={inputCls}
                            value={config.collection.cardButtonText}
                            onChange={(e) => updateCollection({ cardButtonText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر حالت خالی (نتیجه‌ای پیدا نشد)", "Empty-state title (no results)")}>
                          <input
                            className={inputCls}
                            value={config.collection.emptyTitle}
                            onChange={(e) => updateCollection({ emptyTitle: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("متن حالت خالی — جستجوی ناموفق", "Empty-state text — failed search")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.collection.emptyText}
                          onChange={(e) => updateCollection({ emptyText: e.target.value })}
                        />
                      </Field>
                      <Field label={t("متن حالت خالی — هنوز علاقه‌مندی ذخیره نشده", "Empty-state text — nothing saved yet")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.collection.emptySavedText}
                          onChange={(e) => updateCollection({ emptySavedText: e.target.value })}
                        />
                      </Field>
                      <Field label={t("متن دکمه حالت خالی", "Empty-state button text")}>
                        <input
                          className={inputCls}
                          value={config.collection.emptyButtonText}
                          onChange={(e) => updateCollection({ emptyButtonText: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* specimen roster */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("نمونه‌های داخل کاتالوگ", "Specimens in the Catalogue")}
                        </h3>
                        <span className="rounded-full border border-edge px-3 py-1 font-mono text-[10px] tracking-wide text-dusk uppercase">
                          {config.minerals.length} {t("نمونه", "specimens")}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "همه‌ی نمونه‌های کلکسیون در این کاتالوگ نمایش داده می‌شوند. از اینجا نمونه را برای همیشه حذف کنید (با تأیید دومرحله‌ای)؛ افزودن نمونه جدید و ویرایش کامل مشخصات و عکس از تب «نمونه‌ها» انجام می‌شود.",
                          "Every specimen in the collection appears in this catalogue. Permanently delete a specimen here (two-step confirm); adding new specimens and full editing of details and photos happens in the Specimens tab."
                        )}
                      </p>
                      <div className="space-y-2">
                        {config.minerals.map((m) => {
                          const ph = specimenPhoto(m);
                          const armed = armedSpecimenDeleteId === m.id;
                          return (
                            <div
                              key={m.id}
                              className="flex flex-wrap items-center gap-3 rounded-2xl border border-edge bg-ink/60 px-3 py-2.5"
                            >
                              {ph && (
                                <img
                                  src={ph.thumbnail || ph.src}
                                  alt={ph.alt}
                                  className="h-12 w-12 shrink-0 rounded-xl bg-plate object-cover"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-ivory">{m.name}</div>
                                <div className="truncate font-mono text-[10px] text-dusk">
                                  {m.catalog} · {m.category}
                                </div>
                              </div>
                              {m.highlight && (
                                <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[9px] font-bold text-goldbright">
                                  {t("شاهکار", "Masterwork")}
                                </span>
                              )}
                              <button
                                onClick={() => setTab("minerals")}
                                className="rounded-full border border-edge px-3.5 py-1.5 text-[11px] font-bold text-mist transition-colors hover:border-gold/60 hover:text-goldbright"
                              >
                                {t("ویرایش", "Edit")}
                              </button>
                              <button
                                onClick={() => {
                                  if (!armed) {
                                    setArmedSpecimenDeleteId(m.id);
                                    setTimeout(() => setArmedSpecimenDeleteId(null), 3000);
                                    return;
                                  }
                                  deleteMineral(m.id);
                                  setArmedSpecimenDeleteId(null);
                                  notify(t("نمونه برای همیشه حذف شد", "Specimen permanently deleted"));
                                }}
                                className={cn(
                                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors",
                                  armed
                                    ? "bg-rhodo text-ink"
                                    : "border border-edge text-dusk hover:border-rhodo/60 hover:text-rhodo"
                                )}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {armed ? t("مطمئنی؟ حذف دائمی", "Sure? Delete forever") : t("حذف", "Delete")}
                              </button>
                            </div>
                          );
                        })}
                        {config.minerals.length === 0 && (
                          <p className="rounded-2xl border border-dashed border-rhodo/40 bg-rhodo/5 px-4 py-3 text-xs text-rhodo">
                            {t("هیچ نمونه‌ای نیست — کاتالوگ در سایت خالی دیده می‌شود.", "There are no specimens — the catalogue will look empty on the site.")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setTab("minerals")}
                        className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-[11px] font-bold text-ink transition-colors hover:bg-goldbright"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t("افزودن نمونه جدید (تب نمونه‌ها)", "Add a new specimen (Specimens tab)")}
                      </button>
                    </div>
                  </div>
                )}

                {/* 0f. GLOW ROOM · PHOTOLUMINESCENCE LAB — everything, 0–100 */}
                {tab === "glow" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل اتاق درخشش (03 / 06)", "Glow Room · Photoluminescence Lab — Full Control (03 / 06)")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای آزمایشگاه فوتولومینسانس اینجاست: تیتر، عکس صحنه UV و کپشن‌هایش، کنسول لامپ (برچسب‌ها و حالت پیش‌فرض بازدیدکننده) و جدول گسیل مواد. ردیف‌های جدول را اضافه، حذف و ویرایش کنید.",
                              "Everything in the Photoluminescence Lab lives here: the heading, the UV stage photo and its captions, the lamp console (labels and the visitor's default state), and the emission table. Add, delete and edit the table rows."
                            )}
                          </p>
                        </div>
                        {glowSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("glow")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              glowSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {glowSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {glowSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("glow", "Glow Room (UV Lab)")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* heading */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیتر سکشن", "Section Heading")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره فصل — خالی = حذف", "Chapter — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.glow.chapter}
                            onChange={(e) => updateGlow({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان کوچک بالا (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.glow.overline}
                            onChange={(e) => updateGlow({ overline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت ساده)", "Title — opening")}>
                          <input
                            className={inputCls}
                            value={config.glow.titlePrefix}
                            onChange={(e) => updateGlow({ titlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت رنگی)", "Title — coloured part")}>
                          <input
                            className={inputCls}
                            value={config.glow.titleHighlight}
                            onChange={(e) => updateGlow({ titleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("رنگ لهجه سکشن", "Section accent colour")}>
                          <span className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.glow.accent}
                              onChange={(e) => updateGlow({ accent: e.target.value })}
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                            />
                            <input
                              className={inputCls}
                              value={config.glow.accent}
                              onChange={(e) => updateGlow({ accent: e.target.value })}
                            />
                          </span>
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر — خالی = حذف", "Subtitle — empty hides it")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.glow.subtitle}
                          onChange={(e) => updateGlow({ subtitle: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* stage photo + captions */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <input
                        ref={glowFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGlowPhotoUpload}
                      />
                      <h3 className="font-display text-xl text-ivory">
                        {t("عکس صحنه UV و کپشن‌ها", "UV Stage Photo & Captions")}
                      </h3>
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-64 flex-1">
                          <PhotoPicker
                            label={t("عکس روی صحنه (از کتابخانه)", "Stage photo (from library)")}
                            value={config.glow.photoId}
                            media={config.media}
                            onChange={(photoId) => updateGlow({ photoId })}
                          />
                        </div>
                        <button
                          onClick={() => glowFileRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-[11px] font-bold text-ink transition-colors hover:bg-goldbright"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {t("آپلود عکس جدید", "Upload new photo")}
                        </button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("برچسب روی عکس (گوشه پایین)", "On-photo badge (bottom corner)")}>
                          <input
                            className={inputCls}
                            value={config.glow.specimenLabel}
                            onChange={(e) => updateGlow({ specimenLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("متن اعتبار عکس (پیش از نام عکاس)", "Photo credit prefix (before the author name)")}>
                          <input
                            className={inputCls}
                            value={config.glow.creditText}
                            onChange={(e) => updateGlow({ creditText: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("کپشن حالت موج کوتاه 254 نانومتر", "Caption — shortwave 254 nm")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.glow.caption254}
                          onChange={(e) => updateGlow({ caption254: e.target.value })}
                        />
                      </Field>
                      <Field label={t("کپشن حالت موج بلند 365 نانومتر", "Caption — longwave 365 nm")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.glow.caption365}
                          onChange={(e) => updateGlow({ caption365: e.target.value })}
                        />
                      </Field>
                      <Field label={t("کپشن حالت خاموش (نور روز)", "Caption — lamp off (daylight)")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.glow.captionOff}
                          onChange={(e) => updateGlow({ captionOff: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* lamp console */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("کنسول لامپ UV (برچسب‌ها و حالت پیش‌فرض)", "UV Lamp Console (labels & defaults)")}
                      </h3>
                      <div className="grid gap-4 rounded-2xl border border-edge bg-ink/50 p-4 sm:grid-cols-3">
                        <label className="flex items-center gap-2.5 text-sm font-semibold text-ivory">
                          <input
                            type="checkbox"
                            checked={config.glow.defaultLampOn}
                            onChange={(e) => updateGlow({ defaultLampOn: e.target.checked })}
                            className="h-4 w-4 accent-gold"
                          />
                          {t("لامپ در بدو ورود روشن باشد", "Lamp starts ON for visitors")}
                        </label>
                        <Field label={t("طول موج پیش‌فرض", "Default wavelength")}>
                          <select
                            className={cn(inputCls, "[&>option]:bg-surface")}
                            value={config.glow.defaultWavelength}
                            onChange={(e) => updateGlow({ defaultWavelength: Number(e.target.value) })}
                          >
                            <option value={254}>254 nm</option>
                            <option value={365}>365 nm</option>
                          </select>
                        </Field>
                        <Field label={t("شدت پیش‌فرض لامپ (٪)", "Default intensity (%)")}>
                          <input
                            type="number"
                            min={10}
                            max={100}
                            className={inputCls}
                            value={config.glow.defaultIntensity}
                            onChange={(e) =>
                              updateGlow({
                                defaultIntensity: Math.min(100, Math.max(10, Number(e.target.value) || 75)),
                              })
                            }
                          />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("عنوان کنسول", "Console title")}>
                          <input
                            className={inputCls}
                            value={config.glow.consoleTitle}
                            onChange={(e) => updateGlow({ consoleTitle: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب کلید لامپ", "Lamp switch label")}>
                          <input
                            className={inputCls}
                            value={config.glow.lampLabel}
                            onChange={(e) => updateGlow({ lampLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب طول موج", "Wavelength label")}>
                          <input
                            className={inputCls}
                            value={config.glow.wavelengthLabel}
                            onChange={(e) => updateGlow({ wavelengthLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("دکمه موج کوتاه", "Shortwave button")}>
                          <input
                            className={inputCls}
                            value={config.glow.shortwaveLabel}
                            onChange={(e) => updateGlow({ shortwaveLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("دکمه موج بلند", "Longwave button")}>
                          <input
                            className={inputCls}
                            value={config.glow.longwaveLabel}
                            onChange={(e) => updateGlow({ longwaveLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب شدت لامپ", "Intensity label")}>
                          <input
                            className={inputCls}
                            value={config.glow.intensityLabel}
                            onChange={(e) => updateGlow({ intensityLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("دکمه بازنشانی کنسول", "Reset button")}>
                          <input
                            className={inputCls}
                            value={config.glow.resetLabel}
                            onChange={(e) => updateGlow({ resetLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("نشان روی عکس وقتی لامپ روشن است (پیش از «· 254 nm»)", "On-photo badge when ON (before “· 254 nm”)")}>
                          <input
                            className={inputCls}
                            value={config.glow.badgePrefix}
                            onChange={(e) => updateGlow({ badgePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("نشان روی عکس وقتی لامپ خاموش است", "On-photo badge when OFF")}>
                          <input
                            className={inputCls}
                            value={config.glow.badgeOffText}
                            onChange={(e) => updateGlow({ badgeOffText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان جدول گسیل", "Emission table title")}>
                          <input
                            className={inputCls}
                            value={config.glow.emissionsTitle}
                            onChange={(e) => updateGlow({ emissionsTitle: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>

                    {/* emissions table + note */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-xl text-ivory">
                        {t("جدول گسیل مواد (زیر کنسول)", "Emission Table (under the console)")}
                      </h3>
                      {config.glow.emissions.map((f, idx) => (
                        <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_110px_64px_1fr_auto]">
                          <input
                            className={inputCls}
                            placeholder={t("نام ماده", "Mineral name")}
                            value={f.name}
                            onChange={(e) => {
                              const next = [...config.glow.emissions];
                              next[idx] = { ...next[idx], name: e.target.value };
                              updateGlow({ emissions: next });
                            }}
                          />
                          <input
                            className={inputCls}
                            placeholder={t("فرمول", "Formula")}
                            value={f.formula}
                            onChange={(e) => {
                              const next = [...config.glow.emissions];
                              next[idx] = { ...next[idx], formula: e.target.value };
                              updateGlow({ emissions: next });
                            }}
                          />
                          <input
                            type="color"
                            className="h-10 w-full cursor-pointer rounded-xl border border-edge bg-ink p-1"
                            value={f.color}
                            aria-label={t("رنگ گسیل", "Emission colour")}
                            onChange={(e) => {
                              const next = [...config.glow.emissions];
                              next[idx] = { ...next[idx], color: e.target.value };
                              updateGlow({ emissions: next });
                            }}
                          />
                          <input
                            className={inputCls}
                            placeholder={t("رنگ درخشش (متن)", "Glow description")}
                            value={f.emits}
                            onChange={(e) => {
                              const next = [...config.glow.emissions];
                              next[idx] = { ...next[idx], emits: e.target.value };
                              updateGlow({ emissions: next });
                            }}
                          />
                          <button
                            onClick={() =>
                              updateGlow({
                                emissions: config.glow.emissions.filter((_, j) => j !== idx),
                              })
                            }
                            className="rounded-xl border border-edge px-2.5 text-dusk transition-colors hover:border-rhodo/60 hover:text-rhodo"
                            aria-label={t("حذف ردیف", "Delete row")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          updateGlow({
                            emissions: [
                              ...config.glow.emissions,
                              { name: "New mineral", formula: "—", color: "#a3f58a", emits: "Glow colour" },
                            ],
                          })
                        }
                        className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                      >
                        <Plus className="h-3 w-3" /> {t("افزودن ردیف گسیل", "Add emission row")}
                      </button>
                      <Field label={t("یادداشت علمی زیر جدول", "Scientific note under the table")}>
                        <textarea
                          rows={4}
                          className={inputCls}
                          value={config.glow.note}
                          onChange={(e) => updateGlow({ note: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* 0g. PLANETARY CHRONOLOGY (DEEP TIME) — everything, 0–100 */}
                {tab === "deeptime" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل گاه‌شمار زمین (04 / 06)", "Planetary Chronology — Full Control (04 / 06)")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای سکشن «زمان عمیق» اینجاست: تیتر سکشن و فصل‌های تایم‌لاین ۴٫۵۶ میلیارد ساله. فصل تازه بسازید، ویرایش کنید، جابه‌جا کنید یا حذف کنید.",
                              "Everything in the Deep Time section lives here: the section heading and the chapters of the 4.56-billion-year timeline. Create, edit, reorder or delete chapters."
                            )}
                          </p>
                        </div>
                        {deeptimeSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("deeptime")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              deeptimeSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {deeptimeSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {deeptimeSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("deeptime", "Deep Time Chronology")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* heading */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیتر سکشن", "Section Heading")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره فصل — خالی = حذف", "Chapter — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.deeptime.chapter}
                            onChange={(e) => updateDeeptime({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان کوچک بالا (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.deeptime.overline}
                            onChange={(e) => updateDeeptime({ overline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت ساده)", "Title — opening")}>
                          <input
                            className={inputCls}
                            value={config.deeptime.titlePrefix}
                            onChange={(e) => updateDeeptime({ titlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت رنگی)", "Title — coloured part")}>
                          <input
                            className={inputCls}
                            value={config.deeptime.titleHighlight}
                            onChange={(e) => updateDeeptime({ titleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("رنگ لهجه سکشن", "Section accent colour")}>
                          <span className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.deeptime.accent}
                              onChange={(e) => updateDeeptime({ accent: e.target.value })}
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                            />
                            <input
                              className={inputCls}
                              value={config.deeptime.accent}
                              onChange={(e) => updateDeeptime({ accent: e.target.value })}
                            />
                          </span>
                        </Field>
                        <Field label={t("متن راهنمای کنار فلش‌ها (مثل Drag or scroll)", "Hint beside the arrows (e.g. Drag or scroll)")}>
                          <input
                            className={inputCls}
                            value={config.deeptime.dragHint}
                            onChange={(e) => updateDeeptime({ dragHint: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر — خالی = حذف", "Subtitle — empty hides it")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.deeptime.subtitle}
                          onChange={(e) => updateDeeptime({ subtitle: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* timeline manager */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("فصل‌های تایم‌لاین", "Timeline Chapters")}
                        </h3>
                        <button
                          onClick={startNewEra}
                          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-[#1a1206] transition-colors hover:bg-goldbright"
                        >
                          <Plus className="h-4 w-4" />
                          {t("افزودن فصل", "Add Chapter")}
                        </button>
                      </div>

                      {editingEra && (
                        <div className="rounded-3xl border border-gold/40 bg-ink/60 p-6 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <Field label={t("سن / عدد", "Age")}>
                              <input
                                className={inputCls}
                                value={editingEra.age}
                                onChange={(e) => setEditingEra({ ...editingEra, age: e.target.value })}
                              />
                            </Field>
                            <Field label={t("واحد زمانی", "Unit")}>
                              <input
                                className={inputCls}
                                value={editingEra.unit}
                                onChange={(e) => setEditingEra({ ...editingEra, unit: e.target.value })}
                              />
                            </Field>
                            <Field label={t("رنگ فصل", "Accent")}>
                              <input
                                type="color"
                                className="h-10 w-full cursor-pointer rounded-xl border border-edge bg-ink p-1"
                                value={editingEra.accent}
                                onChange={(e) => setEditingEra({ ...editingEra, accent: e.target.value })}
                              />
                            </Field>
                          </div>
                          <Field label={t("عنوان فصل", "Chapter Title")}>
                            <input
                              className={inputCls}
                              value={editingEra.title}
                              onChange={(e) => setEditingEra({ ...editingEra, title: e.target.value })}
                            />
                          </Field>
                          <Field label={t("توضیحات", "Body")}>
                            <textarea
                              rows={3}
                              className={inputCls}
                              value={editingEra.body}
                              onChange={(e) => setEditingEra({ ...editingEra, body: e.target.value })}
                            />
                          </Field>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("کانی‌های مرتبط (با کاما جدا کنید)", "Minerals (comma separated)")}>
                              <input
                                className={inputCls}
                                value={editingEra.minerals.join(", ")}
                                onChange={(e) =>
                                  setEditingEra({
                                    ...editingEra,
                                    minerals: e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </Field>
                            <div className="space-y-2">
                              <span className="block text-xs font-semibold text-mist">
                                {t("عکس اختیاری کارت فصل", "Optional chapter photo")}
                              </span>
                              <select
                                className={cn(inputCls, "[&>option]:bg-surface")}
                                value={editingEra.photoId ?? ""}
                                onChange={(e) =>
                                  setEditingEra({
                                    ...editingEra,
                                    photoId: e.target.value || undefined,
                                  })
                                }
                              >
                                <option value="">{t("بدون عکس", "No image")}</option>
                                {Object.values(config.media).map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.subject}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingEra(null)}
                              className="rounded-full border border-edge px-4 py-2 text-xs font-bold text-mist"
                            >
                              {t("انصراف", "Cancel")}
                            </button>
                            <button
                              onClick={() => {
                                if (!editingEra.title.trim()) return;
                                upsertEra(editingEra);
                                setEditingEra(null);
                                notify(t("فصل ذخیره شد", "Chapter saved"));
                              }}
                              className="rounded-full bg-gold px-5 py-2 text-xs font-bold text-[#1a1206]"
                            >
                              {t("ذخیره فصل", "Save Chapter")}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {config.deeptime.eras.map((era, idx) => (
                          <div
                            key={era.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-edge bg-ink/60 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-11 w-11 items-center justify-center rounded-full border-2 bg-ink font-mono text-[11px] font-bold"
                                style={{ borderColor: era.accent, color: era.accent }}
                              >
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <div className="font-mono text-xs" style={{ color: era.accent }}>
                                  {era.age} {era.unit}
                                </div>
                                <div className="font-display text-xl text-ivory">{era.title}</div>
                                <div className="font-mono text-[10px] text-dusk">
                                  {era.minerals.length} {t("کانی مرتبط", "linked minerals")}
                                  {era.photoId ? ` · ${t("با عکس", "with photo")}` : ""}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => moveEra(era.id, -1)}
                                disabled={idx === 0}
                                className="rounded-lg p-2 text-mist hover:bg-surface disabled:opacity-25"
                                title={t("بالا", "Move up")}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => moveEra(era.id, 1)}
                                disabled={idx === config.deeptime.eras.length - 1}
                                className="rounded-lg p-2 text-mist hover:bg-surface disabled:opacity-25"
                                title={t("پایین", "Move down")}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingEra(era)}
                                className="rounded-full border border-edge px-3.5 py-1.5 text-xs font-bold text-ivory transition-colors hover:border-gold"
                              >
                                {t("ویرایش", "Edit")}
                              </button>
                              <button
                                onClick={() => {
                                  deleteEra(era.id);
                                  notify(t("فصل حذف شد", "Chapter deleted"));
                                }}
                                className="rounded-full p-2 text-rhodo transition-colors hover:bg-rhodo/15"
                                title={t("حذف فصل", "Delete chapter")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {config.deeptime.eras.length === 0 && (
                          <p className="rounded-2xl border border-dashed border-edge px-4 py-3 text-xs text-dusk">
                            {t(
                              "هیچ فصلی نیست — تایم‌لاین در سایت خالی می‌ماند. با «افزودن فصل» اولین پرده را بسازید.",
                              "No chapters yet — the timeline will be empty on the site. Create the first act with “Add Chapter”."
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 0h. CURATORIAL JOURNAL (STORIES) — everything, 0–100 */}
                {tab === "stories" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل ژورنال کیوریتور (05 / 06)", "Curatorial Journal — Full Control (05 / 06)")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای سکشن «ژورنال کیوریتور» اینجاست: تیتر سکشن، برچسب‌های پنجره مطالعه و خود مقاله‌ها. مقاله تازه بنویسید، ویرایش کنید یا حذف کنید.",
                              "Everything in the Curatorial Journal section lives here: the section heading, the reading-modal labels, and the articles themselves. Write, edit or delete articles."
                            )}
                          </p>
                        </div>
                        {storiesSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("stories")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              storiesSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {storiesSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {storiesSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("stories", "Curatorial Journal")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* heading + modal labels */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیتر سکشن و برچسب‌های مطالعه", "Section Heading & Reading Labels")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره فصل — خالی = حذف", "Chapter — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.stories.chapter}
                            onChange={(e) => updateStories({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان کوچک بالا (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.stories.overline}
                            onChange={(e) => updateStories({ overline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت ساده)", "Title — opening")}>
                          <input
                            className={inputCls}
                            value={config.stories.titlePrefix}
                            onChange={(e) => updateStories({ titlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت رنگی)", "Title — coloured part")}>
                          <input
                            className={inputCls}
                            value={config.stories.titleHighlight}
                            onChange={(e) => updateStories({ titleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("رنگ لهجه سکشن", "Section accent colour")}>
                          <span className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.stories.accent}
                              onChange={(e) => updateStories({ accent: e.target.value })}
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                            />
                            <input
                              className={inputCls}
                              value={config.stories.accent}
                              onChange={(e) => updateStories({ accent: e.target.value })}
                            />
                          </span>
                        </Field>
                        <Field label={t("پسوند زمان روی کارت‌ها (مثل min)", "Card time suffix (e.g. min)")}>
                          <input
                            className={inputCls}
                            value={config.stories.minutesSuffix}
                            onChange={(e) => updateStories({ minutesSuffix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب زمان مطالعه در پنجره مقاله", "Modal read-time label")}>
                          <input
                            className={inputCls}
                            value={config.stories.modalReadLabel}
                            onChange={(e) => updateStories({ modalReadLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("یادداشت پایین پنجره مقاله", "Modal footer note")}>
                          <input
                            className={inputCls}
                            value={config.stories.modalFooterNote}
                            onChange={(e) => updateStories({ modalFooterNote: e.target.value })}
                          />
                        </Field>
                        <Field label={t("دکمه بازگشت در پنجره مقاله", "Modal back button")}>
                          <input
                            className={inputCls}
                            value={config.stories.modalBackLabel}
                            onChange={(e) => updateStories({ modalBackLabel: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر — خالی = حذف", "Subtitle — empty hides it")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.stories.subtitle}
                          onChange={(e) => updateStories({ subtitle: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* articles manager */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("مقاله‌های ژورنال", "Journal Articles")}
                        </h3>
                        <button
                          onClick={startNewArticle}
                          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-[#1a1206] transition-colors hover:bg-goldbright"
                        >
                          <Plus className="h-4 w-4" />
                          {t("نوشتن مقاله جدید", "New Article")}
                        </button>
                      </div>

                      {editingArticle && (
                        <div className="rounded-3xl border border-gold/40 bg-ink/60 p-6 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <Field label={t("عنوان مقاله *", "Title *")}>
                              <input
                                className={cn(inputCls, "sm:col-span-2")}
                                value={editingArticle.title}
                                onChange={(e) =>
                                  setEditingArticle({ ...editingArticle, title: e.target.value })
                                }
                              />
                            </Field>
                            <Field label={t("دسته‌بندی / تگ", "Tag")}>
                              <input
                                className={inputCls}
                                value={editingArticle.tag}
                                onChange={(e) =>
                                  setEditingArticle({ ...editingArticle, tag: e.target.value })
                                }
                              />
                            </Field>
                            <Field label={t("رنگ تگ", "Tag colour")}>
                              <span className="flex items-center gap-2">
                                <input
                                  type="color"
                                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                                  value={editingArticle.tagColor}
                                  onChange={(e) =>
                                    setEditingArticle({ ...editingArticle, tagColor: e.target.value })
                                  }
                                />
                                <input
                                  className={inputCls}
                                  value={editingArticle.tagColor}
                                  onChange={(e) =>
                                    setEditingArticle({ ...editingArticle, tagColor: e.target.value })
                                  }
                                />
                              </span>
                            </Field>
                            <Field label={t("نویسنده", "Author")}>
                              <input
                                className={inputCls}
                                value={editingArticle.author}
                                onChange={(e) =>
                                  setEditingArticle({ ...editingArticle, author: e.target.value })
                                }
                              />
                            </Field>
                            <Field label={t("سمت نویسنده", "Role")}>
                              <input
                                className={inputCls}
                                value={editingArticle.role}
                                onChange={(e) =>
                                  setEditingArticle({ ...editingArticle, role: e.target.value })
                                }
                              />
                            </Field>
                            <Field label={t("زمان مطالعه (دقیقه)", "Read Minutes")}>
                              <input
                                type="number"
                                min="1"
                                className={inputCls}
                                value={editingArticle.minutes}
                                onChange={(e) =>
                                  setEditingArticle({
                                    ...editingArticle,
                                    minutes: Number(e.target.value),
                                  })
                                }
                              />
                            </Field>
                          </div>
                          <PhotoPicker
                            label={t("عکس کاور مقاله", "Article Photo")}
                            value={editingArticle.photoId}
                            media={config.media}
                            onChange={(photoId) => setEditingArticle({ ...editingArticle, photoId })}
                          />
                          <Field label={t("خلاصه کوتاه (روی کارت)", "Excerpt (on the card)")}>
                            <textarea
                              rows={2}
                              className={inputCls}
                              value={editingArticle.excerpt}
                              onChange={(e) =>
                                setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("جمله برجسته (Pull Quote) — خالی = بدون نقل‌قول", "Pull Quote — empty removes it")}>
                            <input
                              className={inputCls}
                              value={editingArticle.pullQuote}
                              onChange={(e) =>
                                setEditingArticle({ ...editingArticle, pullQuote: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("متن کامل مقاله (پاراگراف‌ها با یک خط خالی جدا شوند)", "Full text (separate paragraphs with a blank line)")}>
                            <textarea
                              rows={8}
                              className={inputCls}
                              value={editingArticle.paragraphs.join("\n\n")}
                              onChange={(e) =>
                                setEditingArticle({
                                  ...editingArticle,
                                  paragraphs: e.target.value.split(/\n\s*\n/).filter(Boolean),
                                })
                              }
                            />
                          </Field>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingArticle(null)}
                              className="rounded-full border border-edge px-4 py-2 text-xs font-bold text-mist"
                            >
                              {t("انصراف", "Cancel")}
                            </button>
                            <button
                              onClick={() => {
                                if (!editingArticle.title.trim()) return;
                                upsertArticle(editingArticle);
                                setEditingArticle(null);
                                notify(t("مقاله ذخیره شد", "Article saved"));
                              }}
                              className="rounded-full bg-gold px-5 py-2 text-xs font-bold text-[#1a1206]"
                            >
                              {t("ذخیره مقاله", "Save Article")}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        {config.stories.articles.map((art) => (
                          <div
                            key={art.id}
                            className="flex flex-col justify-between rounded-3xl border border-edge bg-ink/60 p-5"
                          >
                            <div>
                              <span
                                className="font-mono text-[10px] uppercase"
                                style={{ color: art.tagColor }}
                              >
                                {art.tag} · {art.minutes} {config.stories.minutesSuffix}
                              </span>
                              <h4 className="mt-2 font-display text-2xl text-ivory">{art.title}</h4>
                              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-mist">
                                {art.excerpt}
                              </p>
                              <p className="mt-2 font-mono text-[10px] text-dusk">
                                {art.author} · {art.paragraphs.length} {t("پاراگراف", "paragraphs")}
                              </p>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-edge/50 pt-3">
                              <button
                                onClick={() => setEditingArticle(art)}
                                className="rounded-full border border-edge px-4 py-1.5 text-xs font-bold text-ivory transition-colors hover:border-gold"
                              >
                                {t("ویرایش", "Edit")}
                              </button>
                              <button
                                onClick={() => {
                                  deleteArticle(art.id);
                                  notify(t("مقاله حذف شد", "Article deleted"));
                                }}
                                className="rounded-full p-2 text-rhodo transition-colors hover:bg-rhodo/15"
                                title={t("حذف مقاله", "Delete article")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {config.stories.articles.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-edge px-4 py-3 text-xs text-dusk">
                          {t(
                            "هیچ مقاله‌ای نیست — شبکه ژورنال در سایت خالی می‌ماند. با «نوشتن مقاله جدید» اولین یادداشت را منتشر کنید.",
                            "No articles yet — the journal grid will be empty on the site. Publish the first note with “New Article”."
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 0i. VISIT & CONTACT (PRIVATE SALON) — everything, 0–100 */}
                {tab === "visit" && (
                  <div className="space-y-6">
                    {/* status / visibility */}
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مدیریت کامل بازدید و تماس (06 / 06)", "Visit & Contact — Full Control (06 / 06)")}
                          </h3>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                            {t(
                              "همه‌ی محتوای آخرین سکشن سایت اینجاست: بنر تور مجازی، تیتر، گام‌های پروتکل خرید، کانال‌های تماس مستقیم، کارت‌های اطلاعات و فرم پیام به ادمین. هر بخش را اضافه، حذف و ویرایش کنید.",
                              "Everything in the final section lives here: the virtual-tour banner, heading, acquisition protocol steps, direct-contact channels, info cards and the message-to-admin form. Add, delete and edit every part."
                            )}
                          </p>
                        </div>
                        {visitSectionEntry ? (
                          <button
                            onClick={() => toggleSectionVisibility("visit")}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                              visitSectionEntry.visible
                                ? "border-malachite/50 text-malachite hover:bg-malachite/10"
                                : "border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                            )}
                          >
                            {visitSectionEntry.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            {visitSectionEntry.visible
                              ? t("سکشن در سایت نمایش داده می‌شود", "Section is visible on the site")
                              : t("سکشن مخفی است — برای نمایش کلیک کنید", "Section is hidden — click to show")}
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreBuiltin("visit", "Private Salon & Concierge")}
                            className="flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("این سکشن حذف شده — بازگردانی", "This section was deleted — restore it")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* virtual tour banner */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <input
                        ref={visitFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleVisitPhotoUpload}
                      />
                      <h3 className="font-display text-xl text-ivory">
                        {t("بنر تور مجازی (بالای سکشن)", "Virtual Tour Banner (top of section)")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("برچسب بالای بنر (Overline)", "Banner overline")}>
                          <input
                            className={inputCls}
                            value={config.visit.tourOverline}
                            onChange={(e) => updateVisit({ tourOverline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("دکمه تور", "Tour button text")}>
                          <input
                            className={inputCls}
                            value={config.visit.tourButtonText}
                            onChange={(e) => updateVisit({ tourButtonText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر بنر (قسمت ساده)", "Banner title — opening")}>
                          <input
                            className={inputCls}
                            value={config.visit.tourTitlePrefix}
                            onChange={(e) => updateVisit({ tourTitlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر بنر (قسمت رنگی)", "Banner title — coloured part")}>
                          <input
                            className={inputCls}
                            value={config.visit.tourTitleHighlight}
                            onChange={(e) => updateVisit({ tourTitleHighlight: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیح بنر", "Banner description")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.visit.tourDescription}
                          onChange={(e) => updateVisit({ tourDescription: e.target.value })}
                        />
                      </Field>
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-64 flex-1">
                          <PhotoPicker
                            label={t("عکس پس‌زمینه بنر (از کتابخانه)", "Banner photo (from library)")}
                            value={config.visit.tourPhotoId}
                            media={config.media}
                            onChange={(tourPhotoId) => updateVisit({ tourPhotoId })}
                          />
                        </div>
                        <button
                          onClick={() => visitFileRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-[11px] font-bold text-ink transition-colors hover:bg-goldbright"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {t("آپلود عکس جدید", "Upload new photo")}
                        </button>
                      </div>
                    </div>

                    {/* heading */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("تیتر سکشن", "Section Heading")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره فصل — خالی = حذف", "Chapter — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.visit.chapter}
                            onChange={(e) => updateVisit({ chapter: e.target.value })}
                          />
                        </Field>
                        <Field label={t("عنوان کوچک بالا (Overline) — خالی = حذف", "Overline — empty hides it")}>
                          <input
                            className={inputCls}
                            value={config.visit.overline}
                            onChange={(e) => updateVisit({ overline: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت ساده)", "Title — opening")}>
                          <input
                            className={inputCls}
                            value={config.visit.titlePrefix}
                            onChange={(e) => updateVisit({ titlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر (قسمت طلایی)", "Title — gold part")}>
                          <input
                            className={inputCls}
                            value={config.visit.titleHighlight}
                            onChange={(e) => updateVisit({ titleHighlight: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیحات زیر تیتر — خالی = حذف", "Subtitle — empty hides it")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.visit.subtitle}
                          onChange={(e) => updateVisit({ subtitle: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* protocol steps */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-xl text-ivory">
                        {t("گام‌های پروتکل خرید (کارت‌های سه‌تایی)", "Acquisition Protocol Steps")}
                      </h3>
                      {config.visit.protocolSteps.map((p, idx) => (
                        <div key={idx} className="space-y-2 rounded-2xl border border-edge bg-ink/60 p-4">
                          <div className="flex items-center gap-2">
                            <input
                              className={cn(inputCls, "w-24 shrink-0")}
                              value={p.step}
                              aria-label={t("شماره گام", "Step number")}
                              onChange={(e) => {
                                const next = [...config.visit.protocolSteps];
                                next[idx] = { ...next[idx], step: e.target.value };
                                updateVisit({ protocolSteps: next });
                              }}
                            />
                            <input
                              className={cn(inputCls, "flex-1")}
                              value={p.title}
                              aria-label={t("عنوان گام", "Step title")}
                              onChange={(e) => {
                                const next = [...config.visit.protocolSteps];
                                next[idx] = { ...next[idx], title: e.target.value };
                                updateVisit({ protocolSteps: next });
                              }}
                            />
                            <button
                              onClick={() => {
                                const next = [...config.visit.protocolSteps];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                updateVisit({ protocolSteps: next });
                              }}
                              disabled={idx === 0}
                              className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                              title={t("بالا", "Move up")}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const next = [...config.visit.protocolSteps];
                                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                updateVisit({ protocolSteps: next });
                              }}
                              disabled={idx === config.visit.protocolSteps.length - 1}
                              className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                              title={t("پایین", "Move down")}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateVisit({
                                  protocolSteps: config.visit.protocolSteps.filter((_, j) => j !== idx),
                                })
                              }
                              className="rounded-lg p-1.5 text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                              title={t("حذف گام", "Delete step")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            className={inputCls}
                            value={p.detail}
                            aria-label={t("شرح گام", "Step detail")}
                            onChange={(e) => {
                              const next = [...config.visit.protocolSteps];
                              next[idx] = { ...next[idx], detail: e.target.value };
                              updateVisit({ protocolSteps: next });
                            }}
                          />
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          updateVisit({
                            protocolSteps: [
                              ...config.visit.protocolSteps,
                              {
                                step: String(config.visit.protocolSteps.length + 1).padStart(2, "0"),
                                title: "New step",
                                detail: "Describe this step of the acquisition protocol…",
                              },
                            ],
                          })
                        }
                        className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                      >
                        <Plus className="h-3 w-3" /> {t("افزودن گام", "Add step")}
                      </button>
                      {config.visit.protocolSteps.length === 0 && (
                        <p className="text-[11px] text-dusk">
                          {t("همه گام‌ها حذف شده‌اند — ردیف پروتکل در سایت نمایش داده نمی‌شود.", "All steps are deleted — the protocol row will not appear on the site.")}
                        </p>
                      )}
                    </div>

                    {/* contact channels */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("کانال‌های تماس مستقیم", "Direct Contact Channels")}
                      </h3>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "این اطلاعات در فوتر، دکمه شناور تماس و تب «تنظیمات کلی» هم استفاده می‌شود — هرجا عوض کنید همه‌جا به‌روز می‌شود.",
                          "These details are shared with the footer, the floating contact dock and the Brand & Contact tab — change them anywhere and they update everywhere."
                        )}
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("برچسب دکمه تماس (پیش از شماره)", "Call button label (before the number)")}>
                          <input
                            className={inputCls}
                            value={config.visit.callLabel}
                            onChange={(e) => updateVisit({ callLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("شماره نمایشی تماس", "Displayed phone number")}>
                          <input
                            className={inputCls}
                            value={config.contact.phoneDisplay}
                            onChange={(e) => updateContact({ phoneDisplay: e.target.value })}
                          />
                        </Field>
                        <Field label={t("شماره لینک تماس (tel:)", "Phone link number (tel:)")}>
                          <input
                            className={inputCls}
                            value={config.contact.phoneHref}
                            onChange={(e) => updateContact({ phoneHref: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب دکمه واتساپ", "WhatsApp button label")}>
                          <input
                            className={inputCls}
                            value={config.visit.whatsappLabel}
                            onChange={(e) => updateVisit({ whatsappLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("شماره واتساپ (فقط عدد، با کد کشور)", "WhatsApp number (digits only, with country code)")}>
                          <input
                            className={inputCls}
                            value={config.contact.whatsappNumber}
                            onChange={(e) => updateContact({ whatsappNumber: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب دکمه تلگرام", "Telegram button label")}>
                          <input
                            className={inputCls}
                            value={config.visit.telegramLabel}
                            onChange={(e) => updateVisit({ telegramLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("آیدی تلگرام (بدون @)", "Telegram handle (without @)")}>
                          <input
                            className={inputCls}
                            value={config.contact.telegramHandle}
                            onChange={(e) => updateContact({ telegramHandle: e.target.value })}
                          />
                        </Field>
                        <Field label={t("ایمیل", "Email")}>
                          <input
                            className={inputCls}
                            value={config.contact.email}
                            onChange={(e) => updateContact({ email: e.target.value })}
                          />
                        </Field>
                        <Field label={t("آدرس", "Address")}>
                          <input
                            className={inputCls}
                            value={config.contact.address}
                            onChange={(e) => updateContact({ address: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("متن پیش‌فرض پیام واتساپ — {brand} یعنی نام گالری", "Prefilled WhatsApp message — {brand} inserts the gallery name")}>
                        <input
                          className={inputCls}
                          value={config.visit.whatsappPrefill}
                          onChange={(e) => updateVisit({ whatsappPrefill: e.target.value })}
                        />
                      </Field>
                      <Field label={t("یادداشت دسترسی (زیر فرم و کنار دکمه ارسال)", "Availability note (under the form)")}>
                        <input
                          className={inputCls}
                          value={config.contact.availabilityNote}
                          onChange={(e) => updateContact({ availabilityNote: e.target.value })}
                        />
                      </Field>
                    </div>

                    {/* info cards */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("کارت‌های اطلاعات (ساعت، آدرس و…)", "Info Cards (hours, address…)")}
                        </h3>
                        <button
                          onClick={() =>
                            updateVisit({
                              infoCards: [
                                ...config.visit.infoCards,
                                {
                                  id: `info-${Date.now()}`,
                                  icon: "phone",
                                  accent: "#e6b45a",
                                  title: "New Info Card",
                                  lines: ["Detail line 1", "Detail line 2"],
                                },
                              ],
                            })
                          }
                          className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                        >
                          <Plus className="h-3 w-3" /> {t("افزودن کارت", "Add card")}
                        </button>
                      </div>
                      {config.visit.infoCards.map((card, idx) => (
                        <div key={card.id} className="space-y-2 rounded-2xl border border-edge bg-ink/60 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              className={cn(inputCls, "min-w-40 flex-1")}
                              value={card.title}
                              aria-label={t("عنوان کارت", "Card title")}
                              onChange={(e) => {
                                const next = [...config.visit.infoCards];
                                next[idx] = { ...next[idx], title: e.target.value };
                                updateVisit({ infoCards: next });
                              }}
                            />
                            <select
                              className={cn(inputCls, "w-36 [&>option]:bg-surface")}
                              value={card.icon}
                              aria-label={t("آیکون کارت", "Card icon")}
                              onChange={(e) => {
                                const next = [...config.visit.infoCards];
                                next[idx] = {
                                  ...next[idx],
                                  icon: e.target.value as VisitInfoCard["icon"],
                                };
                                updateVisit({ infoCards: next });
                              }}
                            >
                              <option value="clock">{t("ساعت", "Clock")}</option>
                              <option value="phone">{t("تلفن", "Phone")}</option>
                              <option value="map">{t("مکان", "Map pin")}</option>
                              <option value="message">{t("پیام", "Message")}</option>
                            </select>
                            <input
                              type="color"
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                              value={card.accent}
                              aria-label={t("رنگ کارت", "Card colour")}
                              onChange={(e) => {
                                const next = [...config.visit.infoCards];
                                next[idx] = { ...next[idx], accent: e.target.value };
                                updateVisit({ infoCards: next });
                              }}
                            />
                            <button
                              onClick={() =>
                                updateVisit({
                                  infoCards: config.visit.infoCards.filter((c) => c.id !== card.id),
                                })
                              }
                              className="rounded-lg p-1.5 text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                              title={t("حذف کارت", "Delete card")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            className={inputCls}
                            value={card.lines.join("\n")}
                            aria-label={t("خطوط کارت (هر خط در یک سطر)", "Card lines (one per row)")}
                            onChange={(e) => {
                              const next = [...config.visit.infoCards];
                              next[idx] = {
                                ...next[idx],
                                lines: e.target.value.split("\n").filter(Boolean),
                              };
                              updateVisit({ infoCards: next });
                            }}
                          />
                        </div>
                      ))}
                      {config.visit.infoCards.length === 0 && (
                        <p className="text-[11px] text-dusk">
                          {t("هیچ کارتی نیست — ردیف کارت‌های اطلاعات در سایت خالی می‌ماند.", "No cards — the info-card row will be empty on the site.")}
                        </p>
                      )}
                    </div>

                    {/* inquiry form */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("فرم پیام به ادمین (کارت طلایی)", "Message-to-Admin Form (gold card)")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("تیتر فرم (قسمت ساده)", "Form title — opening")}>
                          <input
                            className={inputCls}
                            value={config.visit.inquiryTitlePrefix}
                            onChange={(e) => updateVisit({ inquiryTitlePrefix: e.target.value })}
                          />
                        </Field>
                        <Field label={t("تیتر فرم (قسمت طلایی)", "Form title — gold part")}>
                          <input
                            className={inputCls}
                            value={config.visit.inquiryTitleHighlight}
                            onChange={(e) => updateVisit({ inquiryTitleHighlight: e.target.value })}
                          />
                        </Field>
                        <Field label={t("راهنمای فیلد نام", "Name field placeholder")}>
                          <input
                            className={inputCls}
                            value={config.visit.namePlaceholder}
                            onChange={(e) => updateVisit({ namePlaceholder: e.target.value })}
                          />
                        </Field>
                        <Field label={t("راهنمای فیلد تماس", "Contact field placeholder")}>
                          <input
                            className={inputCls}
                            value={config.visit.contactPlaceholder}
                            onChange={(e) => updateVisit({ contactPlaceholder: e.target.value })}
                          />
                        </Field>
                        <Field label={t("گزینه پیش‌فرض انتخاب نمونه", "Specimen dropdown default option")}>
                          <input
                            className={inputCls}
                            value={config.visit.generalInquiryLabel}
                            onChange={(e) => updateVisit({ generalInquiryLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("راهنمای فیلد پیام", "Message field placeholder")}>
                          <input
                            className={inputCls}
                            value={config.visit.messagePlaceholder}
                            onChange={(e) => updateVisit({ messagePlaceholder: e.target.value })}
                          />
                        </Field>
                        <Field label={t("متن دکمه ارسال", "Send button text")}>
                          <input
                            className={inputCls}
                            value={config.visit.sendButtonText}
                            onChange={(e) => updateVisit({ sendButtonText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("نام پیش‌فرض فرستنده (وقتی نام خالی است)", "Default sender name (when name is empty)")}>
                          <input
                            className={inputCls}
                            value={config.visit.defaultInquiryName}
                            onChange={(e) => updateVisit({ defaultInquiryName: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیح زیر تیتر فرم", "Form description")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.visit.inquiryDescription}
                          onChange={(e) => updateVisit({ inquiryDescription: e.target.value })}
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("تیتر پیام موفقیت", "Success title")}>
                          <input
                            className={inputCls}
                            value={config.visit.successTitle}
                            onChange={(e) => updateVisit({ successTitle: e.target.value })}
                          />
                        </Field>
                        <Field label={t("دکمه «ارسال پیام دیگر»", "“Send another” button")}>
                          <input
                            className={inputCls}
                            value={config.visit.sendAnotherText}
                            onChange={(e) => updateVisit({ sendAnotherText: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("متن پیام موفقیت — {name} و {contact}", "Success text — {name} and {contact}")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.visit.successText}
                          onChange={(e) => updateVisit({ successText: e.target.value })}
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("پیام خطای اعتبارسنجی فرم", "Form validation error")}>
                          <input
                            className={inputCls}
                            value={config.visit.errorText}
                            onChange={(e) => updateVisit({ errorText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("پیام پیش‌فرض (وقتی متن پیام خالی است)", "Default message (when the message is empty)")}>
                          <input
                            className={inputCls}
                            value={config.visit.defaultInquiryMessage}
                            onChange={(e) => updateVisit({ defaultInquiryMessage: e.target.value })}
                          />
                        </Field>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "پیام‌های ارسال‌شده از این فرم در تب «پیام‌های خریداران» صندوق ورودی می‌نشینند.",
                          "Messages sent through this form land in the Buyer Inbox tab."
                        )}{" "}
                        <button
                          onClick={() => setTab("inquiries")}
                          className="font-bold text-goldbright hover:underline"
                        >
                          {t("مشاهده صندوق پیام‌ها →", "Open the Buyer Inbox →")}
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* 0j. HEADER & NAVIGATION — everything, 0–100 */}
                {tab === "header" && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6">
                      <h3 className="font-display text-2xl text-goldbright">
                        {t("مدیریت کامل هدر و ناوبری", "Header & Navigation — Full Control")}
                      </h3>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                        {t(
                          "همه‌ی محتوای نوار بالای سایت اینجاست: نام و زیرعنوان برند، دکمه‌های ناوبری (برچسب، لینک، توضیح و وعده هر دکمه)، دکمه طلایی تماس و متن‌های منوی موبایل. ترتیب دکمه‌ها از ترتیب سکشن‌ها در تب «مدیریت سکشن‌ها» پیروی می‌کند و مخفی‌کردن هر سکشن، دکمه‌اش را هم برمی‌دارد.",
                          "Everything in the site's top bar lives here: the brand name and subtitle, the navigation buttons (label, link, blurb and promise of each), the gold contact CTA and the mobile-menu texts. Button order follows the section order in the Sections tab, and hiding a section removes its button too."
                        )}
                      </p>
                    </div>

                    {/* brand in header */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("برند در هدر", "Brand in the Header")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("نام گالری (متن جایگزین لوگو و عنوان صفحه)", "Gallery name (logo alt & page titles)")}>
                          <input
                            className={inputCls}
                            value={config.brand.name}
                            onChange={(e) => updateBrand({ name: e.target.value })}
                          />
                        </Field>
                        <Field label={t("زیرعنوان زیر لوگو", "Subtitle under the logo")}>
                          <input
                            className={inputCls}
                            value={config.brand.subtitle}
                            onChange={(e) => updateBrand({ subtitle: e.target.value })}
                          />
                        </Field>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "خودِ نشان طلایی (لوگو) فایل هنری ثابت برند است و از اینجا عوض نمی‌شود؛ نام و زیرعنوان در فوتر و تب تنظیمات کلی هم مشترک‌اند.",
                          "The gold logo artwork itself is a fixed brand asset; the name and subtitle are shared with the footer and the Brand & Contact tab."
                        )}
                      </p>
                    </div>

                    {/* nav items */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-xl text-ivory">
                        {t("دکمه‌های ناوبری", "Navigation Buttons")}
                      </h3>
                      {config.header.navItems.map((n) => (
                        <div key={n.id} className="space-y-3 rounded-2xl border border-edge bg-ink/60 p-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 font-mono text-[9px] font-bold tracking-wide uppercase",
                                n.custom ? "bg-amethyst/20 text-orchid" : "bg-gold/15 text-goldbright"
                              )}
                            >
                              {n.custom ? t("لینک سفارشی", "Custom link") : n.id}
                            </span>
                            <label className="flex items-center gap-2 text-xs font-semibold text-ivory">
                              <input
                                type="checkbox"
                                checked={n.visible}
                                onChange={(e) => updateNavItem(n.id, { visible: e.target.checked })}
                                className="h-4 w-4 accent-gold"
                              />
                              {t("نمایش در هدر", "Show in header")}
                            </label>
                            {n.custom && (
                              <button
                                onClick={() =>
                                  updateHeader({
                                    navItems: config.header.navItems.filter((x) => x.id !== n.id),
                                  })
                                }
                                className="ms-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {t("حذف لینک", "Delete link")}
                              </button>
                            )}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label={t("برچسب دکمه", "Button label")}>
                              <input
                                className={inputCls}
                                value={n.label}
                                onChange={(e) => updateNavItem(n.id, { label: e.target.value })}
                              />
                            </Field>
                            <Field label={t("لینک (href) — مثل #/collection یا https://…", "Link (href) — e.g. #/collection or https://…")}>
                              <input
                                className={inputCls}
                                value={n.href}
                                onChange={(e) => updateNavItem(n.id, { href: e.target.value })}
                              />
                            </Field>
                          </div>
                          <Field label={t("توضیح یک‌خطی (زیر برچسب در منوی موبایل و تول‌تیپ)", "One-line blurb (mobile menu & tooltip)")}>
                            <input
                              className={inputCls}
                              value={n.blurb}
                              onChange={(e) => updateNavItem(n.id, { blurb: e.target.value })}
                            />
                          </Field>
                          <Field label={t("وعده محتوا (بازدیدکننده پشت این دکمه چه می‌یابد)", "Content promise (what waits behind this button)")}>
                            <textarea
                              rows={2}
                              className={inputCls}
                              value={n.promise}
                              onChange={(e) => updateNavItem(n.id, { promise: e.target.value })}
                            />
                          </Field>
                        </div>
                      ))}
                      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-4">
                        <input
                          className={cn(inputCls, "max-w-44 flex-1")}
                          placeholder={t("برچسب لینک جدید…", "New link label…")}
                          value={newNavLabel}
                          onChange={(e) => setNewNavLabel(e.target.value)}
                        />
                        <input
                          className={cn(inputCls, "max-w-56 flex-1")}
                          placeholder="#/collection"
                          value={newNavHref}
                          onChange={(e) => setNewNavHref(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (!newNavLabel.trim()) return;
                            updateHeader({
                              navItems: [
                                ...config.header.navItems,
                                {
                                  id: `custom-nav-${Date.now()}`,
                                  label: newNavLabel.trim(),
                                  blurb: "",
                                  promise: "",
                                  href: newNavHref.trim() || "#/",
                                  visible: true,
                                  custom: true,
                                },
                              ],
                            });
                            setNewNavLabel("");
                            notify(t("لینک سفارشی به هدر اضافه شد", "Custom link added to the header"));
                          }}
                          className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-[11px] font-bold text-ink transition-colors hover:bg-goldbright"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("افزودن لینک", "Add link")}
                        </button>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "دکمه‌های داخلی را نمی‌شود حذف کرد (به سکشنشان وصل‌اند) — با کلید «نمایش در هدر» مخفی‌شان کنید یا خود سکشن را از تب سکشن‌ها مخفی/حذف کنید. لینک‌های سفارشی همیشه آخر ناوبری می‌نشینند و قابل حذف‌اند.",
                          "Built-in buttons can't be deleted (they belong to their sections) — hide them with the visibility switch, or hide/delete the section itself. Custom links always sit at the end of the nav and can be deleted."
                        )}
                      </p>
                    </div>

                    {/* contact CTA */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("دکمه طلایی تماس (CTA)", "Gold Contact CTA")}
                        </h3>
                        <label className="flex items-center gap-2.5 text-sm font-semibold text-ivory">
                          <input
                            type="checkbox"
                            checked={config.header.showContactCta}
                            onChange={(e) => updateHeader({ showContactCta: e.target.checked })}
                            className="h-4 w-4 accent-gold"
                          />
                          {t("نمایش دکمه تماس", "Show contact CTA")}
                        </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("برچسب دکمه", "Button label")}>
                          <input
                            className={inputCls}
                            value={config.header.contactLabel}
                            onChange={(e) => updateHeader({ contactLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("لینک دکمه", "Button link")}>
                          <input
                            className={inputCls}
                            value={config.header.contactHref}
                            onChange={(e) => updateHeader({ contactHref: e.target.value })}
                          />
                        </Field>
                        <Field label={t("توضیح یک‌خطی (منوی موبایل و تول‌تیپ)", "Blurb (mobile menu & tooltip)")}>
                          <input
                            className={inputCls}
                            value={config.header.contactBlurb}
                            onChange={(e) => updateHeader({ contactBlurb: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label={t("وعده محتوا", "Content promise")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.header.contactPromise}
                          onChange={(e) => updateHeader({ contactPromise: e.target.value })}
                        />
                      </Field>
                      <p className="text-[11px] text-dusk">
                        {t(
                          "این دکمه فقط وقتی دیده می‌شود که سکشن «بازدید و تماس» در سایت فعال باشد.",
                          "This button only appears while the Visit & Contact section is active on the site."
                        )}
                      </p>
                    </div>

                    {/* mobile & dropdown texts */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("منوی موبایل و زیرمنوی کابینت‌ها", "Mobile Menu & Cabinets Dropdown")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("عنوان بخش صفحات دسته‌بندی در منوی موبایل", "Mobile menu category-pages heading")}>
                          <input
                            className={inputCls}
                            value={config.header.categoryPagesLabel}
                            onChange={(e) => updateHeader({ categoryPagesLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("پسوند زیر هر کابینت در زیرمنو (پس از شمارش نمونه‌ها)", "Dropdown suffix after the specimen count")}>
                          <input
                            className={inputCls}
                            value={config.header.dropdownPageSuffix}
                            onChange={(e) => updateHeader({ dropdownPageSuffix: e.target.value })}
                          />
                        </Field>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "فهرست کابینت‌های زیرمنو و منوی موبایل خودکار از دسته‌بندی‌های سایت ساخته می‌شود؛ نام، رنگ و ترتیبشان از تب «کابینت‌ها» یا «دسته‌بندی‌ها» مدیریت می‌شود.",
                          "The dropdown and mobile cabinet lists are built automatically from the site's categories; manage their names, colours and order from The Cabinets or Categories tabs."
                        )}{" "}
                        <button
                          onClick={() => setTab("cabinets")}
                          className="font-bold text-goldbright hover:underline"
                        >
                          {t("مدیریت کابینت‌ها →", "Manage cabinets →")}
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* 0k. FOOTER — everything, 0–100 */}
                {tab === "footer" && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-gold/30 bg-surface p-6">
                      <h3 className="font-display text-2xl text-goldbright">
                        {t("مدیریت کامل فوتر", "Footer — Full Control")}
                      </h3>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-dusk">
                        {t(
                          "همه‌ی محتوای پایین سایت اینجاست: جمله معرفی برند و کپی‌رایت، شبکه‌های اجتماعی، ستون‌های لینک، ستون کابینت‌ها و دکمه‌های پایین فوتر. ستون و لینک تازه بسازید، حذف کنید و جابه‌جا کنید.",
                          "Everything at the foot of the site lives here: the brand tagline and copyright, social links, the link columns, the cabinets column and the bottom-bar buttons. Create, delete and rearrange columns and links."
                        )}
                      </p>
                    </div>

                    {/* brand in footer */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("برند و کپی‌رایت", "Brand & Copyright")}
                      </h3>
                      <Field label={t("جمله معرفی زیر لوگو", "Tagline under the logo")}>
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={config.brand.footerTagline}
                          onChange={(e) => updateBrand({ footerTagline: e.target.value })}
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("متن کپی‌رایت (نوار پایین)", "Copyright text (bottom bar)")}>
                          <input
                            className={inputCls}
                            value={config.brand.copyrightText}
                            onChange={(e) => updateBrand({ copyrightText: e.target.value })}
                          />
                        </Field>
                        <Field label={t("زیرعنوان زیر لوگوی فوتر", "Subtitle under the footer lockup")}>
                          <input
                            className={inputCls}
                            value={config.brand.subtitle}
                            onChange={(e) => updateBrand({ subtitle: e.target.value })}
                          />
                        </Field>
                        <Field label={t("شماره تماس نمایشی (کنار آیکن تلفن)", "Displayed phone (beside the phone icon)")}>
                          <input
                            className={inputCls}
                            value={config.contact.phoneDisplay}
                            onChange={(e) => updateContact({ phoneDisplay: e.target.value })}
                          />
                        </Field>
                        <Field label={t("شماره لینک تماس (tel:)", "Phone link number (tel:)")}>
                          <input
                            className={inputCls}
                            value={config.contact.phoneHref}
                            onChange={(e) => updateContact({ phoneHref: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>

                    {/* socials */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("شبکه‌های اجتماعی", "Social Links")}
                        </h3>
                        <label className="flex items-center gap-2.5 text-sm font-semibold text-ivory">
                          <input
                            type="checkbox"
                            checked={config.footer.showSocials}
                            onChange={(e) => updateFooter({ showSocials: e.target.checked })}
                            className="h-4 w-4 accent-gold"
                          />
                          {t("نمایش شبکه‌های اجتماعی", "Show social links")}
                        </label>
                      </div>
                      {config.footer.socials.map((s) => (
                        <div key={s.id} className="flex flex-wrap items-center gap-2">
                          <select
                            className={cn(inputCls, "w-40 [&>option]:bg-surface")}
                            value={s.icon}
                            aria-label={t("آیکون شبکه", "Social icon")}
                            onChange={(e) =>
                              updateFooter({
                                socials: config.footer.socials.map((x) =>
                                  x.id === s.id
                                    ? { ...x, icon: e.target.value as FooterSocial["icon"] }
                                    : x
                                ),
                              })
                            }
                          >
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                            <option value="x">X (Twitter)</option>
                          </select>
                          <input
                            className={cn(inputCls, "min-w-36 flex-1")}
                            value={s.label}
                            aria-label={t("نام شبکه", "Social name")}
                            onChange={(e) =>
                              updateFooter({
                                socials: config.footer.socials.map((x) =>
                                  x.id === s.id ? { ...x, label: e.target.value } : x
                                ),
                              })
                            }
                          />
                          <input
                            className={cn(inputCls, "min-w-52 flex-1")}
                            value={s.href}
                            aria-label={t("لینک شبکه", "Social URL")}
                            onChange={(e) =>
                              updateFooter({
                                socials: config.footer.socials.map((x) =>
                                  x.id === s.id ? { ...x, href: e.target.value } : x
                                ),
                              })
                            }
                          />
                          <button
                            onClick={() =>
                              updateFooter({
                                socials: config.footer.socials.filter((x) => x.id !== s.id),
                              })
                            }
                            className="rounded-lg p-2 text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                            title={t("حذف شبکه اجتماعی", "Delete social link")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          updateFooter({
                            socials: [
                              ...config.footer.socials,
                              {
                                id: `soc-${Date.now()}`,
                                label: "Instagram",
                                href: "https://www.instagram.com",
                                icon: "instagram" as const,
                              },
                            ],
                          })
                        }
                        className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                      >
                        <Plus className="h-3 w-3" /> {t("افزودن شبکه اجتماعی", "Add social link")}
                      </button>
                    </div>

                    {/* cabinets column */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("ستون کابینت‌ها (خودکار)", "Cabinets Column (automatic)")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("عنوان ستون", "Column title")}>
                          <input
                            className={inputCls}
                            value={config.footer.cabinetsTitle}
                            onChange={(e) => updateFooter({ cabinetsTitle: e.target.value })}
                          />
                        </Field>
                        <Field label={t("لینک بازگشت به خانه (پایین ستون)", "Home link at the column foot")}>
                          <input
                            className={inputCls}
                            value={config.footer.exhibitionHomeLabel}
                            onChange={(e) => updateFooter({ exhibitionHomeLabel: e.target.value })}
                          />
                        </Field>
                      </div>
                      <p className="text-[11px] leading-relaxed text-dusk">
                        {t(
                          "لینک‌های این ستون خودکار از دسته‌بندی‌های سایت ساخته می‌شوند.",
                          "This column's links are built automatically from the site's categories."
                        )}{" "}
                        <button
                          onClick={() => setTab("cabinets")}
                          className="font-bold text-goldbright hover:underline"
                        >
                          {t("مدیریت کابینت‌ها →", "Manage cabinets →")}
                        </button>
                      </p>
                    </div>

                    {/* link columns */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-xl text-ivory">
                          {t("ستون‌های لینک فوتر", "Footer Link Columns")}
                        </h3>
                        <button
                          onClick={() =>
                            updateFooter({
                              columns: [
                                ...config.footer.columns,
                                { id: `col-${Date.now()}`, title: "New Column", links: [] },
                              ],
                            })
                          }
                          className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-[11px] font-bold text-ink transition-colors hover:bg-goldbright"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("افزودن ستون", "Add column")}
                        </button>
                      </div>
                      {config.footer.columns.map((col, ci) => (
                        <div key={col.id} className="space-y-3 rounded-2xl border border-edge bg-ink/60 p-4">
                          <div className="flex items-center gap-2">
                            <input
                              className={cn(inputCls, "flex-1 font-bold")}
                              value={col.title}
                              aria-label={t("عنوان ستون", "Column title")}
                              onChange={(e) =>
                                updateFooter({
                                  columns: config.footer.columns.map((c) =>
                                    c.id === col.id ? { ...c, title: e.target.value } : c
                                  ),
                                })
                              }
                            />
                            <button
                              onClick={() => {
                                const next = [...config.footer.columns];
                                [next[ci - 1], next[ci]] = [next[ci], next[ci - 1]];
                                updateFooter({ columns: next });
                              }}
                              disabled={ci === 0}
                              className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                              title={t("ستون قبلی", "Move column before")}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const next = [...config.footer.columns];
                                [next[ci], next[ci + 1]] = [next[ci + 1], next[ci]];
                                updateFooter({ columns: next });
                              }}
                              disabled={ci === config.footer.columns.length - 1}
                              className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                              title={t("ستون بعدی", "Move column after")}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateFooter({
                                  columns: config.footer.columns.filter((c) => c.id !== col.id),
                                })
                              }
                              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {t("حذف ستون", "Delete column")}
                            </button>
                          </div>
                          {col.links.map((l, li) => (
                            <div key={li} className="flex flex-wrap items-center gap-2">
                              <input
                                className={cn(inputCls, "min-w-44 flex-1")}
                                value={l.label}
                                aria-label={t("متن لینک", "Link label")}
                                onChange={(e) =>
                                  updateFooter({
                                    columns: config.footer.columns.map((c) =>
                                      c.id === col.id
                                        ? {
                                            ...c,
                                            links: c.links.map((x, xi) =>
                                              xi === li ? { ...x, label: e.target.value } : x
                                            ),
                                          }
                                        : c
                                    ),
                                  })
                                }
                              />
                              <select
                                className={cn(inputCls, "w-52 [&>option]:bg-surface")}
                                value={l.targetId}
                                aria-label={t("مقصد لینک", "Link destination")}
                                onChange={(e) =>
                                  updateFooter({
                                    columns: config.footer.columns.map((c) =>
                                      c.id === col.id
                                        ? {
                                            ...c,
                                            links: c.links.map((x, xi) =>
                                              xi === li ? { ...x, targetId: e.target.value } : x
                                            ),
                                          }
                                        : c
                                    ),
                                  })
                                }
                              >
                                <option value="highlights">{t("شاهکارها", "Highlights page")}</option>
                                <option value="categories">{t("کابینت‌ها", "Cabinets page")}</option>
                                <option value="collection">{t("کالکشن", "Collection page")}</option>
                                <option value="glow">{t("اتاق درخشش", "Glow Room page")}</option>
                                <option value="deeptime">{t("زمان عمیق", "Deep Time page")}</option>
                                <option value="stories">{t("ژورنال", "Journal page")}</option>
                                <option value="visit">{t("بازدید و تماس", "Visit & Contact page")}</option>
                                <option value="intro">{t("مانیفست (اسکرول در خانه)", "Manifesto (home scroll)")}</option>
                              </select>
                              <button
                                onClick={() =>
                                  updateFooter({
                                    columns: config.footer.columns.map((c) =>
                                      c.id === col.id
                                        ? { ...c, links: c.links.filter((_, xi) => xi !== li) }
                                        : c
                                    ),
                                  })
                                }
                                className="rounded-lg p-2 text-dusk transition-colors hover:bg-rhodo/15 hover:text-rhodo"
                                title={t("حذف لینک", "Delete link")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              updateFooter({
                                columns: config.footer.columns.map((c) =>
                                  c.id === col.id
                                    ? {
                                        ...c,
                                        links: [...c.links, { label: "New link", targetId: "highlights" }],
                                      }
                                    : c
                                ),
                              })
                            }
                            className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-1.5 text-[11px] font-bold text-goldbright transition-colors hover:bg-gold hover:text-ink"
                          >
                            <Plus className="h-3 w-3" /> {t("افزودن لینک", "Add link")}
                          </button>
                        </div>
                      ))}
                      {config.footer.columns.length === 0 && (
                        <p className="text-[11px] text-dusk">
                          {t("همه ستون‌ها حذف شده‌اند — فقط ستون کابینت‌ها در فوتر می‌ماند.", "All columns are deleted — only the cabinets column remains in the footer.")}
                        </p>
                      )}
                    </div>

                    {/* bottom bar */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("نوار پایین و دکمه‌ها", "Bottom Bar & Buttons")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("برچسب دکمه بازگشت به بالا", "Back-to-top label")}>
                          <input
                            className={inputCls}
                            value={config.footer.backToTopLabel}
                            onChange={(e) => updateFooter({ backToTopLabel: e.target.value })}
                          />
                        </Field>
                        <Field label={t("برچسب دکمه پنل ادمین", "Admin Panel button label")}>
                          <input
                            className={inputCls}
                            value={config.footer.adminButtonLabel}
                            onChange={(e) => updateFooter({ adminButtonLabel: e.target.value })}
                          />
                        </Field>
                      </div>
                      <label className="flex items-center gap-2.5 text-sm font-semibold text-ivory">
                        <input
                          type="checkbox"
                          checked={config.footer.showAdminButton}
                          onChange={(e) => updateFooter({ showAdminButton: e.target.checked })}
                          className="h-4 w-4 accent-gold"
                        />
                        {t("نمایش دکمه پنل ادمین در فوتر (دسترسی با #admin و Ctrl+Shift+A همیشه برقرار است)", "Show the Admin Panel button in the footer (#admin and Ctrl+Shift+A always work)")}
                      </label>
                    </div>
                  </div>
                )}

                {/* 1. OVERVIEW & BRAND & CONTACT */}
                {tab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-4">
                      {[
                        { label: t("تعداد کانی‌ها", "Specimens"), val: config.minerals.length },
                        { label: t("دسته‌بندی‌ها", "Categories"), val: config.categories.length },
                        { label: t("عکس‌ها", "Photos"), val: Object.keys(config.media).length },
                        { label: t("پیام‌های جدید", "New Inquiries"), val: unreadCount },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-edge bg-surface p-5">
                          <div className="font-display text-4xl text-goldbright">{stat.val}</div>
                          <div className="mt-1 text-xs font-semibold text-dusk">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-2xl text-ivory">
                        {t("هویت برند و فوتر", "Brand Identity & Footer")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("نام گالری", "Gallery Name")}>
                          <input
                            className={inputCls}
                            value={config.brand.name}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, brand: { ...p.brand, name: e.target.value } }))
                            }
                          />
                        </Field>
                        <Field label={t("زیرعنوان برند", "Subtitle")}>
                          <input
                            className={inputCls}
                            value={config.brand.subtitle}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, brand: { ...p.brand, subtitle: e.target.value } }))
                            }
                          />
                        </Field>
                        <Field label={t("برچسب عمودی هیرو", "Hero Margin Rail Label")}>
                          <input
                            className={inputCls}
                            value={config.brand.estLabel}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, brand: { ...p.brand, estLabel: e.target.value } }))
                            }
                          />
                        </Field>
                        <Field label={t("متن کپی‌رایت فوتر", "Footer Copyright")}>
                          <input
                            className={inputCls}
                            value={config.brand.copyrightText}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, brand: { ...p.brand, copyrightText: e.target.value } }))
                            }
                          />
                        </Field>
                      </div>
                      <Field label={t("توضیح کوتاه فوتر", "Footer Tagline")}>
                        <textarea
                          rows={2}
                          className={inputCls}
                          value={config.brand.footerTagline}
                          onChange={(e) =>
                            setConfig((p) => ({ ...p, brand: { ...p.brand, footerTagline: e.target.value } }))
                          }
                        />
                      </Field>
                    </div>

                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-4">
                      <h3 className="font-display text-2xl text-ivory">
                        {t("راه‌های ارتباط مستقیم با خریداران (تلفن و پیام)", "Direct Buyer Contact Channels")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t("شماره تماس نمایشی", "Phone Display")}>
                          <input
                            className={inputCls}
                            value={config.contact.phoneDisplay}
                            onChange={(e) =>
                              setConfig((p) => ({
                                ...p,
                                contact: { ...p.contact, phoneDisplay: e.target.value },
                              }))
                            }
                          />
                        </Field>
                        <Field label={t("شماره تماس لینک (بدون فاصله)", "Phone Link (tel:)")}>
                          <input
                            className={inputCls}
                            value={config.contact.phoneHref}
                            onChange={(e) =>
                              setConfig((p) => ({
                                ...p,
                                contact: { ...p.contact, phoneHref: e.target.value },
                              }))
                            }
                          />
                        </Field>
                        <Field label={t("شماره واتساپ (با کد کشور بدون +)", "WhatsApp Number (with country code)")}>
                          <input
                            className={inputCls}
                            value={config.contact.whatsappNumber}
                            onChange={(e) =>
                              setConfig((p) => ({
                                ...p,
                                contact: { ...p.contact, whatsappNumber: e.target.value },
                              }))
                            }
                          />
                        </Field>
                        <Field label={t("آیدی تلگرام (بدون @)", "Telegram Handle")}>
                          <input
                            className={inputCls}
                            value={config.contact.telegramHandle}
                            onChange={(e) =>
                              setConfig((p) => ({
                                ...p,
                                contact: { ...p.contact, telegramHandle: e.target.value },
                              }))
                            }
                          />
                        </Field>
                        <Field label={t("ایمیل", "Email")}>
                          <input
                            className={inputCls}
                            value={config.contact.email}
                            onChange={(e) =>
                              setConfig((p) => ({
                                ...p,
                                contact: { ...p.contact, email: e.target.value },
                              }))
                            }
                          />
                        </Field>
                        <Field label={t("ساعات پاسخگویی", "Availability Note")}>
                          <input
                            className={inputCls}
                            value={config.contact.availabilityNote}
                            onChange={(e) =>
                              setConfig((p) => ({
                                ...p,
                                contact: { ...p.contact, availabilityNote: e.target.value },
                              }))
                            }
                          />
                        </Field>
                      </div>
                      <Field label={t("آدرس گالری", "Showroom Address")}>
                        <input
                          className={inputCls}
                          value={config.contact.address}
                          onChange={(e) =>
                            setConfig((p) => ({
                              ...p,
                              contact: { ...p.contact, address: e.target.value },
                            }))
                          }
                        />
                      </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-edge bg-surface p-6">
                      <div>
                        <h3 className="font-display text-xl text-ivory">
                          {t("پشتیبان‌گیری و بازیابی کامل سایت", "Backup, Restore & Reset")}
                        </h3>
                        <p className="mt-1 text-xs text-dusk">
                          {t(
                            "تمام تغییرات شما خودکار در مرورگر ذخیره می‌شود. می‌توانید خروجی JSON بگیرید.",
                            "Changes auto-save locally. Export or import a full JSON backup anytime."
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={handleExportJson}
                          className="inline-flex items-center gap-2 rounded-full border border-edge bg-abyss px-4 py-2.5 text-xs font-bold text-ivory hover:border-gold"
                        >
                          <Download className="h-3.5 w-3.5 text-gold" />
                          {t("دانلود بکاپ JSON", "Export JSON")}
                        </button>
                        <button
                          onClick={() => jsonImportRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-full border border-edge bg-abyss px-4 py-2.5 text-xs font-bold text-ivory hover:border-malachite"
                        >
                          <Upload className="h-3.5 w-3.5 text-malachite" />
                          {t("بازگردانی JSON", "Import JSON")}
                        </button>
                        <input
                          ref={jsonImportRef}
                          type="file"
                          accept="application/json"
                          onChange={handleImportJson}
                          className="hidden"
                        />
                        <button
                          onClick={() => {
                            if (confirm(t("همه تنظیمات به حالت اولیه برگردد؟", "Reset all content to factory defaults?"))) {
                              resetAll();
                              notify(t("به حالت پیش‌فرض بازگشت", "Reset to factory defaults"));
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-rhodo/50 bg-rhodo/15 px-4 py-2.5 text-xs font-bold text-rhodo hover:bg-rhodo/25"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {t("بازنشانی کامل", "Reset Defaults")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SECTIONS MANAGER */}
                {tab === "sections" && (
                  <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
                    <div className="space-y-3 rounded-3xl border border-edge bg-surface p-5">
                      <h3 className="font-display text-xl text-ivory">
                        {t("ترتیب و نمایش سکشن‌ها", "Section Order & Visibility")}
                      </h3>
                      <p className="text-xs text-dusk">
                        {t(
                          "هر سکشن را مخفی/نمایش دهید، جابه‌جا کنید یا برای ویرایش انتخاب کنید.",
                          "Toggle, reorder, or select any section to edit its full content."
                        )}
                      </p>
                      <div className="space-y-2 pt-2">
                        {config.sectionsOrder.map((sec, idx) => (
                          <div
                            key={sec.id}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-2xl border p-2.5 transition-all",
                              activeSection === sec.id
                                ? "border-gold bg-raised"
                                : "border-edge bg-abyss/60"
                            )}
                          >
                            <button
                              onClick={() => setActiveSection(sec.id)}
                              className="flex-1 text-start text-xs font-bold text-ivory hover:text-goldbright"
                            >
                              <span className="me-2 font-mono text-[10px] text-gold">0{idx + 1}</span>
                              {sec.label}
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveSection(sec.id, -1)}
                                disabled={idx === 0}
                                className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                title={t("بالا", "Move up")}
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => moveSection(sec.id, 1)}
                                disabled={idx === config.sectionsOrder.length - 1}
                                className="rounded-lg p-1.5 text-mist hover:bg-surface disabled:opacity-25"
                                title={t("پایین", "Move down")}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => toggleSectionVisibility(sec.id)}
                                className={cn(
                                  "rounded-lg p-1.5 transition-colors",
                                  sec.visible
                                    ? "text-malachite hover:bg-malachite/15"
                                    : "text-rhodo hover:bg-rhodo/15"
                                )}
                                title={sec.visible ? t("مخفی کردن", "Hide") : t("نمایش دادن", "Show")}
                              >
                                {sec.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() =>
                                  armedDeleteId === sec.id
                                    ? deleteSection(sec.id)
                                    : setArmedDeleteId(sec.id)
                                }
                                onBlur={() =>
                                  setTimeout(() => setArmedDeleteId(null), 2500)
                                }
                                className={cn(
                                  "rounded-lg p-1.5 transition-colors",
                                  armedDeleteId === sec.id
                                    ? "bg-rhodo px-2 text-[10px] font-bold text-ink"
                                    : "text-dusk hover:bg-rhodo/15 hover:text-rhodo"
                                )}
                                title={
                                  armedDeleteId === sec.id
                                    ? t("برای تأیید حذف دوباره کلیک کنید", "Click again to confirm delete")
                                    : t("حذف سکشن", "Delete section")
                                }
                              >
                                {armedDeleteId === sec.id ? (
                                  t("مطمئنی؟", "Sure?")
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ——— Add / restore sections ——— */}
                      <div className="space-y-3 border-t border-edge/60 pt-4">
                        <div className="text-xs font-bold tracking-wide text-gold uppercase">
                          {t("افزودن سکشن", "Add a Section")}
                        </div>
                        <input
                          className={inputCls}
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                          placeholder={t("نام سکشن جدید…", "New section name…")}
                        />
                        <div className="flex gap-2">
                          <select
                            className={cn(inputCls, "flex-1 [&>option]:bg-surface")}
                            value={newSectionLayout}
                            onChange={(e) =>
                              setNewSectionLayout(e.target.value as CustomSectionItem["layout"])
                            }
                            aria-label={t("چیدمان", "Layout")}
                          >
                            <option value="split">{t("دو ستونه + عکس", "Split + photo")}</option>
                            <option value="center">{t("وسط‌چین", "Centred")}</option>
                            <option value="cards">{t("کارت‌های نکته", "Point cards")}</option>
                          </select>
                          <button
                            onClick={createCustomSection}
                            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gold px-4 text-xs font-bold text-[#1a1206] hover:bg-goldbright"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {t("ساختن", "Create")}
                          </button>
                        </div>
                        <p className="text-[11px] leading-relaxed text-dusk">
                          {t(
                            "سکشن ساخته‌شده فوراً به انتهای صفحه اصلی اضافه و برای ویرایش کامل (متن، عکس، رنگ، نکته‌ها و دکمه) انتخاب می‌شود.",
                            "The new section appears at the end of the home page at once and opens here for full editing — text, photo, accent, points and CTA."
                          )}
                        </p>
                        {missingBuiltins.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-dusk uppercase">
                              {t("بازگردانی سکشن‌های داخلی حذف‌شده", "Restore deleted built-in sections")}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {missingBuiltins.map((def) => (
                                <button
                                  key={def.id}
                                  onClick={() => restoreBuiltin(def.id, def.label)}
                                  className="rounded-full border border-edge bg-abyss px-3 py-1.5 text-[11px] font-bold text-mist transition-colors hover:border-gold/60 hover:text-goldbright"
                                >
                                  + {def.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Detail Editor */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      {activeSection === "hero" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("سکشن هیرو — تب اختصاصی", "Hero Section — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای هیرو (تیترها، اسلایدر نمونه‌ها، آمار، پس‌زمینه‌ها، مهر چرخان و نوار متحرک) حالا در تب اول پنل، یعنی «سکشن هیرو»، مدیریت می‌شود. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All hero content (headlines, specimen slider, statistics, backdrops, rotating seal and ticker) now lives in the first panel tab, “Hero Section”. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("hero")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <Sparkles className="h-4 w-4" />
                            {t("رفتن به تب سکشن هیرو", "Open the Hero Section tab")}
                          </button>
                        </div>
                      )}

                      {activeSection === "intro" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("مانیفست کیوریتور — تب اختصاصی", "Curatorial Manifesto — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (نقل‌قول بزرگ، امضای کیوریتور، پاراگراف‌ها، کاشی‌های آماری و بنر مشاوره) حالا در تب دوم پنل، یعنی «مانیفست کیوریتور»، مدیریت می‌شود. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (big quote, curator signature, paragraphs, stat tiles and the consultation banner) now lives in the second panel tab, “Curatorial Manifesto”. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("intro")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <ScrollText className="h-4 w-4" />
                            {t("رفتن به تب مانیفست کیوریتور", "Open the Curatorial Manifesto tab")}
                          </button>
                        </div>
                      )}

                      {activeSection === "highlights" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("شاهکارهای سالن — تب اختصاصی", "Masterworks of the Salon — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (تیتر و فهرست شاهکارها با تیتر و داستان هر نمونه) حالا در تب سوم پنل، یعنی «شاهکارهای سالن»، مدیریت می‌شود. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (heading and the masterwork list with each specimen's title and story) now lives in the third panel tab, “Masterworks of the Salon”. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("highlights")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <Crown className="h-4 w-4" />
                            {t("رفتن به تب شاهکارهای سالن", "Open the Masterworks tab")}
                          </button>
                        </div>
                      )}

                      {activeSection === "collection" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("کاتالوگ نمونه‌ها — تب اختصاصی", "Catalogue Raisonné — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (تیتر، نوار جستجو و مرتب‌سازی، متن کارت‌ها و فهرست نمونه‌ها) حالا در تب پنجم پنل، یعنی «کاتالوگ نمونه‌ها»، مدیریت می‌شود. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (heading, search & sort toolbar, card texts and the specimen roster) now lives in the fifth panel tab, “Catalogue Raisonné”. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("collection")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <BookOpen className="h-4 w-4" />
                            {t("رفتن به تب کاتالوگ نمونه‌ها", "Open the Catalogue tab")}
                          </button>
                        </div>
                      )}

                      {activeSection === "deeptime" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("گاه‌شمار زمین — تب اختصاصی", "Planetary Chronology — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (تیتر و فصل‌های تایم‌لاین زمان عمیق) حالا در تب هفتم پنل، یعنی «گاه‌شمار زمین»، مدیریت می‌شود؛ تب قدیمی تایم‌لاین هم در آن ادغام شده است. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (heading and the Deep Time timeline chapters) now lives in the seventh panel tab, “Planetary Chronology” — the old timeline tab is merged into it. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("deeptime")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <Hourglass className="h-4 w-4" />
                            {t("رفتن به تب گاه‌شمار زمین", "Open the Planetary Chronology tab")}
                          </button>
                        </div>
                      )}

                      {activeSection === "stories" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("ژورنال کیوریتور — تب اختصاصی", "Curatorial Journal — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (تیتر و مقاله‌های ژورنال) حالا در تب هشتم پنل، یعنی «ژورنال کیوریتور»، مدیریت می‌شود؛ تب قدیمی مقالات هم در آن ادغام شده است. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (heading and the journal articles) now lives in the eighth panel tab, “Curatorial Journal” — the old articles tab is merged into it. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("stories")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <Newspaper className="h-4 w-4" />
                            {t("رفتن به تب ژورنال کیوریتور", "Open the Curatorial Journal tab")}
                          </button>
                        </div>
                      )}

                      {activeSection === "categories" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("کابینت‌ها — تب اختصاصی", "The Cabinets — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (تیتر و کارت‌های کابینت با ساخت/حذف/تغییر نام و رنگ/جابه‌جایی) حالا در تب چهارم پنل، یعنی «کابینت‌ها»، مدیریت می‌شود. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (heading and the cabinet cards — create, delete, rename, recolour, reorder) now lives in the fourth panel tab, “The Cabinets”. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("cabinets")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <LayoutGrid className="h-4 w-4" />
                            {t("رفتن به تب کابینت‌ها", "Open The Cabinets tab")}
                          </button>
                        </div>
                      )}

                      {activeSection.startsWith("custom-") &&
                        (() => {
                          const cs = config.customSections.find((s) => s.id === activeSection);
                          if (!cs) {
                            return (
                              <p className="text-sm text-dusk">
                                {t(
                                  "این سکشن سفارشی دیگر وجود ندارد.",
                                  "This custom section no longer exists."
                                )}
                              </p>
                            );
                          }
                          const patch = (p: Partial<CustomSectionItem>) =>
                            setConfig((prev) => ({
                              ...prev,
                              customSections: prev.customSections.map((s) =>
                                s.id === cs.id ? { ...s, ...p } : s
                              ),
                              sectionsOrder:
                                p.label !== undefined
                                  ? prev.sectionsOrder.map((s) =>
                                      s.id === cs.id ? { ...s, label: p.label! } : s
                                    )
                                  : prev.sectionsOrder,
                            }));
                          return (
                            <>
                              <h3 className="font-display text-2xl text-goldbright">
                                {t("ویرایش سکشن سفارشی", "Edit Custom Section")}
                                <span className="ms-3 rounded-full border border-gold/50 px-2.5 py-1 align-middle font-mono text-[9px] tracking-[0.18em] text-gold uppercase">
                                  {cs.id}
                                </span>
                              </h3>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <Field label={t("نام در فهرست سکشن‌ها", "Name in Section List")}>
                                  <input
                                    className={inputCls}
                                    value={cs.label}
                                    onChange={(e) => patch({ label: e.target.value })}
                                  />
                                </Field>
                                <Field label={t("چیدمان", "Layout")}>
                                  <select
                                    className={cn(inputCls, "[&>option]:bg-surface")}
                                    value={cs.layout}
                                    onChange={(e) =>
                                      patch({ layout: e.target.value as CustomSectionItem["layout"] })
                                    }
                                  >
                                    <option value="split">{t("دو ستونه + عکس", "Split + photo")}</option>
                                    <option value="center">{t("وسط‌چین", "Centred")}</option>
                                    <option value="cards">{t("کارت‌های نکته", "Point cards")}</option>
                                  </select>
                                </Field>
                                <Field label={t("متن کوچک بالا (Overline)", "Overline")}>
                                  <input
                                    className={inputCls}
                                    value={cs.overline}
                                    onChange={(e) => patch({ overline: e.target.value })}
                                  />
                                </Field>
                                <Field label={t("رنگ لهجه (Accent)", "Accent Colour")}>
                                  <span className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={cs.accent}
                                      onChange={(e) => patch({ accent: e.target.value })}
                                      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-edge bg-ink"
                                    />
                                    <input
                                      className={inputCls}
                                      value={cs.accent}
                                      onChange={(e) => patch({ accent: e.target.value })}
                                    />
                                  </span>
                                </Field>
                                <Field label={t("تیتر (قسمت ساده)", "Title Prefix")}>
                                  <input
                                    className={inputCls}
                                    value={cs.titlePrefix}
                                    onChange={(e) => patch({ titlePrefix: e.target.value })}
                                  />
                                </Field>
                                <Field label={t("تیتر (قسمت رنگی)", "Title Highlight")}>
                                  <input
                                    className={inputCls}
                                    value={cs.titleHighlight}
                                    onChange={(e) => patch({ titleHighlight: e.target.value })}
                                  />
                                </Field>
                              </div>
                              <Field label={t("زیرتیتر", "Subtitle / Standfirst")}>
                                <textarea
                                  rows={2}
                                  className={inputCls}
                                  value={cs.subtitle}
                                  onChange={(e) => patch({ subtitle: e.target.value })}
                                />
                              </Field>
                              <Field label={t("متن اصلی", "Main Body Text")}>
                                <textarea
                                  rows={4}
                                  className={inputCls}
                                  value={cs.body}
                                  onChange={(e) => patch({ body: e.target.value })}
                                />
                              </Field>
                              <PhotoPicker
                                label={t("عکس سکشن (از کتابخانه رسانه)", "Section Photo (Media Library)")}
                                value={cs.photoId}
                                media={config.media}
                                onChange={(photoId) => patch({ photoId })}
                              />
                              <div className="space-y-2 border-t border-edge/60 pt-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gold uppercase">
                                    {t("نکته‌ها / کارت‌ها", "Points / Cards")}
                                  </span>
                                  <button
                                    onClick={() => patch({ points: [...cs.points, ""] })}
                                    className="flex items-center gap-1 rounded-full border border-gold/50 px-3 py-1.5 text-[11px] font-bold text-goldbright hover:bg-gold hover:text-ink"
                                  >
                                    <Plus className="h-3 w-3" /> {t("افزودن نکته", "Add point")}
                                  </button>
                                </div>
                                {cs.points.map((pt, i) => (
                                  <div key={i} className="flex gap-2">
                                    <input
                                      className={inputCls}
                                      value={pt}
                                      placeholder={t("متن نکته…", "Point text…")}
                                      onChange={(e) => {
                                        const next = [...cs.points];
                                        next[i] = e.target.value;
                                        patch({ points: next });
                                      }}
                                    />
                                    <button
                                      onClick={() =>
                                        patch({ points: cs.points.filter((_, j) => j !== i) })
                                      }
                                      className="shrink-0 rounded-xl border border-edge px-3 text-dusk hover:border-rhodo/60 hover:text-rhodo"
                                      aria-label={t("حذف نکته", "Delete point")}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="grid gap-4 border-t border-edge/60 pt-4 sm:grid-cols-2">
                                <Field label={t("متن دکمه (CTA)", "Button Text")}>
                                  <input
                                    className={inputCls}
                                    value={cs.ctaText}
                                    onChange={(e) => patch({ ctaText: e.target.value })}
                                    placeholder={t("خالی = بدون دکمه", "Empty = no button")}
                                  />
                                </Field>
                                <Field label={t("لینک دکمه", "Button Link")}>
                                  <input
                                    className={inputCls}
                                    value={cs.ctaHref}
                                    onChange={(e) => patch({ ctaHref: e.target.value })}
                                    placeholder="#/collection · #/contact · https://…"
                                  />
                                </Field>
                              </div>
                              <button
                                onClick={() =>
                                  armedDeleteId === cs.id
                                    ? deleteSection(cs.id)
                                    : setArmedDeleteId(cs.id)
                                }
                                className={cn(
                                  "rounded-full px-5 py-2.5 text-xs font-bold transition-colors",
                                  armedDeleteId === cs.id
                                    ? "bg-rhodo text-ink"
                                    : "border border-rhodo/50 text-rhodo hover:bg-rhodo/10"
                                )}
                              >
                                {armedDeleteId === cs.id
                                  ? t("برای تأیید حذف دوباره کلیک کنید", "Click again to delete permanently")
                                  : t("حذف کامل این سکشن", "Delete this section permanently")}
                              </button>
                            </>
                          );
                        })()}

                      {activeSection === "glow" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("اتاق درخشش (UV) — تب اختصاصی", "Glow Room (UV Lab) — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (تیتر، عکس صحنه و کپشن‌ها، کنسول لامپ و جدول گسیل مواد) حالا در تب ششم پنل، یعنی «اتاق درخشش (UV)»، مدیریت می‌شود. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (heading, stage photo and captions, lamp console and the emission table) now lives in the sixth panel tab, “Glow Room (UV)”. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("glow")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <FlaskConical className="h-4 w-4" />
                            {t("رفتن به تب اتاق درخشش", "Open the Glow Room tab")}
                          </button>
                        </div>
                      )}

                      {activeSection === "visit" && (
                        <div className="space-y-4">
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("بازدید و تماس — تب اختصاصی", "Visit & Contact — Dedicated Tab")}
                          </h3>
                          <p className="max-w-xl text-sm leading-relaxed text-mist">
                            {t(
                              "همه‌ی محتوای این سکشن (بنر تور مجازی، گام‌های پروتکل خرید، کانال‌های تماس، کارت‌های اطلاعات و فرم پیام) حالا در تب نهم پنل، یعنی «بازدید و تماس»، مدیریت می‌شود. اینجا فقط ترتیب، نمایش و حذف ساختاری سکشن‌ها انجام می‌شود.",
                              "All of this section's content (virtual-tour banner, protocol steps, contact channels, info cards and the message form) now lives in the ninth panel tab, “Visit & Contact”. This tab only handles section order, visibility and structural deletion."
                            )}
                          </p>
                          <button
                            onClick={() => setTab("visit")}
                            className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-goldbright"
                          >
                            <MapPin className="h-4 w-4" />
                            {t("رفتن به تب بازدید و تماس", "Open the Visit & Contact tab")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. MINERALS / SPECIMENS CRUD */}
                {tab === "minerals" && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <input
                        type="search"
                        value={mineralSearch}
                        onChange={(e) => setMineralSearch(e.target.value)}
                        placeholder={t("جستجوی کانی…", "Search specimens…")}
                        className={cn(inputCls, "max-w-sm")}
                      />
                      <button
                        onClick={startNewMineral}
                        className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-[#1a1206] hover:bg-goldbright"
                      >
                        <Plus className="h-4 w-4" />
                        {t("افزودن کانی جدید", "Add New Specimen")}
                      </button>
                    </div>

                    {editingMineral && (
                      <div className="rounded-3xl border border-gold/40 bg-surface p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-2xl text-goldbright">
                            {editingMineral.name
                              ? `${t("ویرایش", "Edit")}: ${editingMineral.name}`
                              : t("افزودن نمونه جدید", "New Specimen")}
                          </h3>
                          <button
                            onClick={() => setEditingMineral(null)}
                            className="rounded-full p-2 text-mist hover:bg-abyss"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <Field label={t("نام نمونه *", "Specimen Name *")}>
                            <input
                              className={inputCls}
                              value={editingMineral.name}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, name: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("کد کاتالوگ", "Catalog ID")}>
                            <input
                              className={inputCls}
                              value={editingMineral.catalog}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, catalog: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("دسته‌بندی", "Category")}>
                            <select
                              className={cn(inputCls, "[&>option]:bg-surface")}
                              value={editingMineral.category}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, category: e.target.value })
                              }
                            >
                              {config.categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label={t("لقب / زیرعنوان", "Epithet")}>
                            <input
                              className={inputCls}
                              value={editingMineral.epithet}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, epithet: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("فرمول شیمیایی", "Formula")}>
                            <input
                              className={inputCls}
                              value={editingMineral.formula}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, formula: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("محل کشف / معدن", "Locality")}>
                            <input
                              className={inputCls}
                              value={editingMineral.locality}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, locality: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("سیستم بلوری", "Crystal System")}>
                            <input
                              className={inputCls}
                              value={editingMineral.system}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, system: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("جلا", "Luster")}>
                            <input
                              className={inputCls}
                              value={editingMineral.luster}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, luster: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("ابعاد و وزن", "Dimensions")}>
                            <input
                              className={inputCls}
                              value={editingMineral.size}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, size: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("سختی موس (عدد)", "Mohs Number (1-10)")}>
                            <input
                              type="number"
                              step="0.25"
                              min="1"
                              max="10"
                              className={inputCls}
                              value={editingMineral.mohs}
                              onChange={(e) =>
                                setEditingMineral({
                                  ...editingMineral,
                                  mohs: Number(e.target.value),
                                  mohsLabel: e.target.value,
                                })
                              }
                            />
                          </Field>
                          <Field label={t("کمیابی (۱ تا ۵)", "Rarity (1-5)")}>
                            <select
                              className={cn(inputCls, "[&>option]:bg-surface")}
                              value={editingMineral.rarity}
                              onChange={(e) =>
                                setEditingMineral({
                                  ...editingMineral,
                                  rarity: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                                })
                              }
                            >
                              {[1, 2, 3, 4, 5].map((r) => (
                                <option key={r} value={r}>
                                  {r} / 5
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label={t("رنگ تاکیدی", "Accent Color")}>
                            <input
                              type="color"
                              className="h-10 w-full cursor-pointer rounded-xl border border-edge bg-ink p-1"
                              value={editingMineral.accent}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, accent: e.target.value })
                              }
                            />
                          </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label={t("اصالت و پیشینه (Provenance)", "Provenance & Pedigree")}>
                            <input
                              className={inputCls}
                              placeholder="Ex. Private Estate · Pocket Year"
                              value={editingMineral.provenance ?? ""}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, provenance: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("درجه کیفی نمایشگاهی (Grade)", "Exhibition Grade")}>
                            <input
                              className={inputCls}
                              placeholder="Museum Cabinet Masterpiece"
                              value={editingMineral.grade ?? ""}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, grade: e.target.value })
                              }
                            />
                          </Field>
                        </div>

                        <PhotoPicker
                          label={t("انتخاب عکس از کتابخانه", "Specimen Photo")}
                          value={editingMineral.photoId}
                          media={config.media}
                          onChange={(photoId) => setEditingMineral({ ...editingMineral, photoId })}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label={t("داستان و توضیحات کامل", "Story")}>
                            <textarea
                              rows={3}
                              className={inputCls}
                              value={editingMineral.story}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, story: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("یادداشت کیوریتور", "Curator's Note")}>
                            <textarea
                              rows={3}
                              className={inputCls}
                              value={editingMineral.curatorNote}
                              onChange={(e) =>
                                setEditingMineral({ ...editingMineral, curatorNote: e.target.value })
                              }
                            />
                          </Field>
                        </div>

                        <div className="rounded-2xl border border-edge bg-abyss/60 p-4 space-y-3">
                          <label className="flex items-center gap-2.5 text-xs font-bold text-goldbright">
                            <input
                              type="checkbox"
                              checked={Boolean(editingMineral.highlight)}
                              onChange={(e) =>
                                setEditingMineral({
                                  ...editingMineral,
                                  highlight: e.target.checked
                                    ? {
                                        index: "05",
                                        title: editingMineral.epithet || editingMineral.name,
                                        body: editingMineral.story,
                                      }
                                    : undefined,
                                })
                              }
                              className="accent-gold"
                            />
                            <Sparkles className="h-3.5 w-3.5" />
                            {t("نمایش در سکشن شاهکارهای نمایشگاه (Highlights)", "Feature in Exhibition Highlights")}
                          </label>
                          {editingMineral.highlight && (
                            <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
                              <input
                                className={inputCls}
                                placeholder="01"
                                value={editingMineral.highlight.index}
                                onChange={(e) =>
                                  setEditingMineral({
                                    ...editingMineral,
                                    highlight: { ...editingMineral.highlight!, index: e.target.value },
                                  })
                                }
                              />
                              <input
                                className={inputCls}
                                placeholder="Highlight Title"
                                value={editingMineral.highlight.title}
                                onChange={(e) =>
                                  setEditingMineral({
                                    ...editingMineral,
                                    highlight: { ...editingMineral.highlight!, title: e.target.value },
                                  })
                                }
                              />
                              <textarea
                                rows={2}
                                className={cn(inputCls, "sm:col-span-2")}
                                placeholder="Highlight Body"
                                value={editingMineral.highlight.body}
                                onChange={(e) =>
                                  setEditingMineral({
                                    ...editingMineral,
                                    highlight: { ...editingMineral.highlight!, body: e.target.value },
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setEditingMineral(null)}
                            className="rounded-full border border-edge px-5 py-2.5 text-xs font-bold text-mist"
                          >
                            {t("انصراف", "Cancel")}
                          </button>
                          <button
                            onClick={() => {
                              if (!editingMineral.name.trim()) return;
                              upsertMineral(editingMineral);
                              setEditingMineral(null);
                              notify(t("کانی ذخیره شد", "Specimen saved"));
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-bold text-[#1a1206] hover:bg-goldbright"
                          >
                            <Save className="h-4 w-4" />
                            {t("ذخیره کانی", "Save Specimen")}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredMinerals.map((m) => {
                        const ph = config.media[m.photoId] ?? Object.values(config.media)[0];
                        return (
                          <div
                            key={m.id}
                            className="flex flex-col justify-between rounded-3xl border border-edge bg-surface p-4"
                          >
                            <div className="flex items-center gap-3.5">
                              {ph && (
                                <img
                                  src={ph.thumbnail || ph.src}
                                  alt={m.name}
                                  className="h-16 w-16 shrink-0 rounded-2xl bg-plate object-contain p-1.5"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-mono text-[10px] text-dusk">{m.catalog}</div>
                                <div className="truncate font-display text-xl text-ivory">{m.name}</div>
                                <div className="text-xs text-goldbright">{m.category}</div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-edge/50 pt-3">
                              <button
                                onClick={() => setEditingMineral(m)}
                                className="rounded-full border border-edge px-4 py-1.5 text-xs font-bold text-ivory hover:border-gold hover:text-goldbright"
                              >
                                {t("ویرایش", "Edit")}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(t(`"${m.name}" حذف شود؟`, `Delete ${m.name}?`))) {
                                    deleteMineral(m.id);
                                    notify(t("حذف شد", "Deleted"));
                                  }
                                }}
                                className="rounded-full p-2 text-rhodo hover:bg-rhodo/15"
                                title={t("حذف", "Delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. CATEGORIES CRUD */}
                {tab === "categories" && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-edge bg-surface p-6">
                      <h3 className="font-display text-2xl text-ivory">
                        {t("افزودن دسته‌بندی جدید", "Add New Category")}
                      </h3>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <input
                          className={cn(inputCls, "max-w-xs flex-1")}
                          placeholder={t("نام دسته‌بندی…", "Category name…")}
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                        />
                        <input
                          type="color"
                          className="h-11 w-14 cursor-pointer rounded-xl border border-edge bg-ink p-1"
                          value={newCatColor}
                          onChange={(e) => setNewCatColor(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (!newCatName.trim()) return;
                            addCategory(newCatName, newCatColor);
                            setNewCatName("");
                            notify(t("دسته‌بندی اضافه شد", "Category added"));
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-bold text-[#1a1206] hover:bg-goldbright"
                        >
                          <Plus className="h-4 w-4" />
                          {t("افزودن", "Add")}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {config.categories.map((cat) => {
                        const usedCount = config.minerals.filter((m) => m.category === cat.name).length;
                        return (
                          <div
                            key={cat.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edge bg-surface p-4"
                          >
                            <div className="flex flex-1 items-center gap-3">
                              <input
                                type="color"
                                className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-edge bg-ink p-1"
                                value={cat.color}
                                onChange={(e) => updateCategory(cat.id, cat.name, e.target.value)}
                              />
                              <input
                                className={cn(inputCls, "max-w-xs")}
                                value={cat.name}
                                onChange={(e) => updateCategory(cat.id, e.target.value, cat.color)}
                              />
                              <span className="font-mono text-xs text-dusk">
                                {usedCount} {t("نمونه", "items")}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (config.categories.length <= 1) {
                                  notify(t("حداقل یک دسته‌بندی لازم است", "Keep at least one category"));
                                  return;
                                }
                                deleteCategory(cat.id);
                                notify(t("دسته‌بندی حذف شد", "Category deleted"));
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-rhodo/40 px-3.5 py-2 text-xs font-bold text-rhodo hover:bg-rhodo/15"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {t("حذف", "Delete")}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. MEDIA / PHOTOS LIBRARY */}
                {tab === "media" && (
                  <div className="space-y-6">
                    <div className="grid gap-4 rounded-3xl border border-edge bg-surface p-6 lg:grid-cols-2">
                      <div className="space-y-3">
                        <h3 className="font-display text-2xl text-ivory">
                          {t("آپلود عکس از سیستم", "Upload Photo from Device")}
                        </h3>
                        <p className="text-xs text-dusk">
                          {t(
                            "عکس‌ها به صورت خودکار بهینه شده و در گالری ذخیره می‌شوند.",
                            "Uploaded photos are automatically optimized and stored in the Media Library."
                          )}
                        </p>
                        <button
                          onClick={() => fileUploadRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-bold text-[#1a1206] hover:bg-goldbright"
                        >
                          <Upload className="h-4 w-4" />
                          {t("انتخاب فایل تصویر", "Choose Image File")}
                        </button>
                        <input
                          ref={fileUploadRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadImage}
                          className="hidden"
                        />
                      </div>

                      <div className="space-y-3 border-t border-edge/50 pt-4 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
                        <h3 className="font-display text-2xl text-ivory">
                          {t("افزودن با لینک (URL)", "Add Photo by URL")}
                        </h3>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <input
                            className={inputCls}
                            placeholder={t("عنوان عکس *", "Subject *")}
                            value={urlPhotoSubject}
                            onChange={(e) => setUrlPhotoSubject(e.target.value)}
                          />
                          <input
                            className={inputCls}
                            placeholder={t("نام عکاس", "Photographer")}
                            value={urlPhotoAuthor}
                            onChange={(e) => setUrlPhotoAuthor(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            className={inputCls}
                            placeholder="https://..."
                            value={urlPhotoSrc}
                            onChange={(e) => setUrlPhotoSrc(e.target.value)}
                          />
                          <button
                            onClick={handleAddPhotoUrl}
                            className="shrink-0 rounded-full border border-gold px-4 py-2 text-xs font-bold text-goldbright hover:bg-gold hover:text-ink"
                          >
                            {t("افزودن", "Add")}
                          </button>
                        </div>
                      </div>
                    </div>

                    {editingPhoto && (
                      <div className="rounded-3xl border border-gold/40 bg-surface p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display text-xl text-goldbright">
                            {t("ویرایش مشخصات عکس", "Edit Photo Metadata")}
                          </h4>
                          <button onClick={() => setEditingPhoto(null)}>
                            <X className="h-4 w-4 text-mist" />
                          </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label={t("عنوان موضوع", "Subject")}>
                            <input
                              className={inputCls}
                              value={editingPhoto.subject}
                              onChange={(e) =>
                                setEditingPhoto({ ...editingPhoto, subject: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("عکاس / منبع", "Author")}>
                            <input
                              className={inputCls}
                              value={editingPhoto.author}
                              onChange={(e) =>
                                setEditingPhoto({ ...editingPhoto, author: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("متن جایگزین (Alt)", "Alt Text")}>
                            <input
                              className={inputCls}
                              value={editingPhoto.alt}
                              onChange={(e) =>
                                setEditingPhoto({ ...editingPhoto, alt: e.target.value })
                              }
                            />
                          </Field>
                          <Field label={t("لایسنس", "License")}>
                            <input
                              className={inputCls}
                              value={editingPhoto.license}
                              onChange={(e) =>
                                setEditingPhoto({ ...editingPhoto, license: e.target.value })
                              }
                            />
                          </Field>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              upsertPhoto(editingPhoto);
                              setEditingPhoto(null);
                              notify(t("مشخصات عکس ذخیره شد", "Photo updated"));
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-xs font-bold text-[#1a1206]"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {t("ذخیره", "Save")}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {Object.values(config.media).map((ph) => (
                        <div
                          key={ph.id}
                          className="flex flex-col overflow-hidden rounded-3xl border border-edge bg-surface"
                        >
                          <div className="flex h-36 items-center justify-center bg-plate p-3">
                            <img
                              src={ph.thumbnail || ph.src}
                              alt={ph.alt}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <div className="truncate font-display text-lg text-ivory">{ph.subject}</div>
                            <div className="truncate text-[11px] text-dusk">{ph.author}</div>
                            <div className="mt-3 flex items-center justify-between border-t border-edge/50 pt-3">
                              <button
                                onClick={() => setEditingPhoto(ph)}
                                className="rounded-full border border-edge px-3 py-1 text-[11px] font-bold text-mist hover:border-gold hover:text-goldbright"
                              >
                                {t("ویرایش", "Edit")}
                              </button>
                              <button
                                onClick={() => {
                                  if (Object.keys(config.media).length <= 1) {
                                    notify(t("حداقل یک عکس باید باقی بماند", "Keep at least one photo"));
                                    return;
                                  }
                                  deletePhoto(ph.id);
                                  notify(t("عکس حذف شد", "Photo deleted"));
                                }}
                                className="rounded-full p-1.5 text-rhodo hover:bg-rhodo/15"
                                title={t("حذف", "Delete")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. DEEP TIME ERAS CRUD */}
                {/* 7. ARTICLES CRUD */}
                {/* 8. BUYER INQUIRIES INBOX */}
                {tab === "inquiries" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl text-ivory">
                        {t("صندوق پیام‌ها و درخواست‌های خریداران", "Buyer Inquiries Inbox")}
                      </h3>
                      <span className="font-mono text-xs text-dusk">
                        {config.inquiries.length} {t("پیام کل", "total")}
                      </span>
                    </div>

                    {config.inquiries.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-edge bg-surface/60 p-12 text-center">
                        <Mail className="mx-auto h-8 w-8 text-dusk" />
                        <p className="mt-3 font-display text-2xl text-ivory">
                          {t("هنوز پیامی ثبت نشده است", "No buyer messages yet")}
                        </p>
                        <p className="mt-1 text-xs text-mist">
                          {t(
                            "وقتی بازدیدکنندگان از بخش تماس یا داخل کارت هر کانی پیام بفرستند، اینجا نمایش داده می‌شود.",
                            "When buyers submit a message from a specimen modal or the contact section, it appears here."
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {config.inquiries.map((inq) => (
                          <div
                            key={inq.id}
                            className={cn(
                              "rounded-3xl border p-5 transition-all",
                              inq.status === "new"
                                ? "border-gold/50 bg-raised"
                                : "border-edge bg-surface/75"
                            )}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2.5">
                                  <span className="font-display text-xl text-ivory">{inq.name}</span>
                                  <span
                                    className={cn(
                                      "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase",
                                      inq.status === "new"
                                        ? "bg-rhodo text-ink font-bold"
                                        : "bg-malachite/20 text-malachite"
                                    )}
                                  >
                                    {inq.status === "new"
                                      ? t("جدید", "New")
                                      : t("پاسخ داده‌شده", "Replied")}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-goldbright">
                                  <span>{inq.contact}</span>
                                  {inq.specimenName && (
                                    <span className="rounded-full border border-edge bg-abyss px-2.5 py-0.5 text-[11px] text-orchid">
                                      {inq.specimenName} ({inq.specimenCatalog})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-[10px] text-dusk">
                                {new Date(inq.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <p className="mt-3 rounded-2xl bg-abyss/70 p-3.5 text-sm leading-relaxed text-mist">
                              {inq.message}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={`tel:${inq.contact.replace(/[^\d+]/g, "")}`}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-bold text-[#1a1206]"
                                >
                                  <Phone className="h-3 w-3" /> {t("تماس", "Call")}
                                </a>
                                <a
                                  href={`https://wa.me/${inq.contact.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-full border border-malachite/50 px-3.5 py-1.5 text-xs font-bold text-malachite"
                                >
                                  <MessageCircle className="h-3 w-3" /> WhatsApp
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleInquiryStatus(inq.id)}
                                  className="rounded-full border border-edge px-3.5 py-1.5 text-xs font-bold text-mist hover:border-malachite hover:text-malachite"
                                >
                                  {inq.status === "new"
                                    ? t("علامت به‌عنوان پاسخ‌داده‌شده", "Mark Replied")
                                    : t("برگشت به جدید", "Mark New")}
                                </button>
                                <button
                                  onClick={() => deleteInquiry(inq.id)}
                                  className="rounded-full p-2 text-rhodo hover:bg-rhodo/15"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
