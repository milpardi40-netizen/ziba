import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Quote, X } from "lucide-react";
import { useEffect, useState } from "react";
import { type ArticleItem } from "../data/defaults";
import { useCms } from "../data/store";
import { Reveal, SectionHeading } from "./ui";
import SpecimenImage, { PhotoCredit } from "./SpecimenImage";

function ArticleModal({ article, onClose }: { article: ArticleItem | null; onClose: () => void }) {
  const { getPhoto } = useCms();

  useEffect(() => {
    if (!article) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [article, onClose]);

  const photo = article ? getPhoto(article.photoId) : null;

  return (
    <AnimatePresence>
      {article && photo && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={article.title}
        >
          <div className="absolute inset-0 bg-ink/85 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.article
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-edge bg-abyss sm:rounded-3xl"
          >
            <div className="relative shrink-0 border-b border-edge/45">
              <SpecimenImage photo={photo} accent={article.tagColor} variant="editorial" priority />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 bg-abyss/90 text-ivory backdrop-blur-md transition-colors hover:border-rhodo/60 hover:text-rhodo"
                aria-label="Close article"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              <div className="px-6 pt-5 pb-2 sm:px-8">
                <span
                  className="rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.22em] uppercase"
                  style={{ borderColor: `${article.tagColor}66`, color: article.tagColor, background: "rgba(11,23,26,0.82)" }}
                >
                  {article.tag}
                </span>
                <h3 className="mt-3 font-display text-3xl leading-tight font-light text-ivory sm:text-4xl">
                  {article.title}
                </h3>
              </div>
            </div>

            <div className="overflow-y-auto p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-edge/60 pb-5">
                <span className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border font-display text-xs"
                    style={{ borderColor: `${article.tagColor}55`, color: article.tagColor, background: `${article.tagColor}14` }}
                  >
                    {article.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ivory">{article.author}</span>
                    <span className="block font-mono text-[10px] tracking-wider text-dusk uppercase">{article.role}</span>
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-dusk">
                  <Clock className="h-3.5 w-3.5" /> {article.minutes} min read
                </span>
              </div>
              <PhotoCredit photo={photo} className="mt-3" />

              <div className="mt-6 space-y-5">
                {article.paragraphs.slice(0, 2).map((p, i) => (
                  <p key={i} className="leading-relaxed text-mist first:text-lg first:text-ivory/90">
                    {p}
                  </p>
                ))}
                {article.pullQuote && (
                  <blockquote
                    className="my-7 rounded-2xl border-l-2 bg-surface/95 p-6"
                    style={{ borderColor: article.tagColor }}
                  >
                    <Quote className="mb-2 h-4 w-4" style={{ color: article.tagColor }} />
                    <p className="font-display text-2xl leading-snug font-light text-ivory italic">
                      {article.pullQuote}
                    </p>
                  </blockquote>
                )}
                {article.paragraphs.slice(2).map((p, i) => (
                  <p key={i} className="leading-relaxed text-mist">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-edge/60 pt-6">
                <span className="font-mono text-[10px] tracking-[0.24em] text-dusk uppercase">
                  From the field notes
                </span>
                <button
                  onClick={onClose}
                  className="rounded-full border border-edge px-5 py-2.5 text-xs font-bold text-mist transition-colors hover:border-gold/60 hover:text-goldbright"
                >
                  Back to the gallery
                </button>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Stories() {
  const { config, getPhoto } = useCms();
  const s = config.stories;
  const [open, setOpen] = useState<ArticleItem | null>(null);

  return (
    <section id="stories" className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 rule-gem opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute top-32 -right-32 h-[26rem] w-[26rem] rounded-full bg-rhodo/8 blur-[130px]"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          overline={s.overline}
          chapter={s.chapter}
          title={
            <>
              {s.titlePrefix}
              <em className="bg-gradient-to-r from-rhodo to-goldbright bg-clip-text text-transparent">
                {s.titleHighlight}
              </em>
            </>
          }
          sub={s.subtitle}
          accent={s.accent}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {s.articles.map((a, i) => (
            <Reveal key={a.id} delay={0.1 * i} y={36} className="h-full">
              <button
                onClick={() => setOpen(a)}
                className="shine spotlight-card group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-edge bg-surface text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
              >
                <div className="flex w-full items-center justify-between bg-plate/35 px-5 py-3">
                  <span
                    className="font-mono text-[9px] tracking-[0.2em] uppercase"
                    style={{ color: a.tagColor }}
                  >
                    {a.tag}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-dusk">
                    <Clock className="h-3 w-3" /> {a.minutes} min
                  </span>
                </div>
                <SpecimenImage photo={getPhoto(a.photoId)} accent={a.tagColor} variant="editorial" />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl leading-snug font-light text-ivory transition-colors group-hover:text-goldbright">
                    {a.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{a.excerpt}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-edge/60 pt-4">
                    <span className="text-xs font-semibold text-dusk">{a.author}</span>
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-edge text-mist transition-all duration-300 group-hover:border-transparent group-hover:text-ink"
                      style={{ background: "transparent" }}
                    >
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-goldbright" />
                    </span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <ArticleModal article={open} onClose={() => setOpen(null)} />
    </section>
  );
}
