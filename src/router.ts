import { useEffect, useState } from "react";
import { slugifyCategory } from "./data/categoryPages";

/**
 * Hash-based SPA router.
 *
 * The site is a true single-page application (one HTML document, no reloads),
 * but every category gets its own deep-linkable page:
 *
 *   #/                        → home (the long single-page exhibition)
 *   #/category/<slug>         → a dedicated page for one category
 *   #/highlights, #/cabinets, #/collection, #/glow-room, #/deep-time,
 *   #/field-notes, #/contact  → a dedicated page for each header-nav button
 *   #collection / #visit ...  → legacy one-page anchors on the home page
 *   #admin                    → home + admin panel (legacy shortcut)
 *
 * Hash routing is used deliberately: it works on any static host
 * (GitHub Pages under /ziba/, file:// previews, plain static servers)
 * without rewrite rules, and every category page stays shareable.
 */

/** Every header-navigation destination gets its own dedicated page. */
export type NavPageId =
  | "highlights"
  | "categories"
  | "collection"
  | "glow"
  | "deeptime"
  | "stories"
  | "visit";

export type Route =
  | { name: "home"; anchor?: string }
  | { name: "category"; slug: string }
  | { name: "page"; page: NavPageId }
  | { name: "not-found"; path: string };

/** Canonical URL slug for each navigation page. */
export const PAGE_PATHS: Record<NavPageId, string> = {
  highlights: "highlights",
  categories: "cabinets",
  collection: "collection",
  glow: "glow-room",
  deeptime: "deep-time",
  stories: "field-notes",
  visit: "contact",
};

const SLUG_TO_PAGE: Record<string, NavPageId> = {
  highlights: "highlights",
  cabinets: "categories",
  categories: "categories",
  collection: "collection",
  "glow-room": "glow",
  glow: "glow",
  "deep-time": "deeptime",
  deeptime: "deeptime",
  "field-notes": "stories",
  stories: "stories",
  journal: "stories",
  contact: "visit",
  visit: "visit",
  salon: "visit",
};

export function pageHref(page: NavPageId): string {
  return `#/${PAGE_PATHS[page]}`;
}

export function navigatePage(page: NavPageId) {
  window.location.hash = `/${PAGE_PATHS[page]}`;
}

const LEGACY_ANCHORS = new Set([
  "hero",
  "intro",
  "highlights",
  "categories",
  "collection",
  "glow",
  "deeptime",
  "stories",
  "visit",
  "exhibition",
]);

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, "");

  if (raw === "" || raw === "/") return { name: "home" };

  if (raw.startsWith("/")) {
    const parts = raw.split("/").filter(Boolean);
    if (parts.length === 0) return { name: "home" };
    if (parts[0] === "category" && parts[1]) {
      return { name: "category", slug: decodeURIComponent(parts[1]).toLowerCase() };
    }
    if (parts.length === 1 && SLUG_TO_PAGE[parts[0].toLowerCase()]) {
      return { name: "page", page: SLUG_TO_PAGE[parts[0].toLowerCase()] };
    }
    return { name: "not-found", path: raw };
  }

  // Legacy plain anchors: #collection, #visit, #admin …
  if (raw === "admin") return { name: "home" };
  if (LEGACY_ANCHORS.has(raw)) return { name: "home", anchor: raw };
  return { name: "home", anchor: raw };
}

export function currentRoute(): Route {
  if (typeof window === "undefined") return { name: "home" };
  return parseHash(window.location.hash);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => currentRoute());

  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

/** Go to the home page, optionally landing on a section anchor. */
export function navigateHome(anchor?: string) {
  const wasHome =
    currentRoute().name === "home" && !window.location.hash.startsWith("#/category");
  if (window.location.hash !== "#/" && window.location.hash !== "" && !wasHome) {
    // Route change → App scrolls to the anchor once home has rendered.
    pendingAnchor = anchor;
    window.location.hash = "/";
  } else if (window.location.hash.startsWith("#/")) {
    pendingAnchor = anchor;
    window.location.hash = "/";
  } else {
    pendingAnchor = anchor;
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

let pendingAnchor: string | undefined;

/** Consume (once) the anchor queued by navigateHome during a route change. */
export function takePendingAnchor(): string | undefined {
  const a = pendingAnchor;
  pendingAnchor = undefined;
  return a;
}

export function categoryHref(categoryName: string): string {
  return `#/category/${slugifyCategory(categoryName)}`;
}

export function navigateCategory(categoryName: string) {
  window.location.hash = `/category/${slugifyCategory(categoryName)}`;
}

export const HOME_HREF = "#/";
