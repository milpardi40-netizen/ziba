import express from "express";
import mysql from "mysql2/promise";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));
const pool = mysql.createPool(process.env.DATABASE_URL);
const SESSION_COOKIE = "ziba_admin_session";
const STATE_COOKIE = "ziba_oauth_state";
const COOKIE_BASE = `Path=/; Secure; HttpOnly; SameSite=None`;
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const rand = (n=32) => crypto.randomBytes(n).toString("base64url");

await pool.execute(`CREATE TABLE IF NOT EXISTS site_content (id TINYINT PRIMARY KEY, payload LONGTEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
await pool.execute(`CREATE TABLE IF NOT EXISTS admin_sessions (token_hash CHAR(64) PRIMARY KEY, email VARCHAR(320) NOT NULL, expires_at DATETIME NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(expires_at))`);

function cookie(req, name) {
  const raw = req.headers.cookie || "";
  const item = raw.split(";").map((x) => x.trim()).find((x) => x.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : "";
}
function setCookie(res, name, value, age) {
  res.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; ${COOKIE_BASE}; Max-Age=${age}`);
}
function clearCookie(res, name) { res.append("Set-Cookie", `${name}=; ${COOKIE_BASE}; Max-Age=0`); }
async function currentAdmin(req) {
  const token = cookie(req, SESSION_COOKIE);
  if (!token) return null;
  const [rows] = await pool.execute("SELECT email FROM admin_sessions WHERE token_hash=? AND expires_at > UTC_TIMESTAMP() LIMIT 1", [sha(token)]);
  const email = rows[0]?.email;
  return email && email.toLowerCase() === (process.env.ZIBA_ADMIN_EMAIL || "").trim().toLowerCase() ? email : null;
}
async function requireAdmin(req, res, next) {
  try { req.adminEmail = await currentAdmin(req); if (!req.adminEmail) return res.status(401).json({ error: "admin_auth_required" }); next(); }
  catch (e) { console.error("admin auth failed", e); res.status(500).json({ error: "auth_unavailable" }); }
}
function safeOrigin(req, supplied) {
  let target;
  try { target = new URL(String(supplied || "")); } catch { return null; }
  if (target.protocol !== "https:" && target.hostname !== "localhost") return null;
  const referer = req.get("referer");
  if (!referer) return null;
  try { if (new URL(referer).origin !== target.origin) return null; } catch { return null; }
  return target.origin;
}

app.get("/api/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ ok: true, database: "connected" }); }
  catch { res.status(503).json({ ok: false, database: "unavailable" }); }
});

app.get("/api/auth/session", async (req, res) => {
  try { const email = await currentAdmin(req); res.json({ authenticated: !!email, email: email || null }); }
  catch { res.status(500).json({ authenticated: false }); }
});
app.get("/api/auth/login", (req, res) => {
  const origin = safeOrigin(req, req.query.origin);
  if (!origin || !process.env.MANUS_PROJECT_ID || !process.env.MANUS_OAUTH_PORTAL_URL) return res.status(400).send("Invalid login origin or unavailable OAuth configuration");
  const nonce = rand(24);
  const state = Buffer.from(JSON.stringify({ nonce, redirectUri: `${origin}/api/auth/callback` })).toString("base64url");
  setCookie(res, STATE_COOKIE, nonce, 600);
  const url = new URL(`${process.env.MANUS_OAUTH_PORTAL_URL.replace(/\/$/, "")}/app-auth`);
  url.searchParams.set("appId", process.env.MANUS_PROJECT_ID);
  url.searchParams.set("redirectUri", `${origin}/api/auth/callback`);
  url.searchParams.set("state", state);
  url.searchParams.set("responseType", "code");
  res.redirect(url.toString());
});
app.get("/api/auth/callback", async (req, res) => {
  try {
    const decoded = JSON.parse(Buffer.from(String(req.query.state || ""), "base64url").toString("utf8"));
    if (!decoded.nonce || decoded.nonce !== cookie(req, STATE_COOKIE)) return res.status(403).send("Login state verification failed");
    clearCookie(res, STATE_COOKIE);
    const callback = new URL(decoded.redirectUri);
    const code = String(req.query.code || "");
    if (!code || (callback.protocol !== "https:" && callback.hostname !== "localhost")) return res.status(400).send("Invalid OAuth callback");
    const exchange = await fetch(`${process.env.MANUS_OAUTH_API_URL}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: process.env.MANUS_PROJECT_ID, grantType: "authorization_code", code, redirectUri: decoded.redirectUri }),
    });
    if (!exchange.ok) throw new Error(`OAuth token exchange failed (${exchange.status})`);
    const token = await exchange.json();
    const infoRes = await fetch(`${process.env.MANUS_OAUTH_API_URL}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: token.accessToken }),
    });
    if (!infoRes.ok) throw new Error(`OAuth identity lookup failed (${infoRes.status})`);
    const user = await infoRes.json();
    const email = String(user.email || "").trim();
    const allow = String(process.env.ZIBA_ADMIN_EMAIL || "").trim();
    if (!allow || email.toLowerCase() !== allow.toLowerCase()) return res.status(403).send("This Manus account is not authorized as the site administrator.");
    const session = rand(32);
    await pool.execute("INSERT INTO admin_sessions (token_hash,email,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY))", [sha(session), email]);
    setCookie(res, SESSION_COOKIE, session, 604800);
    res.redirect(`${callback.origin}/#admin`);
  } catch (e) { console.error("OAuth callback failed", e); res.status(401).send("Administrator sign-in failed. Please try again."); }
});
app.post("/api/auth/logout", requireAdmin, async (req, res) => {
  await pool.execute("DELETE FROM admin_sessions WHERE token_hash=?", [sha(cookie(req, SESSION_COOKIE))]);
  clearCookie(res, SESSION_COOKIE); res.json({ ok: true });
});

app.get("/api/site", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT payload FROM site_content WHERE id=1");
    if (!rows.length) return res.json({ config: null });
    const config = JSON.parse(rows[0].payload);
    if (!(await currentAdmin(req))) config.inquiries = [];
    res.set("Cache-Control", "no-store").json({ config });
  } catch (e) { console.error("site read failed", e); res.status(500).json({ error: "site_read_failed" }); }
});
app.put("/api/site", requireAdmin, async (req, res) => {
  try {
    if (!req.body?.config || typeof req.body.config !== "object" || Array.isArray(req.body.config)) return res.status(400).json({ error: "invalid_config" });
    const payload = JSON.stringify(req.body.config);
    await pool.execute("INSERT INTO site_content (id,payload) VALUES (1,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)", [payload]);
    res.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (e) { console.error("site save failed", e); res.status(500).json({ error: "site_save_failed" }); }
});
app.post("/api/inquiries", async (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0,120);
  const contact = String(req.body?.contact || "").trim().slice(0,320);
  const message = String(req.body?.message || "").trim().slice(0,4000);
  if (contact.length < 5 || !message) return res.status(400).json({ error: "invalid_inquiry" });
  const inquiry = { id: `inq-${rand(12)}`, createdAt: new Date().toISOString(), name, contact, message,
    specimenId: String(req.body?.specimenId || "").slice(0,120) || undefined,
    specimenName: String(req.body?.specimenName || "").slice(0,160) || undefined,
    specimenCatalog: String(req.body?.specimenCatalog || "").slice(0,120) || undefined, status: "new" };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute("SELECT payload FROM site_content WHERE id=1 FOR UPDATE");
    const config = rows.length ? JSON.parse(rows[0].payload) : { inquiries: [] };
    config.inquiries = [inquiry, ...(Array.isArray(config.inquiries) ? config.inquiries : [])];
    await conn.execute("INSERT INTO site_content (id,payload) VALUES (1,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)", [JSON.stringify(config)]);
    await conn.commit(); res.status(201).json({ inquiry });
  } catch (e) { await conn.rollback(); console.error("inquiry save failed", e); res.status(500).json({ error: "inquiry_save_failed" }); }
  finally { conn.release(); }
});
app.patch("/api/inquiries/:id", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT payload FROM site_content WHERE id=1");
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    const config = JSON.parse(rows[0].payload);
    config.inquiries = (config.inquiries || []).map((i) => i.id === req.params.id ? { ...i, status: i.status === "new" ? "replied" : "new" } : i);
    await pool.execute("UPDATE site_content SET payload=? WHERE id=1", [JSON.stringify(config)]); res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "inquiry_update_failed" }); }
});
app.delete("/api/inquiries/:id", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT payload FROM site_content WHERE id=1");
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    const config = JSON.parse(rows[0].payload); config.inquiries = (config.inquiries || []).filter((i) => i.id !== req.params.id);
    await pool.execute("UPDATE site_content SET payload=? WHERE id=1", [JSON.stringify(config)]); res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "inquiry_delete_failed" }); }
});

app.use(express.static(path.join(root, "dist"), { index: false, maxAge: "1h" }));
app.get("*", (_req, res) => res.sendFile(path.join(root, "dist", "index.html")));
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`Ziba server listening on ${port}`));
