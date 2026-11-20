import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  Eye,
  EyeOff,
  FolderKanban,
  Gem,
  Hourglass,
  Image as ImageIcon,
  Layers,
  Mail,
  MessageCircle,
  Newspaper,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  type ArticleItem,
  type EraItem,
  type MineralItem,
  type SectionId,
  type VisitInfoCard,
} from "../data/defaults";
import { type SpecimenPhoto } from "../data/photography";
import { useCms } from "../data/store";
import { cn } from "../utils/cn";

type AdminTab =
  | "overview"
  | "sections"
  | "minerals"
  | "categories"
  | "media"
  | "eras"
  | "articles"
  | "inquiries";

const TABS: {
  id: AdminTab;
  fa: string;
  en: string;
  icon: typeof Settings;
}[] = [
  { id: "overview", fa: "تنظیمات کلی و تماس", en: "Brand & Contact", icon: Settings },
  { id: "sections", fa: "مدیریت سکشن‌ها", en: "Sections", icon: Layers },
  { id: "minerals", fa: "نمونه‌ها و کانی‌ها", en: "Specimens", icon: Gem },
  { id: "categories", fa: "دسته‌بندی‌ها", en: "Categories", icon: FolderKanban },
  { id: "media", fa: "عکس‌ها و گالری", en: "Media Library", icon: ImageIcon },
  { id: "eras", fa: "زمان عمیق (تایم‌لاین)", en: "Deep Time", icon: Hourglass },
  { id: "articles", fa: "مقالات و یادداشت‌ها", en: "Field Notes", icon: Newspaper },
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
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    config,
    setConfig,
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
    toggleInquiryStatus,
    deleteInquiry,
    importJson,
    resetAll,
  } = useCms();

  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [tab, setTab] = useState<AdminTab>("sections");
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
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-gold">
                <Settings className="h-5 w-5" />
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
              <button
                onClick={() => setLang((l) => (l === "fa" ? "en" : "fa"))}
                className="rounded-full border border-edge bg-surface px-3.5 py-2 text-xs font-bold text-mist hover:border-gold/60 hover:text-goldbright"
              >
                {lang === "fa" ? "English UI" : "نمای فارسی"}
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section Detail Editor */}
                    <div className="rounded-3xl border border-edge bg-surface p-6 space-y-5">
                      {activeSection === "hero" && (
                        <>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("ویرایش سکشن هیرو", "Edit Hero Showcase")}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("متن نشان بالا", "Top Badge")}>
                              <input
                                className={inputCls}
                                value={config.hero.badgeText}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, badgeText: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("متن نسخه/سال", "Edition Label")}>
                              <input
                                className={inputCls}
                                value={config.hero.editionText}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, editionText: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("تیتر خط اول", "Title Line 1")}>
                              <input
                                className={inputCls}
                                value={config.hero.titleLine1}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, titleLine1: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("تیتر خط دوم (قسمت ساده)", "Title Line 2 Prefix")}>
                              <input
                                className={inputCls}
                                value={config.hero.titleLine2Prefix}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, titleLine2Prefix: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("کلمه درخشان تیتر", "Highlighted Word")}>
                              <input
                                className={inputCls}
                                value={config.hero.titleLine2Highlight}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, titleLine2Highlight: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("نمونه ویژه داخل کارت هیرو", "Featured Specimen in Hero")}>
                              <select
                                className={cn(inputCls, "[&>option]:bg-surface")}
                                value={config.hero.featuredSpecimenId}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    hero: { ...p.hero, featuredSpecimenId: e.target.value },
                                  }))
                                }
                              >
                                {config.minerals.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} ({m.catalog})
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label={t("دکمه اصلی", "Primary CTA Text")}>
                              <input
                                className={inputCls}
                                value={config.hero.primaryCtaText}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, primaryCtaText: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("دکمه دوم", "Secondary CTA Text")}>
                              <input
                                className={inputCls}
                                value={config.hero.secondaryCtaText}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, secondaryCtaText: e.target.value } }))
                                }
                              />
                            </Field>
                          </div>
                          <Field label={t("توضیحات هیرو", "Hero Description")}>
                            <textarea
                              rows={3}
                              className={inputCls}
                              value={config.hero.description}
                              onChange={(e) =>
                                setConfig((p) => ({ ...p, hero: { ...p.hero, description: e.target.value } }))
                              }
                            />
                          </Field>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("عنوان نوار متحرک پایین", "Ticker Label")}>
                              <input
                                className={inputCls}
                                value={config.hero.tickerLabel}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, tickerLabel: e.target.value } }))
                                }
                              />
                            </Field>
                            <label className="flex items-center gap-3 pt-6 text-sm font-semibold text-ivory">
                              <input
                                type="checkbox"
                                checked={config.hero.showTicker}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, hero: { ...p.hero, showTicker: e.target.checked } }))
                                }
                                className="h-4 w-4 accent-gold"
                              />
                              {t("نمایش نوار متحرک پایین هیرو", "Show bottom ticker")}
                            </label>
                          </div>
                          <div className="space-y-3 border-t border-edge/60 pt-4">
                            <div className="text-xs font-bold text-gold uppercase">
                              {t("آمارهای پایین هیرو", "Hero Statistics")}
                            </div>
                            {config.hero.stats.map((st, idx) => (
                              <div key={idx} className="grid gap-2 sm:grid-cols-4">
                                <input
                                  type="number"
                                  step="0.1"
                                  className={inputCls}
                                  value={st.value}
                                  onChange={(e) => {
                                    const next = [...config.hero.stats];
                                    next[idx] = { ...next[idx], value: Number(e.target.value) };
                                    setConfig((p) => ({ ...p, hero: { ...p.hero, stats: next } }));
                                  }}
                                />
                                <input
                                  className={inputCls}
                                  placeholder="Suffix (+ / B)"
                                  value={st.suffix}
                                  onChange={(e) => {
                                    const next = [...config.hero.stats];
                                    next[idx] = { ...next[idx], suffix: e.target.value };
                                    setConfig((p) => ({ ...p, hero: { ...p.hero, stats: next } }));
                                  }}
                                />
                                <input
                                  className={cn(inputCls, "sm:col-span-2")}
                                  placeholder="Label"
                                  value={st.label}
                                  onChange={(e) => {
                                    const next = [...config.hero.stats];
                                    next[idx] = { ...next[idx], label: e.target.value };
                                    setConfig((p) => ({ ...p, hero: { ...p.hero, stats: next } }));
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {activeSection === "intro" && (
                        <>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("ویرایش سکشن معرفی و کیوریتور", "Edit Curator Introduction")}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <Field label={t("شماره فصل", "Chapter")}>
                              <input
                                className={inputCls}
                                value={config.intro.chapter}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, intro: { ...p.intro, chapter: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("نام کیوریتور", "Curator Name")}>
                              <input
                                className={inputCls}
                                value={config.intro.curatorName}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, intro: { ...p.intro, curatorName: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("سمت", "Role")}>
                              <input
                                className={inputCls}
                                value={config.intro.curatorRole}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, intro: { ...p.intro, curatorRole: e.target.value } }))
                                }
                              />
                            </Field>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <Field label={t("شروع نقل‌قول", "Quote Prefix")}>
                              <input
                                className={inputCls}
                                value={config.intro.quotePrefix}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, intro: { ...p.intro, quotePrefix: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("قسمت رنگی نقل‌قول", "Quote Highlight")}>
                              <input
                                className={inputCls}
                                value={config.intro.quoteHighlight}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, intro: { ...p.intro, quoteHighlight: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("ادامه نقل‌قول", "Quote Suffix")}>
                              <input
                                className={inputCls}
                                value={config.intro.quoteSuffix}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, intro: { ...p.intro, quoteSuffix: e.target.value } }))
                                }
                              />
                            </Field>
                          </div>
                          <Field label={t("پاراگراف اول", "Paragraph 1")}>
                            <textarea
                              rows={3}
                              className={inputCls}
                              value={config.intro.paragraph1}
                              onChange={(e) =>
                                setConfig((p) => ({ ...p, intro: { ...p.intro, paragraph1: e.target.value } }))
                              }
                            />
                          </Field>
                          <Field label={t("پاراگراف دوم", "Paragraph 2")}>
                            <textarea
                              rows={3}
                              className={inputCls}
                              value={config.intro.paragraph2}
                              onChange={(e) =>
                                setConfig((p) => ({ ...p, intro: { ...p.intro, paragraph2: e.target.value } }))
                              }
                            />
                          </Field>
                          <div className="space-y-2 border-t border-edge/60 pt-4">
                            <div className="text-xs font-bold text-gold uppercase">
                              {t("کاشی‌های آماری", "Stat Tiles")}
                            </div>
                            {config.intro.tiles.map((tl, idx) => (
                              <div key={idx} className="grid gap-2 sm:grid-cols-[120px_1fr_64px]">
                                <input
                                  className={inputCls}
                                  value={tl.value}
                                  onChange={(e) => {
                                    const next = [...config.intro.tiles];
                                    next[idx] = { ...next[idx], value: e.target.value };
                                    setConfig((p) => ({ ...p, intro: { ...p.intro, tiles: next } }));
                                  }}
                                />
                                <input
                                  className={inputCls}
                                  value={tl.label}
                                  onChange={(e) => {
                                    const next = [...config.intro.tiles];
                                    next[idx] = { ...next[idx], label: e.target.value };
                                    setConfig((p) => ({ ...p, intro: { ...p.intro, tiles: next } }));
                                  }}
                                />
                                <input
                                  type="color"
                                  className="h-10 w-full cursor-pointer rounded-xl border border-edge bg-ink p-1"
                                  value={tl.accent}
                                  onChange={(e) => {
                                    const next = [...config.intro.tiles];
                                    next[idx] = { ...next[idx], accent: e.target.value };
                                    setConfig((p) => ({ ...p, intro: { ...p.intro, tiles: next } }));
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="grid gap-4 border-t border-edge/60 pt-4 sm:grid-cols-2">
                            <Field label={t("تیتر بنر مشاوره", "Consultation Banner Title")}>
                              <input
                                className={inputCls}
                                value={config.intro.pubTitleHighlight}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    intro: { ...p.intro, pubTitleHighlight: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                            <Field label={t("متن دکمه بنر", "Banner Button Text")}>
                              <input
                                className={inputCls}
                                value={config.intro.pubButtonText}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    intro: { ...p.intro, pubButtonText: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                          </div>
                        </>
                      )}

                      {(activeSection === "highlights" ||
                        activeSection === "collection" ||
                        activeSection === "deeptime" ||
                        activeSection === "stories") && (
                        <>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("ویرایش عنوان و تنظیمات سکشن", "Edit Section Header")}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("شماره فصل", "Chapter")}>
                              <input
                                className={inputCls}
                                value={config[activeSection].chapter}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    [activeSection]: { ...p[activeSection], chapter: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                            <Field label={t("عنوان کوچک بالا", "Overline")}>
                              <input
                                className={inputCls}
                                value={config[activeSection].overline}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    [activeSection]: { ...p[activeSection], overline: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                            <Field label={t("تیتر (قسمت اول)", "Title Prefix")}>
                              <input
                                className={inputCls}
                                value={config[activeSection].titlePrefix}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    [activeSection]: { ...p[activeSection], titlePrefix: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                            <Field label={t("تیتر (کلمه رنگی)", "Title Highlight")}>
                              <input
                                className={inputCls}
                                value={config[activeSection].titleHighlight}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    [activeSection]: { ...p[activeSection], titleHighlight: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                          </div>
                          <Field label={t("توضیحات زیر تیتر", "Subtitle")}>
                            <textarea
                              rows={2}
                              className={inputCls}
                              value={config[activeSection].subtitle}
                              onChange={(e) =>
                                setConfig((p) => ({
                                  ...p,
                                  [activeSection]: { ...p[activeSection], subtitle: e.target.value },
                                }))
                              }
                            />
                          </Field>
                          {activeSection === "collection" && (
                            <div className="flex flex-wrap gap-5 border-t border-edge/60 pt-4 text-xs font-semibold text-ivory">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={config.collection.showSearch}
                                  onChange={(e) =>
                                    setConfig((p) => ({
                                      ...p,
                                      collection: { ...p.collection, showSearch: e.target.checked },
                                    }))
                                  }
                                  className="accent-gold"
                                />
                                {t("نوار جستجو", "Show Search")}
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={config.collection.showSort}
                                  onChange={(e) =>
                                    setConfig((p) => ({
                                      ...p,
                                      collection: { ...p.collection, showSort: e.target.checked },
                                    }))
                                  }
                                  className="accent-gold"
                                />
                                {t("مرتب‌سازی", "Show Sort")}
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={config.collection.showSavedFilter}
                                  onChange={(e) =>
                                    setConfig((p) => ({
                                      ...p,
                                      collection: { ...p.collection, showSavedFilter: e.target.checked },
                                    }))
                                  }
                                  className="accent-gold"
                                />
                                {t("دکمه علاقه‌مندی‌ها", "Show Saved Filter")}
                              </label>
                            </div>
                          )}
                          {activeSection === "highlights" && (
                            <button
                              onClick={() => setTab("minerals")}
                              className="rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright hover:bg-gold hover:text-ink"
                            >
                              {t("مدیریت آیتم‌های هایلایت در تب کانی‌ها →", "Manage Highlighted Specimens →")}
                            </button>
                          )}
                          {activeSection === "deeptime" && (
                            <button
                              onClick={() => setTab("eras")}
                              className="rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright hover:bg-gold hover:text-ink"
                            >
                              {t("افزودن/ویرایش فصل‌های زمان عمیق →", "Manage Deep Time Chapters →")}
                            </button>
                          )}
                          {activeSection === "stories" && (
                            <button
                              onClick={() => setTab("articles")}
                              className="rounded-full border border-gold/50 px-4 py-2 text-xs font-bold text-goldbright hover:bg-gold hover:text-ink"
                            >
                              {t("افزودن/ویرایش مقالات →", "Manage Articles →")}
                            </button>
                          )}
                        </>
                      )}

                      {activeSection === "glow" && (
                        <>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("ویرایش اتاق درخشان (UV)", "Edit Glow Room (UV)")}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("تیتر اول", "Title Prefix")}>
                              <input
                                className={inputCls}
                                value={config.glow.titlePrefix}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, glow: { ...p.glow, titlePrefix: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("تیتر رنگی", "Title Highlight")}>
                              <input
                                className={inputCls}
                                value={config.glow.titleHighlight}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, glow: { ...p.glow, titleHighlight: e.target.value } }))
                                }
                              />
                            </Field>
                          </div>
                          <PhotoPicker
                            label={t("عکس نمونه اتاق UV", "UV Specimen Photo")}
                            value={config.glow.photoId}
                            media={config.media}
                            onChange={(photoId) =>
                              setConfig((p) => ({ ...p, glow: { ...p.glow, photoId } }))
                            }
                          />
                          <Field label={t("برچسب پایین تصویر", "Specimen Badge")}>
                            <input
                              className={inputCls}
                              value={config.glow.specimenLabel}
                              onChange={(e) =>
                                setConfig((p) => ({ ...p, glow: { ...p.glow, specimenLabel: e.target.value } }))
                              }
                            />
                          </Field>
                          <Field label={t("توضیح علمی اتاق", "Scientific Note")}>
                            <textarea
                              rows={3}
                              className={inputCls}
                              value={config.glow.note}
                              onChange={(e) =>
                                setConfig((p) => ({ ...p, glow: { ...p.glow, note: e.target.value } }))
                              }
                            />
                          </Field>
                        </>
                      )}

                      {activeSection === "visit" && (
                        <>
                          <h3 className="font-display text-2xl text-goldbright">
                            {t("ویرایش تور مجازی و تماس مستقیم", "Edit Virtual Tour & Direct Contact")}
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("تیتر تور مجازی", "Tour Title Highlight")}>
                              <input
                                className={inputCls}
                                value={config.visit.tourTitleHighlight}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    visit: { ...p.visit, tourTitleHighlight: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                            <Field label={t("دکمه تور مجازی", "Tour Button")}>
                              <input
                                className={inputCls}
                                value={config.visit.tourButtonText}
                                onChange={(e) =>
                                  setConfig((p) => ({
                                    ...p,
                                    visit: { ...p.visit, tourButtonText: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                          </div>
                          <PhotoPicker
                            label={t("عکس پس‌زمینه بنر تور", "Tour Banner Photo")}
                            value={config.visit.tourPhotoId}
                            media={config.media}
                            onChange={(tourPhotoId) =>
                              setConfig((p) => ({ ...p, visit: { ...p.visit, tourPhotoId } }))
                            }
                          />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label={t("تیتر بخش تماس", "Contact Title Prefix")}>
                              <input
                                className={inputCls}
                                value={config.visit.titlePrefix}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, visit: { ...p.visit, titlePrefix: e.target.value } }))
                                }
                              />
                            </Field>
                            <Field label={t("کلمه رنگی تماس", "Contact Title Highlight")}>
                              <input
                                className={inputCls}
                                value={config.visit.titleHighlight}
                                onChange={(e) =>
                                  setConfig((p) => ({ ...p, visit: { ...p.visit, titleHighlight: e.target.value } }))
                                }
                              />
                            </Field>
                          </div>
                          <Field label={t("توضیح بخش تماس", "Contact Subtitle")}>
                            <textarea
                              rows={2}
                              className={inputCls}
                              value={config.visit.subtitle}
                              onChange={(e) =>
                                setConfig((p) => ({ ...p, visit: { ...p.visit, subtitle: e.target.value } }))
                              }
                            />
                          </Field>
                          <div className="space-y-3 border-t border-edge/60 pt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gold uppercase">
                                {t("کارت‌های اطلاعات تماس", "Contact Info Cards")}
                              </span>
                              <button
                                onClick={() => {
                                  const card: VisitInfoCard = {
                                    id: `info-${Date.now()}`,
                                    icon: "phone",
                                    accent: "#e6b45a",
                                    title: "New Info Card",
                                    lines: ["Detail line 1", "Detail line 2"],
                                  };
                                  setConfig((p) => ({
                                    ...p,
                                    visit: { ...p.visit, infoCards: [...p.visit.infoCards, card] },
                                  }));
                                }}
                                className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-goldbright"
                              >
                                <Plus className="h-3.5 w-3.5" /> {t("افزودن کارت", "Add Card")}
                              </button>
                            </div>
                            {config.visit.infoCards.map((card, idx) => (
                              <div key={card.id} className="space-y-2 rounded-2xl border border-edge bg-abyss/70 p-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    className={inputCls}
                                    value={card.title}
                                    onChange={(e) => {
                                      const next = [...config.visit.infoCards];
                                      next[idx] = { ...next[idx], title: e.target.value };
                                      setConfig((p) => ({ ...p, visit: { ...p.visit, infoCards: next } }));
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      setConfig((p) => ({
                                        ...p,
                                        visit: {
                                          ...p.visit,
                                          infoCards: p.visit.infoCards.filter((c) => c.id !== card.id),
                                        },
                                      }));
                                    }}
                                    className="rounded-xl p-2 text-rhodo hover:bg-rhodo/15"
                                    title={t("حذف کارت", "Delete card")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  className={inputCls}
                                  value={card.lines.join("\n")}
                                  onChange={(e) => {
                                    const next = [...config.visit.infoCards];
                                    next[idx] = {
                                      ...next[idx],
                                      lines: e.target.value.split("\n").filter(Boolean),
                                    };
                                    setConfig((p) => ({ ...p, visit: { ...p.visit, infoCards: next } }));
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </>
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
                {tab === "eras" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl text-ivory">
                        {t("فصل‌های تایم‌لاین زمان عمیق", "Deep Time Chapters")}
                      </h3>
                      <button
                        onClick={startNewEra}
                        className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-[#1a1206]"
                      >
                        <Plus className="h-4 w-4" />
                        {t("افزودن فصل", "Add Chapter")}
                      </button>
                    </div>

                    {editingEra && (
                      <div className="rounded-3xl border border-gold/40 bg-surface p-6 space-y-4">
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
                          <Field label={t("رنگ", "Accent")}>
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
                              {t("عکس اختیاری", "Optional Photo")}
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
                            {t("ذخیره", "Save")}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {config.deeptime.eras.map((era, idx) => (
                        <div
                          key={era.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-edge bg-surface p-4"
                        >
                          <div>
                            <div className="font-mono text-xs" style={{ color: era.accent }}>
                              {era.age} {era.unit}
                            </div>
                            <div className="font-display text-xl text-ivory">{era.title}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => moveEra(era.id, -1)}
                              disabled={idx === 0}
                              className="rounded-lg p-2 text-mist hover:bg-abyss disabled:opacity-25"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => moveEra(era.id, 1)}
                              disabled={idx === config.deeptime.eras.length - 1}
                              className="rounded-lg p-2 text-mist hover:bg-abyss disabled:opacity-25"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingEra(era)}
                              className="rounded-full border border-edge px-3.5 py-1.5 text-xs font-bold text-ivory hover:border-gold"
                            >
                              {t("ویرایش", "Edit")}
                            </button>
                            <button
                              onClick={() => {
                                deleteEra(era.id);
                                notify(t("فصل حذف شد", "Chapter deleted"));
                              }}
                              className="rounded-full p-2 text-rhodo hover:bg-rhodo/15"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. ARTICLES CRUD */}
                {tab === "articles" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl text-ivory">
                        {t("مدیریت مقالات و یادداشت‌ها", "Field Notes & Articles")}
                      </h3>
                      <button
                        onClick={startNewArticle}
                        className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-[#1a1206]"
                      >
                        <Plus className="h-4 w-4" />
                        {t("نوشتن مقاله جدید", "New Article")}
                      </button>
                    </div>

                    {editingArticle && (
                      <div className="rounded-3xl border border-gold/40 bg-surface p-6 space-y-4">
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
                        <Field label={t("خلاصه کوتاه", "Excerpt")}>
                          <textarea
                            rows={2}
                            className={inputCls}
                            value={editingArticle.excerpt}
                            onChange={(e) =>
                              setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                            }
                          />
                        </Field>
                        <Field label={t("جمله برجسته (Pull Quote)", "Pull Quote")}>
                          <input
                            className={inputCls}
                            value={editingArticle.pullQuote}
                            onChange={(e) =>
                              setEditingArticle({ ...editingArticle, pullQuote: e.target.value })
                            }
                          />
                        </Field>
                        <Field label={t("متن کامل مقاله (پاراگراف‌ها با یک خط خالی جدا شوند)", "Paragraphs (separate with blank line)")}>
                          <textarea
                            rows={6}
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
                          className="flex flex-col justify-between rounded-3xl border border-edge bg-surface p-5"
                        >
                          <div>
                            <span
                              className="font-mono text-[10px] uppercase"
                              style={{ color: art.tagColor }}
                            >
                              {art.tag} · {art.minutes} min
                            </span>
                            <h4 className="mt-2 font-display text-2xl text-ivory">{art.title}</h4>
                            <p className="mt-2 text-xs text-mist">{art.excerpt}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-edge/50 pt-3">
                            <button
                              onClick={() => setEditingArticle(art)}
                              className="rounded-full border border-edge px-4 py-1.5 text-xs font-bold text-ivory hover:border-gold"
                            >
                              {t("ویرایش", "Edit")}
                            </button>
                            <button
                              onClick={() => {
                                deleteArticle(art.id);
                                notify(t("مقاله حذف شد", "Article deleted"));
                              }}
                              className="rounded-full p-2 text-rhodo hover:bg-rhodo/15"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
