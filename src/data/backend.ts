import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import type { BuyerInquiry } from "./defaults";

/**
 * Real backend (Supabase, free tier) — optional and progressive.
 *
 * The site works fully offline/localStorage-only when no backend is
 * configured. As soon as `VITE_SUPABASE_URL` and
 * `VITE_SUPABASE_ANON_KEY` are present at build time (GitHub Secrets →
 * workflow env), the site upgrades to:
 *
 *  · One shared `site_config` row in Postgres: the owner's admin edits
 *    are saved server-side and every visitor, on every device, sees
 *    the same published content (with realtime updates).
 *  · A real `inquiries` table: visitor form submissions are stored
 *    server-side and trigger the `notify-inquiry` Edge Function, which
 *    forwards them to the owner's Telegram and email.
 *  · Supabase Auth: only the signed-in owner can write config or read
 *    inquiries (enforced by Row Level Security — see
 *    `supabase/schema.sql`). The anon key below is safe to ship
 *    publicly precisely because RLS guards every table.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const backendEnabled: boolean = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = backendEnabled
  ? createClient(url as string, anonKey as string, {
      realtime: { params: { eventsPerSecond: 2 } },
    })
  : null;

export type { Session };

/* ------------------------------------------------------------------ */
/* Site config (single JSON row)                                       */
/* ------------------------------------------------------------------ */

export async function fetchRemoteConfig(): Promise<unknown | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_config")
    .select("config")
    .eq("id", "main")
    .maybeSingle();
  if (error || !data?.config) return null;
  return data.config;
}

/** Persist the published config. Strip local-only inquiry copies —
 *  the server keeps inquiries in their own table. RLS rejects the
 *  call unless the owner is signed in. */
export async function saveRemoteConfig(config: unknown): Promise<boolean> {
  if (!supabase) return false;
  const clean = { ...(config as Record<string, unknown>), inquiries: [] };
  const { error } = await supabase
    .from("site_config")
    .upsert(
      { id: "main", config: clean, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  return !error;
}

/* ------------------------------------------------------------------ */
/* Inquiries                                                           */
/* ------------------------------------------------------------------ */

export interface RemoteInquiryRow {
  id: string;
  created_at: string;
  name: string;
  contact: string;
  message: string;
  specimen_id: string | null;
  specimen_name: string | null;
  specimen_catalog: string | null;
  status: "new" | "replied";
}

export function rowToInquiry(row: RemoteInquiryRow): BuyerInquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    contact: row.contact,
    message: row.message,
    specimenId: row.specimen_id ?? undefined,
    specimenName: row.specimen_name ?? undefined,
    specimenCatalog: row.specimen_catalog ?? undefined,
    status: row.status,
  };
}

export async function insertRemoteInquiry(
  inquiry: Omit<BuyerInquiry, "id" | "createdAt" | "status">
): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      name: inquiry.name,
      contact: inquiry.contact,
      message: inquiry.message,
      specimen_id: inquiry.specimenId ?? null,
      specimen_name: inquiry.specimenName ?? null,
      specimen_catalog: inquiry.specimenCatalog ?? null,
    })
    .select()
    .single();
  if (error || !data) return;
  // Fire-and-forget: Telegram + email notification to the owner.
  // Failures here never block the visitor's successful submission.
  try {
    await supabase.functions.invoke("notify-inquiry", { body: { record: data } });
  } catch {
    /* notification is best-effort */
  }
}

export async function fetchRemoteInquiries(): Promise<BuyerInquiry[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error || !data) return null;
  return (data as RemoteInquiryRow[]).map(rowToInquiry);
}

export async function setRemoteInquiryStatus(
  id: string,
  status: "new" | "replied"
): Promise<void> {
  if (!supabase) return;
  await supabase.from("inquiries").update({ status }).eq("id", id);
}

export async function deleteRemoteInquiry(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("inquiries").delete().eq("id", id);
}

/* ------------------------------------------------------------------ */
/* Auth (owner)                                                        */
/* ------------------------------------------------------------------ */

export async function signInOwner(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Backend is not configured." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOutOwner(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
