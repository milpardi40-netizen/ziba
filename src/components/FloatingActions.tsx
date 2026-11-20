import {
  ChevronsDown,
  ChevronsUp,
  Gem,
  Mail,
  MessageSquareText,
  Phone,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ComponentType } from "react";
import { useCms } from "../data/store";
import { ui } from "../data/i18n";
import { pageHref } from "../router";
import { cn } from "../utils/cn";
import { LogoMark } from "./Logo";

/** Official WhatsApp glyph (lucide has no brand icons). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/** Official Telegram glyph. */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

interface Channel {
  id: string;
  label: string;
  detail: string;
  href: string;
  external?: boolean;
  color: string;
  Icon: ComponentType<{ className?: string }>;
}

/**
 * Floating "Concierge & Scroll" dock — always one thumb away, on every
 * page of the SPA:
 *
 *  · A faceted gem button opens the contact channels to the site admin /
 *    curatorial desk: phone, WhatsApp, Telegram, email, and the on-site
 *    inquiry form whose messages land in the Admin Panel's Buyer Inbox.
 *    All numbers & handles come from the CMS contact settings, so the
 *    admin can retarget every icon from the panel without code.
 *  · A dual scroll capsule jumps instantly (smooth) to the very top or
 *    the very bottom of the current page, with a live progress readout.
 */
export default function FloatingActions() {
  const { config, lang } = useCms();
  const c = config.contact;
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollBottom = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  const prefilled =
    lang === "ar"
      ? "مرحباً فيرناجويل، أود التحدث مع مكتب القيّم حول المجموعة."
      : "Hello Vernajewel, I would like to speak with the curatorial desk about the collection.";
  const channels: Channel[] = [
    {
      id: "call",
      label: ui(lang, "dockCallDesk"),
      detail: c.phoneDisplay,
      href: `tel:${c.phoneHref}`,
      color: "#e6b45a",
      Icon: Phone,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      detail: ui(lang, "dockWhatsappDetail"),
      href: `https://wa.me/${c.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(prefilled)}`,
      external: true,
      color: "#4fd9a6",
      Icon: WhatsAppIcon,
    },
    {
      id: "telegram",
      label: "Telegram",
      detail: `@${c.telegramHandle.replace(/^@/, "")}`,
      href: `https://t.me/${c.telegramHandle.replace(/^@/, "")}`,
      external: true,
      color: "#7fa9ef",
      Icon: TelegramIcon,
    },
    {
      id: "email",
      label: ui(lang, "dockEmail"),
      detail: c.email,
      href: `mailto:${c.email}?subject=${encodeURIComponent(ui(lang, "dockEmailSubject", { brand: config.brand.name }))}`,
      color: "#f27d9e",
      Icon: Mail,
    },
    {
      id: "form",
      label: ui(lang, "dockMessageAdmin"),
      detail: ui(lang, "dockFormDetail"),
      href: pageHref("visit"),
      color: "#b48cf2",
      Icon: MessageSquareText,
    },
  ];

  const atTop = progress <= 0.01;
  const atBottom = progress >= 0.99;

  return (
    <div
      className="pointer-events-none fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 sm:end-6 sm:bottom-6"
      aria-label={ui(lang, "dockAria")}
    >
      {/* ——— Contact channels (expand from the gem) ——— */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            className="pointer-events-auto flex flex-col items-end gap-2"
            role="menu"
            aria-label={ui(lang, "dockChannels")}
          >
            {channels.map((ch, i) => (
              <motion.a
                key={ch.id}
                href={ch.href}
                {...(ch.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                onClick={() => setOpen(false)}
                role="menuitem"
                aria-label={`${ch.label} — ${ch.detail}`}
                variants={{
                  closed: { opacity: 0, y: 14, scale: 0.9, transition: { duration: 0.16 } },
                  open: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { delay: 0.04 * (channels.length - i), duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="group flex items-center gap-3 rounded-full border py-2 pr-2 pl-4 shadow-[0_16px_40px_-14px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-transform hover:scale-[1.03]"
                style={{
                  borderColor: `${ch.color}55`,
                  background: "rgba(19,39,44,0.92)",
                }}
              >
                <span className="text-end leading-tight">
                  <span className="block text-[12px] font-bold text-ivory">{ch.label}</span>
                  <span className="block max-w-[180px] truncate text-[10px] text-dusk">
                    {ch.detail}
                  </span>
                </span>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{ background: `${ch.color}22`, color: ch.color }}
                >
                  <ch.Icon className="h-[18px] w-[18px]" />
                </span>
              </motion.a>
            ))}
            <motion.p
              variants={{
                closed: { opacity: 0 },
                open: { opacity: 1, transition: { delay: 0.28 } },
              }}
              className="pr-2 font-mono text-[9px] tracking-[0.16em] text-dusk uppercase"
            >
              {c.availabilityNote.split("·").slice(0, 2).join("·")}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex items-end gap-2.5">
        {/* ——— Dual scroll capsule: one-tap top / bottom ——— */}
        <div className="flex flex-col items-center overflow-hidden rounded-full border border-edge bg-abyss/90 shadow-[0_16px_40px_-14px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <button
            onClick={scrollTop}
            disabled={atTop}
            aria-label={ui(lang, "dockScrollTopAria")}
            title={ui(lang, "dockScrollTopTitle")}
            className={cn(
              "flex h-10 w-11 items-center justify-center text-mist transition-all hover:bg-surface hover:text-goldbright",
              atTop && "cursor-default opacity-30 hover:bg-transparent hover:text-mist"
            )}
          >
            <ChevronsUp className="h-[18px] w-[18px]" />
          </button>
          <span
            className="font-mono text-[8px] tracking-wider text-dusk tabular-nums"
            aria-hidden
            title={ui(lang, "dockReadingProgress")}
          >
            {Math.round(progress * 100)}%
          </span>
          <button
            onClick={scrollBottom}
            disabled={atBottom}
            aria-label={ui(lang, "dockScrollBottomAria")}
            title={ui(lang, "dockScrollBottomTitle")}
            className={cn(
              "flex h-10 w-11 items-center justify-center text-mist transition-all hover:bg-surface hover:text-goldbright",
              atBottom && "cursor-default opacity-30 hover:bg-transparent hover:text-mist"
            )}
          >
            <ChevronsDown className="h-[18px] w-[18px]" />
          </button>
          {/* progress track */}
          <span className="relative h-1 w-full bg-edge/40" aria-hidden>
            <span
              className="absolute inset-y-0 start-0 bg-gradient-to-r from-amethyst via-rhodo to-gold transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </span>
        </div>

        {/* ——— The gem: contact with the admin / site manager ——— */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={
            open
              ? ui(lang, "dockAriaClose")
              : ui(lang, "dockAriaOpen")
          }
          title={ui(lang, "dockContactAdmin")}
          className="group relative flex items-center gap-2.5 rounded-full border border-gold/50 bg-gradient-to-br from-raised to-abyss py-2 pr-2 pl-4 shadow-[0_18px_46px_-14px_rgba(230,180,90,0.45)] backdrop-blur-xl transition-all hover:border-gold hover:shadow-[0_18px_54px_-12px_rgba(230,180,90,0.6)]"
        >
          {/* soft pulse until first opened */}
          {!open && (
            <span
              className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-gold/50 [animation-duration:2.6s]"
              aria-hidden
            />
          )}
          <span className="hidden text-end leading-tight min-[420px]:block">
            <span className="block text-[11px] font-bold text-ivory">
              {open ? ui(lang, "dockClose") : ui(lang, "dockContactShort")}
            </span>
            <span className="block text-[9px] tracking-wide text-dusk">
              {ui(lang, "dockDeskReply")}
            </span>
          </span>
          <span className="relative flex h-11 w-11 items-center justify-center">
            <LogoMark
              className={cn(
                "h-10 w-auto transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3",
                open && "scale-105 -rotate-3"
              )}
            />
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="x"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/70"
                >
                  <X className="h-4 w-4 text-goldbright" />
                </motion.span>
              ) : (
                <motion.span
                  key="gem"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rhodo font-mono text-[8px] font-bold text-ink"
                  aria-hidden
                >
                  <Gem className="h-2.5 w-2.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
      </div>
    </div>
  );
}
