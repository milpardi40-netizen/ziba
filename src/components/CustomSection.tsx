import { ArrowRight, Check } from "lucide-react";
import type { CustomSectionItem } from "../data/defaults";
import { useCms } from "../data/store";
import SpecimenImage from "./SpecimenImage";
import { Reveal, SectionHeading } from "./ui";

/**
 * Renders an admin-authored custom section. Every word, the photo,
 * the accent, the layout and the call-to-action come from the Admin
 * Panel (Sections → Add Section) — nothing here is hard-coded.
 */
export default function CustomSection({ section }: { section: CustomSectionItem }) {
  const { getPhoto } = useCms();
  const accent = section.accent || "#e6b45a";
  const hasPhoto = Boolean(section.photoId);
  const photo = hasPhoto ? getPhoto(section.photoId) : null;

  const heading = (
    <SectionHeading
      overline={section.overline}
      title={
        <>
          {section.titlePrefix}{" "}
          <em style={{ color: accent }}>{section.titleHighlight}</em>
        </>
      }
      sub={section.subtitle || undefined}
      accent={accent}
      align={section.layout === "center" ? "center" : "left"}
    />
  );

  const cta = section.ctaText && section.ctaHref && (
    <a
      href={section.ctaHref}
      {...(section.ctaHref.startsWith("http")
        ? { target: "_blank", rel: "noreferrer" }
        : {})}
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#14100a] transition-transform hover:scale-[1.02]"
      style={{ background: accent }}
    >
      {section.ctaText} <ArrowRight className="h-4 w-4" />
    </a>
  );

  return (
    <section
      id={section.id}
      className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32"
      aria-label={section.label}
    >
      <div className="absolute inset-x-0 top-0 rule-gem opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute top-24 right-0 h-[22rem] w-[22rem] rounded-full opacity-[0.07] blur-[130px]"
        style={{ background: accent }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {section.layout === "split" ? (
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              {heading}
              {section.body && (
                <Reveal delay={0.2}>
                  <p className="mt-5 leading-relaxed text-mist">{section.body}</p>
                </Reveal>
              )}
              {section.points.length > 0 && (
                <Reveal delay={0.26}>
                  <ul className="mt-7 space-y-3">
                    {section.points.filter(Boolean).map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-sm text-mist">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{ background: `${accent}22`, color: accent }}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
              {cta && (
                <Reveal delay={0.32}>
                  <div className="mt-8">{cta}</div>
                </Reveal>
              )}
            </div>
            {photo && (
              <Reveal delay={0.15} y={40}>
                <div
                  className="overflow-hidden rounded-3xl border"
                  style={{ borderColor: `${accent}44`, boxShadow: `0 30px 80px -32px ${accent}55` }}
                >
                  <SpecimenImage photo={photo} accent={accent} variant="feature" />
                </div>
              </Reveal>
            )}
          </div>
        ) : (
          <>
            {heading}
            {section.body && (
              <Reveal delay={0.2}>
                <p
                  className={
                    "mt-5 max-w-3xl leading-relaxed text-mist " +
                    (section.layout === "center" ? "mx-auto text-center" : "")
                  }
                >
                  {section.body}
                </p>
              </Reveal>
            )}
            {section.points.length > 0 &&
              (section.layout === "cards" ? (
                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.points.filter(Boolean).map((pt, i) => (
                    <Reveal key={pt} delay={Math.min(i * 0.07, 0.35)}>
                      <article className="h-full rounded-3xl border border-edge bg-surface/80 p-6">
                        <span
                          className="font-display text-4xl font-light italic"
                          style={{ color: `${accent}66` }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="mt-3 text-sm leading-relaxed text-mist">{pt}</p>
                      </article>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <Reveal delay={0.24}>
                  <ul className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3">
                    {section.points.filter(Boolean).map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-sm text-mist">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{ background: `${accent}22`, color: accent }}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            {photo && (
              <Reveal delay={0.15} y={40}>
                <div
                  className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border"
                  style={{ borderColor: `${accent}44`, boxShadow: `0 30px 80px -32px ${accent}55` }}
                >
                  <SpecimenImage photo={photo} accent={accent} variant="feature" />
                </div>
              </Reveal>
            )}
            {cta && (
              <Reveal delay={0.3}>
                <div className={"mt-10 " + (section.layout === "center" ? "text-center" : "")}>
                  {cta}
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>
    </section>
  );
}
