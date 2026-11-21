import { useEffect, useState } from "react";
import { LockKeyhole, LoaderCircle, ShieldCheck } from "lucide-react";
import AdminPanel from "./AdminPanel";

export default function AdminAccess({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((s) => { if (alive) setEmail(s.authenticated ? s.email : null); })
      .catch(() => { if (alive) setEmail(null); })
      .finally(() => { if (alive) setChecking(false); });
    return () => { alive = false; };
  }, [open]);
  if (!open) return null;
  if (email) return <AdminPanel open={open} onClose={onClose} onLogout={async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setEmail(null);
    onClose();
  }} />;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/95 p-5 text-ivory backdrop-blur-xl" dir="rtl">
    <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-abyss p-8 text-center shadow-2xl">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-gold/10 text-gold"><LockKeyhole /></div>
      <h1 className="font-display text-2xl">ورود امن مدیر</h1>
      <p className="mt-3 text-sm leading-7 text-mist">دسترسی پنل فقط برای حساب مجاز مدیر فعال است.</p>
      {checking ? <div className="mt-6 inline-flex items-center gap-2 text-sm text-gold"><LoaderCircle className="h-4 w-4 animate-spin" />در حال بررسی نشست…</div> : <button onClick={() => { window.location.href = `/api/auth/login?origin=${encodeURIComponent(window.location.origin)}`; }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-[#1a1206] hover:bg-goldbright"><ShieldCheck className="h-4 w-4" />ورود با حساب Manus</button>}
      <button onClick={onClose} className="mt-5 block w-full text-xs text-dusk hover:text-ivory">بازگشت به سایت</button>
    </div>
  </div>;
}
