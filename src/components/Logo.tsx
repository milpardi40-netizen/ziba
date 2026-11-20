import lockupGold from "../assets/brand/vernajewel-lockup-gold.png";
import markGold from "../assets/brand/vernajewel-mark-gold.png";
import wordmarkGold from "../assets/brand/vernajewel-wordmark-gold.png";
import { cn } from "../utils/cn";

/**
 * Vernajewel brand system — derived from the owner's original artwork
 * (faceted gem cradling a native dendrite, with the script wordmark
 * beneath), rendered in the house gold: a vertical champagne-to-brass
 * gradient (#f9e7ac → #e6b45a → #b97e1e) carried on the artwork's own
 * alpha, so every facet keeps its original drawing. The plum originals
 * remain in `src/assets/brand/` as the source artwork.
 *
 *  · `LogoMark`    — the gem alone; header, hero seal, floating dock.
 *  · `LogoWordmark`— the script name alone; beside the mark in the header.
 *  · `LogoLockup`  — the full lockup; footer brand panel & brand moments.
 */

export function LogoMark({
  className,
}: {
  className?: string;
  /** @deprecated The gold mark is designed for every background. */
  light?: boolean;
}) {
  return (
    <img
      src={markGold}
      alt=""
      aria-hidden
      width={422}
      height={531}
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <img
      src={wordmarkGold}
      alt="Vernajewel"
      width={1055}
      height={274}
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

export function LogoLockup({
  className,
}: {
  className?: string;
  /** @deprecated The gold lockup is designed for every background. */
  light?: boolean;
}) {
  return (
    <img
      src={lockupGold}
      alt="Vernajewel — Haute Mineralogie"
      width={1200}
      height={1129}
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}
