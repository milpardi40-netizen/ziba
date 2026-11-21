// ─────────────────────────────────────────────────────────────────────────
// notify-inquiry — Supabase Edge Function (Deno)
//
// Called by the website right after a visitor's inquiry is stored.
// Forwards the inquiry to the shop owner on every configured channel:
//
//   · Telegram — set secrets TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
//   · Email    — set secrets RESEND_API_KEY + NOTIFY_EMAIL
//                (optional FROM_EMAIL, defaults to Resend's test sender)
//
// Deploy (once):   supabase functions deploy notify-inquiry
// Set secrets:     supabase secrets set TELEGRAM_BOT_TOKEN=… \
//                    TELEGRAM_CHAT_ID=… RESEND_API_KEY=… NOTIFY_EMAIL=…
// Full walkthrough: BACKEND-SETUP.md in the repository root.
// ─────────────────────────────────────────────────────────────────────────

interface InquiryRecord {
  name?: string;
  contact?: string;
  message?: string;
  specimen_name?: string;
  specimen_catalog?: string;
  created_at?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function text(record: InquiryRecord): string {
  const lines = [
    "💎 New collector inquiry — Vernajewel",
    "",
    `Name: ${record.name ?? "—"}`,
    `Contact: ${record.contact ?? "—"}`,
  ];
  if (record.specimen_name) {
    lines.push(
      `Specimen: ${record.specimen_name}${
        record.specimen_catalog ? ` (${record.specimen_catalog})` : ""
      }`
    );
  }
  if (record.message) lines.push("", `Message:\n${record.message}`);
  return lines.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { record } = (await req.json()) as { record: InquiryRecord };
    if (!record) throw new Error("Missing record");
    const body = text(record);
    const sent: string[] = [];

    // Telegram (free, instant)
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (botToken && chatId) {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: body }),
        }
      );
      if (res.ok) sent.push("telegram");
    }

    // Email via Resend (free tier)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL");
    if (resendKey && notifyEmail) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: Deno.env.get("FROM_EMAIL") ?? "Vernajewel <onboarding@resend.dev>",
          to: [notifyEmail],
          subject: `💎 New inquiry from ${record.name ?? "a collector"}`,
          text: body,
        }),
      });
      if (res.ok) sent.push("email");
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
