import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useCms } from "../data/store";
import { cn } from "../utils/cn";
import { MohsBar, RarityGems } from "./ui";
import SpecimenImage, { PhotoCredit } from "./SpecimenImage";

export default function SpecimenModal({
  openId,
  tour,
  saved,
  onToggleSave,
  onClose,
  onNavigate,
}: {
  openId: string | null;
  tour: boolean;
  saved: Set<string>;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const { config, getPhoto, getCategoryColor, submitInquiry } = useCms();
  const minerals = config.minerals;
  const mineral = openId ? minerals.find((m) => m.id === openId) ?? null : null;
  const index = mineral ? minerals.findIndex((m) => m.id === mineral.id) : -1;

  const [inquireOpen, setInquireOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [buyerMsg, setBuyerMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    setInquireOpen(false);
    setSent(false);
    setFormErr("");
  }, [openId]);

  const step = (delta: number) => {
    if (index < 0 || minerals.length === 0) return;
    const next = (index + delta + minerals.length) % minerals.length;
    onNavigate(minerals[next].id);
  };

  useEffect(() => {
    if (!openId) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, index, minerals.length]);

  const accent = mineral?.accent ?? "#b48cf2";
  const isSaved = mineral ? saved.has(mineral.id) : false;
  const photo = mineral ? getPhoto(mineral.photoId) : null;
  const catColor = mineral ? getCategoryColor(mineral.category) : "#8fe4df";

  const handleInquiry = (e: FormEvent) => {
    e.preventDefault();
    if (!mineral) return;
    if (!buyerName.trim() || !buyerContact.trim()) {
      setFormErr("Please enter your name and phone number or email.");
      return;
    }
    submitInquiry({
      name: buyerName.trim(),
      contact: buyerContact.trim(),
      message:
        buyerMsg.trim() ||
        `Hello, I would like to inquire about ${mineral.name} (${mineral.catalog}).`,
      specimenId: mineral.id,
      specimenName: mineral.name,
      specimenCatalog: mineral.catalog,
    });
    setSent(true);
    setFormErr("");
    setBuyerMsg("");
  };

  const whatsappUrl = mineral
    ? `https://wa.me/${config.contact.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hello, I am interested in ${mineral.name} (${mineral.catalog}). Could we discuss details?`
      )}`
    : "#";
  const telegramUrl = `https://t.me/${config.contact.telegramHandle.replace(/^@/, "")}`;

  return (
    <AnimatePresence>
      {mineral && photo && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Specimen file: ${mineral.name}`}
        >
          <div
            className="absolute inset-0 bg-ink/85 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key={mineral.id}
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-edge bg-abyss sm:rounded-3xl"
            style={{ boxShadow: `0 40px 120px -30px ${accent}66` }}
          >
            {tour && (
              <div className="absolute inset-x-0 top-0 z-20 h-1 bg-edge/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-amethyst to-gold"
                  animate={{ width: `${((index + 1) / minerals.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}

            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-5">
              <span className="flex items-center gap-2.5 rounded-full border border-ivory/15 bg-abyss/90 px-4 py-2 font-mono text-[10px] tracking-[0.22em] text-ivory/80 uppercase backdrop-blur-md">
                {tour ? (
                  <>
                    <Compass className="h-3.5 w-3.5 text-gold" />
                    Guided tour · stop {index + 1} of {minerals.length}
                  </>
                ) : (
                  <>Specimen file · {mineral.catalog}</>
                )}
              </span>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 bg-abyss/90 text-ivory backdrop-blur-md transition-colors hover:border-rhodo/60 hover:text-rhodo"
                aria-label="Close specimen file"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="grid flex-1 overflow-y-auto md:grid-cols-[1.05fr_1fr] md:overflow-hidden">
              <div className="relative h-[320px] md:h-auto md:min-h-0">
                <SpecimenImage photo={photo} accent={accent} variant="detail" priority />
                <div className="absolute right-5 bottom-4 left-5 space-y-3 md:right-6 md:bottom-6 md:left-6">
                  <div className="flex items-center gap-3">
                    <RarityGems value={mineral.rarity} accent={accent} />
                    <span className="font-mono text-[9px] tracking-[0.16em] text-dusk uppercase">
                      Reference photograph
                    </span>
                  </div>
                  <PhotoCredit photo={photo} />
                </div>
              </div>

              <div className="relative flex flex-col overflow-y-auto p-6 pt-2 sm:p-8 md:pt-16">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase"
                    style={{
                      borderColor: `${catColor}55`,
                      color: catColor,
                    }}
                  >
                    {mineral.category}
                    {mineral.glow && <Sparkles className="h-3 w-3" />}
                  </span>
                  {mineral.grade && (
                    <span className="rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 font-mono text-[9.5px] tracking-[0.14em] text-goldbright uppercase">
                      {mineral.grade}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-4xl leading-[1.05] font-light text-ivory">
                  {mineral.name}
                </h3>
                <p className="mt-2 text-sm text-dusk italic">{mineral.epithet}</p>

                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-edge bg-surface/95 p-5">
                  {[
                    ["Formula", mineral.formula],
                    ["Crystal system", mineral.system],
                    ["Luster", mineral.luster],
                    ["In archive since", mineral.acquired],
                    ["Dimensions", mineral.size],
                    ["Mohs hardness", mineral.mohsLabel],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="font-mono text-[9px] tracking-[0.2em] text-dusk uppercase">{k}</div>
                      <div className="mt-1 text-sm font-semibold text-ivory">{v}</div>
                    </div>
                  ))}
                  {mineral.provenance && (
                    <div className="col-span-2 border-t border-edge/60 pt-3.5">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-gold uppercase">
                        Provenance & Pedigree
                      </div>
                      <div className="mt-1 text-xs font-medium text-mist">{mineral.provenance}</div>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-edge/60 pt-3.5">
                    <div className="mb-2 font-mono text-[9px] tracking-[0.2em] text-dusk uppercase">
                      Hardness on the Mohs scale
                    </div>
                    <MohsBar value={mineral.mohs} accent={accent} />
                  </div>
                </div>

                {/* Direct Contact & Inquiry Strip (Non-Ecommerce) */}
                <div className="mt-5 rounded-2xl border border-gold/30 bg-raised/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-goldbright uppercase">
                      Direct collector inquiry
                    </span>
                    <button
                      onClick={() => setInquireOpen((v) => !v)}
                      className="text-xs font-bold text-gold hover:underline"
                    >
                      {inquireOpen ? "Hide message form" : "Leave a message"}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`tel:${config.contact.phoneHref}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-2 text-xs font-bold text-[#1a1206] transition-colors hover:bg-goldbright"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call {config.contact.phoneDisplay}
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-malachite/50 bg-malachite/15 px-3.5 py-2 text-xs font-bold text-malachite transition-colors hover:bg-malachite/25"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-azurite/50 bg-azurite/15 px-3.5 py-2 text-xs font-bold text-azurite transition-colors hover:bg-azurite/25"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Telegram
                    </a>
                  </div>

                  {inquireOpen && (
                    <div className="mt-4 border-t border-edge/50 pt-4">
                      {sent ? (
                        <div className="flex items-center gap-2.5 rounded-xl border border-malachite/40 bg-malachite/10 p-3 text-xs text-malachite">
                          <Check className="h-4 w-4 shrink-0" />
                          Inquiry received for {mineral.name}. We will contact you personally!
                        </div>
                      ) : (
                        <form onSubmit={handleInquiry} className="space-y-2.5">
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <input
                              type="text"
                              value={buyerName}
                              onChange={(e) => setBuyerName(e.target.value)}
                              placeholder="Your name *"
                              className="rounded-xl border border-edge bg-ink/80 px-3.5 py-2 text-xs text-ivory placeholder:text-dusk focus:border-gold focus:outline-none"
                            />
                            <input
                              type="text"
                              value={buyerContact}
                              onChange={(e) => setBuyerContact(e.target.value)}
                              placeholder="Phone / WhatsApp / Email *"
                              className="rounded-xl border border-edge bg-ink/80 px-3.5 py-2 text-xs text-ivory placeholder:text-dusk focus:border-gold focus:outline-none"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={buyerMsg}
                            onChange={(e) => setBuyerMsg(e.target.value)}
                            placeholder={`Message about ${mineral.name} (${mineral.catalog})...`}
                            className="w-full rounded-xl border border-edge bg-ink/80 px-3.5 py-2 text-xs text-ivory placeholder:text-dusk focus:border-gold focus:outline-none"
                          />
                          {formErr && <p className="text-[11px] text-rhodo">{formErr}</p>}
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-bold text-[#1a1206] hover:bg-goldbright"
                          >
                            <Send className="h-3.5 w-3.5" /> Send Inquiry
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-5 flex items-center gap-2 text-sm text-mist">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  {mineral.locality}
                </p>

                <p className="mt-4 text-[15px] leading-relaxed text-mist">{mineral.story}</p>

                <blockquote className="mt-5 rounded-2xl border-l-2 bg-surface/90 p-5" style={{ borderColor: accent }}>
                  <Quote className="mb-2 h-4 w-4" style={{ color: accent }} />
                  <p className="font-display text-base leading-relaxed text-ivory italic">
                    {mineral.curatorNote}
                  </p>
                  <footer className="mt-2.5 font-mono text-[10px] tracking-[0.2em] text-dusk uppercase">
                    — Curator's note
                  </footer>
                </blockquote>

                <div className="sticky bottom-0 z-10 -mx-6 mt-6 flex items-center justify-between gap-3 border-t border-edge/70 bg-abyss/95 px-6 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
                  <button
                    onClick={() => onToggleSave(mineral.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition-all active:scale-95",
                      isSaved
                        ? "border-rhodo/70 bg-rhodo/20 text-rhodo"
                        : "border-edge bg-surface text-mist hover:border-rhodo/50 hover:text-rhodo"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                    {isSaved ? "Saved" : "Save specimen"}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => step(-1)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-edge bg-surface text-ivory transition-colors hover:border-amethyst hover:text-orchid"
                      aria-label="Previous specimen"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => step(1)}
                      className="flex h-11 items-center gap-1.5 rounded-full bg-gold px-5 text-sm font-bold text-[#1a1206] transition-colors hover:bg-goldbright"
                      aria-label={tour ? "Next stop" : "Next specimen"}
                    >
                      {tour ? "Next stop" : "Next"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
