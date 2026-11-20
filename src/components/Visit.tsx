import {
  Check,
  Clock,
  Compass,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useCms } from "../data/store";
import { cn } from "../utils/cn";
import { Reveal, SectionHeading } from "./ui";
import SpecimenImage from "./SpecimenImage";

const ICON_MAP = {
  clock: Clock,
  phone: Phone,
  map: MapPin,
  message: MessageCircle,
};

export default function Visit({ onStartTour }: { onStartTour: () => void }) {
  const { config, getPhoto, submitInquiry, lang } = useCms();
  const s = config.visit;
  const c = config.contact;

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [specimenId, setSpecimenId] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!contact.trim() || contact.trim().length < 5) {
      setState("error");
      setErrMsg(s.errorText);
      return;
    }
    const chosen = config.minerals.find((m) => m.id === specimenId);
    submitInquiry({
      name: name.trim() || s.defaultInquiryName,
      contact: contact.trim(),
      message: message.trim() || s.defaultInquiryMessage,
      specimenId: chosen?.id,
      specimenName: chosen?.name,
      specimenCatalog: chosen?.catalog,
    });
    setState("done");
    setErrMsg("");
  };

  const whatsappHref = `https://wa.me/${c.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    s.whatsappPrefill.replace(/\{brand\}/g, config.brand.name)
  )}`;
  const telegramHref = `https://t.me/${c.telegramHandle.replace(/^@/, "")}`;

  return (
    <section id="visit" className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 rule-gem opacity-40" aria-hidden />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* virtual tour banner */}
        <Reveal y={40}>
          <div
            className="spotlight-card relative overflow-hidden rounded-3xl border border-amethyst/30"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-y-0 right-0 w-[60%] opacity-40 sm:opacity-75">
                <SpecimenImage photo={getPhoto(s.tourPhotoId)} variant="stage" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/30" />
            </div>
            <div className="relative flex flex-col items-start gap-6 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.3em] text-orchid uppercase">
                  <Compass className="h-4 w-4" /> {s.tourOverline}
                </div>
                <h3 className="mt-3 font-display text-3xl leading-tight font-light text-ivory sm:text-4xl">
                  {s.tourTitlePrefix}
                  <em className="text-orchid">{s.tourTitleHighlight}</em>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mist sm:text-base">
                  {s.tourDescription}
                </p>
              </div>
              <button
                onClick={onStartTour}
                className="group flex shrink-0 items-center gap-2.5 rounded-full bg-orchid px-7 py-4 text-sm font-bold text-ink shadow-[0_0_40px_rgba(200,155,255,0.35)] transition-all hover:bg-amethyst hover:shadow-[0_0_60px_rgba(180,140,242,0.5)]"
              >
                <Compass className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                {s.tourButtonText}
              </button>
            </div>
          </div>
        </Reveal>

        {/* Private Acquisition Protocol */}
        {s.protocolSteps && s.protocolSteps.length > 0 && (
          <Reveal delay={0.08}>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {s.protocolSteps.map((p) => (
                <div
                  key={p.step}
                  className="rounded-3xl border border-edge/80 bg-abyss/75 p-6 backdrop-blur"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-semibold tracking-[0.24em] text-gold">
                      {p.step}
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
                  </div>
                  <h4 className="mt-3 font-display text-2xl font-light text-ivory">{p.title}</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-mist">{p.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-20 grid gap-14 lg:grid-cols-[6fr_5fr] lg:gap-20">
          <div>
            <SectionHeading
              overline={s.overline}
              chapter={s.chapter}
              title={
                <>
                  {s.titlePrefix}
                  <em className="bg-gradient-to-r from-goldbright to-gold bg-clip-text text-transparent">
                    {s.titleHighlight}
                  </em>
                </>
              }
              sub={s.subtitle}
            />

            {/* Direct Phone / WhatsApp / Telegram / Email Buttons */}
            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`tel:${c.phoneHref}`}
                  className="inline-flex items-center gap-2.5 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-[#1a1206] shadow-[0_0_28px_rgba(230,180,90,0.28)] transition-all hover:bg-goldbright"
                >
                  <Phone className="h-4 w-4" />
                  {s.callLabel} {c.phoneDisplay}
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-malachite/60 bg-malachite/15 px-6 py-3.5 text-sm font-bold text-malachite transition-all hover:bg-malachite/25"
                >
                  <MessageCircle className="h-4 w-4" />
                  {s.whatsappLabel}
                </a>
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-azurite/60 bg-azurite/15 px-6 py-3.5 text-sm font-bold text-azurite transition-all hover:bg-azurite/25"
                >
                  <Send className="h-4 w-4" />
                  {s.telegramLabel}
                </a>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {s.infoCards.map((card, i) => {
                const IconComp = ICON_MAP[card.icon] ?? Clock;
                return (
                  <Reveal key={card.id} delay={0.08 * i}>
                    <div className="shine h-full rounded-3xl border border-edge bg-surface p-6 transition-all duration-300 hover:-translate-y-1">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                        style={{
                          borderColor: `${card.accent}55`,
                          background: `${card.accent}14`,
                          color: card.accent,
                        }}
                      >
                        <IconComp className="h-5 w-5" />
                      </span>
                      <h4 className="mt-4 text-sm font-bold tracking-wide text-ivory uppercase">
                        {card.title}
                      </h4>
                      <ul className="mt-3 space-y-1.5">
                        {card.lines.map((l) => (
                          <li key={l} className="text-[13px] leading-snug text-mist">
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Direct Message Inquiry Card */}
          <Reveal delay={0.15} y={36}>
            <div className="relative h-full overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-raised to-surface p-8 sm:p-10">
              <div
                className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/12 blur-[80px]"
                aria-hidden
              />
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
                <Mail className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-3xl font-light text-ivory">
                {s.inquiryTitlePrefix}
                <em className="text-goldbright">{s.inquiryTitleHighlight}</em>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{s.inquiryDescription}</p>

              {state === "done" ? (
                <div className="mt-7 animate-[fadeIn_0.35s_ease] space-y-4 rounded-2xl border border-malachite/40 bg-malachite/10 p-5">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-malachite text-ink">
                      <Check className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-malachite">{s.successTitle}</p>
                      <p className="mt-1 text-xs leading-relaxed text-mist">
                        {s.successText
                          .replace(/\{name\}/g, name.trim() ? `, ${name.trim()}` : "")
                          .split("{contact}")[0]}
                        <span className="font-semibold text-ivory">{contact.trim()}</span>
                        {s.successText.split("{contact}")[1] ?? ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setState("idle");
                      setName("");
                      setContact("");
                      setMessage("");
                      setSpecimenId("");
                    }}
                    className="text-xs font-bold text-goldbright hover:underline"
                  >
                    {s.sendAnotherText}
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className={cn("mt-6 space-y-3", state === "error" && "shake")} noValidate>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={s.namePlaceholder}
                      aria-label={lang === "ar" ? "اسمك" : "Your name"}
                      className="rounded-2xl border border-edge bg-abyss/90 px-4 py-3 text-sm text-ivory placeholder:text-dusk focus:border-gold focus:ring-2 focus:ring-gold/25 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (state === "error") setState("idle");
                      }}
                      placeholder={s.contactPlaceholder}
                      aria-label={lang === "ar" ? "الهاتف أو البريد الإلكتروني" : "Phone or Email"}
                      aria-invalid={state === "error"}
                      className={cn(
                        "rounded-2xl border bg-abyss/90 px-4 py-3 text-sm text-ivory placeholder:text-dusk focus:ring-2 focus:outline-none",
                        state === "error"
                          ? "border-rhodo focus:border-rhodo focus:ring-rhodo/30"
                          : "border-edge focus:border-gold focus:ring-gold/25"
                      )}
                    />
                  </div>
                  <select
                    value={specimenId}
                    onChange={(e) => setSpecimenId(e.target.value)}
                    aria-label={lang === "ar" ? "العينة موضع الاهتمام" : "Specimen of interest"}
                    className="w-full rounded-2xl border border-edge bg-abyss/90 px-4 py-3 text-sm text-mist focus:border-gold focus:outline-none [&>option]:bg-surface"
                  >
                    <option value="">{s.generalInquiryLabel}</option>
                    {config.minerals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.catalog})
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={s.messagePlaceholder}
                    aria-label={lang === "ar" ? "رسالة الاستفسار" : "Inquiry message"}
                    className="w-full rounded-2xl border border-edge bg-abyss/90 px-4 py-3 text-sm text-ivory placeholder:text-dusk focus:border-gold focus:ring-2 focus:ring-gold/25 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p
                      className={cn(
                        "text-xs",
                        state === "error" ? "font-semibold text-rhodo" : "text-dusk"
                      )}
                      role={state === "error" ? "alert" : undefined}
                    >
                      {state === "error" ? errMsg : c.availabilityNote}
                    </p>
                    <button
                      type="submit"
                      className="group flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a1206] transition-all hover:bg-goldbright"
                    >
                      {s.sendButtonText}
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
