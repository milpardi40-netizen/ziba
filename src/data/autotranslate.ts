/**
 * Automatic English → Arabic content synchronisation.
 *
 * The site keeps one base config (the admin's primary language) plus a
 * sparse Arabic string overlay (`config.ar`). When the admin adds,
 * deletes or edits content in English, the structural change already
 * applies to both languages because rendering merges the overlay over
 * the shared base. What used to go stale was the *wording*: an edited
 * English sentence kept its old Arabic translation.
 *
 * This module closes that gap:
 *  - `collectChangedLeaves` diffs two configs and returns every
 *    human-readable string leaf that was added or edited.
 *  - `collectUntranslatedLeaves` finds strings whose Arabic rendering
 *    is still the English source (never translated).
 *  - `translateEnToAr` machine-translates a string (MyMemory, then the
 *    Google endpoint, then `null` so the caller can fall back to
 *    copying the English — the change still reflects in Arabic).
 *  - `setAtPath` writes a translated leaf into the overlay.
 *
 * Technical fields (ids, colours, formulas, photo references, URLs,
 * internal category keys…) are never sent for translation.
 */

export type LeafPath = (string | number)[];

export interface ChangedLeaf {
  path: LeafPath;
  text: string;
}

const SKIP_SUBTREES = new Set(["ar", "inquiries", "media", "sectionsOrder"]);
const SKIP_KEYS = new Set([
  "id",
  "color",
  "accent",
  "tagColor",
  "photoId",
  "backdropPhotoIds",
  "slideSpecimenIds",
  "href",
  "icon",
  "catalog",
  "formula",
  "size",
  "mohsLabel",
  "acquired",
  "step",
  "src",
  "sourceUrl",
  "licenseUrl",
  "license",
  "author",
  "name",
  "category",
  "targetId",
  "locality",
  "curatorName",
  "curatorInitials",
  "phoneDisplay",
  "phoneHref",
  "whatsappNumber",
  "telegramHandle",
  "email",
  "featuredSpecimenId",
  "tourPhotoId",
]);

export function isHumanText(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const t = value.trim();
  if (t.length < 2) return false;
  if (!/[A-Za-z]/.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return false;
  if (t.startsWith("#") || t.startsWith("/") || t.startsWith("mailto:") || t.startsWith("tel:")) return false;
  if (/^#[0-9a-f]{3,8}$/i.test(t)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false;
  if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(t)) return false; // slug / generated id
  if (/^[A-Z][A-Z0-9 .&'-]{1,5}$/.test(t)) return false; // short acronym labels
  return true;
}

function idOf(v: unknown): string | undefined {
  return v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string"
    ? (v as { id: string }).id
    : undefined;
}

function walkChanged(
  prev: unknown,
  next: unknown,
  path: LeafPath,
  key: string,
  out: ChangedLeaf[]
): void {
  if (SKIP_KEYS.has(key)) return;
  if (typeof next === "string") {
    if (prev !== next && isHumanText(next)) out.push({ path, text: next });
    return;
  }
  if (Array.isArray(next)) {
    const prevArr = Array.isArray(prev) ? prev : [];
    next.forEach((item, i) => {
      const id = idOf(item);
      const match =
        id !== undefined ? prevArr.find((p) => idOf(p) === id) : prevArr[i];
      walkChanged(match, item, [...path, i], key, out);
    });
    return;
  }
  if (next && typeof next === "object") {
    const prevObj =
      prev && typeof prev === "object" && !Array.isArray(prev)
        ? (prev as Record<string, unknown>)
        : {};
    for (const k of Object.keys(next as Record<string, unknown>)) {
      if (path.length === 0 && SKIP_SUBTREES.has(k)) continue;
      walkChanged(prevObj[k], (next as Record<string, unknown>)[k], [...path, k], k, out);
    }
  }
}

/** Every added/edited human-readable string between two configs. */
export function collectChangedLeaves(prev: unknown, next: unknown): ChangedLeaf[] {
  const out: ChangedLeaf[] = [];
  walkChanged(prev, next, [], "", out);
  return out;
}

function walkUntranslated(
  base: unknown,
  effective: unknown,
  path: LeafPath,
  key: string,
  out: ChangedLeaf[]
): void {
  if (SKIP_KEYS.has(key)) return;
  if (typeof base === "string") {
    if (isHumanText(base) && effective === base) out.push({ path, text: base });
    return;
  }
  if (Array.isArray(base)) {
    const effArr = Array.isArray(effective) ? effective : [];
    base.forEach((item, i) => {
      const id = idOf(item);
      const match =
        id !== undefined ? effArr.find((p) => idOf(p) === id) : effArr[i];
      walkUntranslated(item, match, [...path, i], key, out);
    });
    return;
  }
  if (base && typeof base === "object") {
    const effObj =
      effective && typeof effective === "object" && !Array.isArray(effective)
        ? (effective as Record<string, unknown>)
        : {};
    for (const k of Object.keys(base as Record<string, unknown>)) {
      if (path.length === 0 && SKIP_SUBTREES.has(k)) continue;
      walkUntranslated(
        (base as Record<string, unknown>)[k],
        effObj[k],
        [...path, k],
        k,
        out
      );
    }
  }
}

/** Strings still rendering as English in Arabic mode (never translated). */
export function collectUntranslatedLeaves(base: unknown, effectiveAr: unknown): ChangedLeaf[] {
  const out: ChangedLeaf[] = [];
  walkUntranslated(base, effectiveAr, [], "", out);
  return out;
}

/** Immutably set `value` at `path`, creating objects/arrays as needed. */
export function setAtPath(root: unknown, path: LeafPath, value: string): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (typeof head === "number") {
    const arr = Array.isArray(root) ? [...root] : [];
    arr[head] = setAtPath(arr[head], rest, value);
    return arr;
  }
  const obj: Record<string, unknown> =
    root && typeof root === "object" && !Array.isArray(root)
      ? { ...(root as Record<string, unknown>) }
      : {};
  obj[head] = setAtPath(obj[head], rest, value);
  return obj;
}

/* ------------------------------------------------------------------ */
/* Machine translation                                                 */
/* ------------------------------------------------------------------ */

const cache = new Map<string, string>();

function protectPlaceholders(text: string): { text: string; tokens: string[] } {
  const tokens: string[] = [];
  const protectedText = text.replace(/\{(\w+)\}/g, (_m, name: string) => {
    tokens.push(name);
    return `ZXQ${tokens.length - 1}QXZ`;
  });
  return { text: protectedText, tokens };
}

function restorePlaceholders(text: string, tokens: string[]): string {
  return text.replace(/ZXQ(\d+)QXZ/gi, (_m, i: string) => `{${tokens[Number(i)] ?? ""}}`);
}

async function fetchJson(url: string, timeoutMs = 9000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function viaMyMemory(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`;
  const data = (await fetchJson(url)) as {
    responseData?: { translatedText?: string };
  };
  const out = data?.responseData?.translatedText?.trim();
  if (!out || /MYMEMORY WARNING|INVALID|QUERY LENGTH LIMIT/i.test(out)) {
    throw new Error("MyMemory unavailable");
  }
  return out;
}

async function viaGoogle(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`;
  const data = (await fetchJson(url)) as unknown;
  const segments = (data as [ [ [string] ] ])?.[0];
  if (!Array.isArray(segments)) throw new Error("Google unavailable");
  const out = segments.map((s) => s?.[0] ?? "").join("").trim();
  if (!out) throw new Error("Google unavailable");
  return out;
}

/**
 * Translate one English string to Arabic. Returns `null` when no
 * translation service is reachable (offline / rate-limited) — callers
 * then copy the English so the admin's change is never lost.
 */
export async function translateEnToAr(text: string): Promise<string | null> {
  const cached = cache.get(text);
  if (cached) return cached;
  const { text: safe, tokens } = protectPlaceholders(text);
  try {
    let out: string;
    try {
      out = await viaMyMemory(safe);
    } catch {
      out = await viaGoogle(safe);
    }
    out = restorePlaceholders(out, tokens);
    if (out && out !== text) cache.set(text, out);
    return out || null;
  } catch {
    return null;
  }
}
