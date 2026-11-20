import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const url = "file://" + path.resolve("dist/index.html");
mkdirSync("shots", { recursive: true });

const results = [];
const errors = [];
const check = (name, ok, extra = "") => {
  results.push(`${ok ? "PASS" : "FAIL"} — ${name}${extra ? " · " + extra : ""}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});

await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: "shots/01-hero.png" });
check("hero renders title", await page.getByText("Mineral World").first().isVisible());

// ——— Hero specimen slider ———
const carousel = page.getByRole("region", { name: "Featured specimens" });
check("hero slider renders", await carousel.isVisible());
check("slider starts at 01", await carousel.getByText(/Featured specimen · 01/).isVisible());
await carousel.hover();
await page.waitForTimeout(300); // let the pause-on-hover take effect
const chipBefore = await carousel.getByText(/Featured specimen · 0\d/).textContent();
const idxBefore = Number(chipBefore.match(/· 0(\d)/)[1]);
const slideOne = await carousel.locator("h2").last().textContent();
await carousel.getByRole("button", { name: "Next featured specimen" }).click();
await page.waitForTimeout(1000);
const slideTwo = await carousel.locator("h2").last().textContent();
check("slider advances on next", slideOne !== slideTwo, `${slideOne} → ${slideTwo}`);
const chipAfter = await carousel.getByText(/Featured specimen · 0\d/).textContent();
const idxAfter = Number(chipAfter.match(/· 0(\d)/)[1]);
check("slider chip increments by one", idxAfter === (idxBefore % 5) + 1, `${idxBefore} → ${idxAfter}`);
await page.screenshot({ path: "shots/01b-hero-slide-2.png" });
await carousel.getByRole("tab", { name: /Show/ }).nth(3).click();
await page.waitForTimeout(1000);
check("slider dot navigation works", await carousel.getByText(/Featured specimen · 04/).isVisible());
await page.mouse.move(10, 10);
await page.waitForTimeout(6200);
check("slider auto-rotates when idle", await carousel.getByText(/Featured specimen · 05/).isVisible());

// ——— Hero cinematic background slider ———
const bgLayer = page.locator("section[aria-label$='exhibition introduction'] [data-backdrop]");
const bgStart = Number(await bgLayer.getAttribute("data-backdrop"));
check("hero background slider mounted", bgStart >= 0 && bgStart <= 3, `backdrop=${bgStart}`);
const bgImgCount = await bgLayer.locator("img").count();
check("background renders a plate", bgImgCount >= 1, `${bgImgCount} img`);
await page.waitForTimeout(7600);
const bgNext = Number(await bgLayer.getAttribute("data-backdrop"));
check("background rotates to next plate", bgNext === (bgStart + 1) % 4, `backdrop ${bgStart} → ${bgNext}`);
await page.screenshot({ path: "shots/01c-hero-backdrop-2.png" });


// ——— Collection: search ———
await page.locator("#collection").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: "shots/02-collection.png" });
const search = page.getByLabel("Search specimens");
await search.fill("copper");
await page.waitForTimeout(600);
let count = await page.locator("#collection article").count();
check("search 'copper' finds specimens", count >= 1, `${count} cards`);
await search.fill("pakistan");
await page.waitForTimeout(600);
count = await page.locator("#collection article").count();
check("search 'pakistan' → aquamarine only", count === 1, `${count} cards`);
await search.fill("zzzz");
await page.waitForTimeout(600);
check("empty state appears", await page.getByText("No specimens match").isVisible());
await page.getByRole("button", { name: "Show all specimens" }).click();
await page.waitForTimeout(600);
count = await page.locator("#collection article").count();
check("reset restores 10 cards", count === 10, `${count}`);

// ——— Category + sort ———
await page.locator("#collection").getByRole("button", { name: "Meteorites", exact: true }).click();
await page.waitForTimeout(600);
count = await page.locator("#collection article").count();
check("Meteorites filter → 1 card", count === 1, `${count}`);
await page.getByRole("button", { name: "Reset filters" }).click();
await page.getByLabel("Sort specimens").selectOption("hard-desc");
await page.waitForTimeout(700);
const firstName = await page.locator("#collection article h3").first().textContent();
check("sort hardest first → Aquamarine", firstName.includes("Aquamarine"), firstName);

// ——— Favorites + persistence ———
await page.locator("#collection article button[aria-label^='Save']").first().click();
await page.waitForTimeout(400);
const savedBadge = await page.getByRole("button", { name: /Saved/ }).first().textContent();
check("favorite count updates", savedBadge.includes("1"), savedBadge.trim());
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(2000);
await page.locator("#collection").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const persisted = await page.locator("#collection button[aria-label^='Remove']").count();
check("favorite persists after reload", persisted === 1, `${persisted} saved`);

// ——— Specimen modal ———
await page.locator("#collection article button[aria-label^='Open specimen']").first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: "shots/03-modal.png" });
check("modal opens", await page.getByRole("dialog").isVisible());
const title1 = await page.getByRole("dialog").locator("h3").textContent();
await page.getByRole("button", { name: "Next specimen" }).click();
await page.waitForTimeout(600);
const title2 = await page.getByRole("dialog").locator("h3").textContent();
check("modal next navigates", title1 !== title2, `${title1} → ${title2}`);
await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(500);
const title3 = await page.getByRole("dialog").locator("h3").textContent();
check("keyboard prev works", title3 === title1, title3);
await page.keyboard.press("Escape");
await page.waitForTimeout(500);
check("ESC closes modal", (await page.getByRole("dialog").count()) === 0);

// ——— Glow room ———
await page.locator("#glow").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.screenshot({ path: "shots/04-glow-on.png" });
check("lamp starts ON", await page.getByText("UV lamp · 254 nm").isVisible());
await page.getByRole("button", { name: "Longwave · 365" }).click();
await page.waitForTimeout(500);
check("wavelength switches", await page.getByText("UV lamp · 365 nm").isVisible());
await page.getByRole("switch", { name: "Toggle ultraviolet lamp" }).click();
await page.waitForTimeout(800);
check("lamp OFF state", await page.getByText("Daylight · lamp off").isVisible());
await page.screenshot({ path: "shots/05-glow-off.png" });
await page.getByRole("button", { name: "Reset console" }).click();
await page.waitForTimeout(500);
check("console reset", await page.getByText("UV lamp · 254 nm").isVisible());

// ——— Deep time ———
await page.locator("#deeptime").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: "shots/06-deeptime.png" });
await page.getByRole("button", { name: "Later eras" }).click();
await page.waitForTimeout(900);
const scrolled = await page.evaluate(() => {
  const els = document.querySelectorAll("#deeptime .overflow-x-auto");
  return els.length ? els[0].scrollLeft : -1;
});
check("timeline scrolls", scrolled > 100, `scrollLeft=${Math.round(scrolled)}`);

// ——— Stories ———
await page.locator("#stories").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: "shots/07-stories.png" });
await page.getByRole("button", { name: /What exactly is a mineral/ }).click();
await page.waitForTimeout(700);
check("article modal opens", await page.getByRole("dialog").isVisible());
await page.screenshot({ path: "shots/08-article.png" });
await page.getByRole("button", { name: "Back to the gallery" }).click();
await page.getByRole("dialog").waitFor({ state: "detached", timeout: 3000 }).catch(() => {});
check("article closes", (await page.getByRole("dialog").count()) === 0);

// ——— Tour + Direct Contact Inquiry ———
await page.locator("#visit").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: "shots/09-visit.png" });
await page.getByLabel("Phone or Email").fill("12");
await page.getByRole("button", { name: "Send Message" }).click();
await page.waitForTimeout(500);
check("inquiry invalid contact → error", await page.getByRole("alert").isVisible());
await page.getByLabel("Your name").fill("Arash");
await page.getByLabel("Phone or Email").fill("+1 415 555 0199");
await page.getByLabel("Inquiry message").fill("Interested in Rhodochrosite provenance.");
await page.getByRole("button", { name: "Send Message" }).click();
await page.waitForTimeout(600);
check("inquiry submitted", await page.getByText("Message received.").isVisible());
await page.getByRole("button", { name: "Start the guided tour" }).click();
await page.waitForTimeout(800);
check("tour opens at stop 1", await page.getByText("Guided tour · stop 1 of 10").isVisible());
await page.screenshot({ path: "shots/10-tour.png" });
await page.getByRole("button", { name: "Next stop" }).click();
await page.waitForTimeout(600);
check("tour advances", await page.getByText("Guided tour · stop 2 of 10").isVisible());
await page.getByRole("button", { name: "Close specimen file" }).click();
await page.waitForTimeout(400);

// ——— Nav dedicated pages ———
await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Glow Room" }).click();
await page.waitForTimeout(1400);
check(
  "nav button opens its dedicated page",
  (await page.evaluate(() => location.hash)) === "#/glow-room" &&
    (await page.getByText("awaken in the dark").first().isVisible()),
  await page.evaluate(() => location.hash)
);
await page.evaluate(() => { location.hash = "#/"; });
await page.waitForTimeout(1200);

// ——— Floating contact dock + instant scroll ———
await page.getByRole("button", { name: /Contact the site admin/ }).click();
await page.waitForTimeout(600);
check("contact dock opens admin channels", await page.getByRole("menuitem", { name: /WhatsApp/ }).isVisible());
check("contact dock offers Telegram", await page.getByRole("menuitem", { name: /Telegram/ }).isVisible());
check("contact dock offers email", await page.getByRole("menuitem", { name: /Email/ }).isVisible());
check("contact dock offers call", await page.getByRole("menuitem", { name: /Call the desk/ }).isVisible());
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Scroll to the bottom of the page" }).click();
await page.waitForTimeout(1600);
const nearBottom = await page.evaluate(() => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max - window.scrollY < 400;
});
check("one-tap scroll reaches the bottom", nearBottom);
await page.getByRole("button", { name: "Scroll to the top of the page" }).click();
await page.waitForTimeout(1600);
check("one-tap scroll returns to the top", (await page.evaluate(() => window.scrollY)) < 400);
await page.screenshot({ path: "shots/10b-floating-dock.png" });

// ——— Mobile ———
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on("pageerror", (e) => errors.push("mobile pageerror: " + e.message));
await mob.goto(url, { waitUntil: "load", timeout: 60000 });
await mob.waitForTimeout(2200);
await mob.screenshot({ path: "shots/11-mobile-hero.png" });
const overflowX = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("no horizontal overflow on mobile", overflowX <= 0, `overflow=${overflowX}px`);
await mob.getByRole("button", { name: "Open menu" }).click();
await mob.waitForTimeout(700);
await mob.screenshot({ path: "shots/12-mobile-menu.png" });
check("mobile menu opens", await mob.getByRole("navigation", { name: "Mobile" }).isVisible());
await mob.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: /Collection/ }).click();
await mob.waitForTimeout(1500);
await mob.screenshot({ path: "shots/13-mobile-collection.png" });
check("mobile menu navigates & closes", (await mob.getByRole("navigation", { name: "Mobile" }).count()) === 0);
await mob.locator("#collection article button[aria-label^='Open specimen']").first().click();
await mob.waitForTimeout(800);
await mob.screenshot({ path: "shots/14-mobile-modal.png" });
check("mobile modal opens", await mob.getByRole("dialog").isVisible());
await mob.getByRole("button", { name: "Close specimen file" }).click();
await mob.waitForTimeout(400);
await mob.evaluate(() => { location.hash = "#/"; });
await mob.waitForTimeout(1500);
const mobGlow = mob.locator("#glow");
await mobGlow.scrollIntoViewIfNeeded();
await mob.waitForTimeout(800);
await mob.screenshot({ path: "shots/15-mobile-glow.png" });

// ——— Admin Panel (0-to-100 CMS & Buyer Inbox) ———
await page.getByRole("button", { name: "Open Admin Panel" }).click();
await page.waitForTimeout(600);
check("admin panel opens", await page.getByRole("dialog", { name: "Admin Panel" }).isVisible());
await page.screenshot({ path: "shots/16-admin-sections.png" });

// Switch to English UI in admin for readable assertions
await page.getByRole("button", { name: "English UI" }).click();
await page.waitForTimeout(300);

// Verify Buyer Inbox received the inquiry we just sent
const adminDialog = page.getByRole("dialog", { name: "Admin Panel" });
await adminDialog.getByRole("button", { name: /Buyer Inbox/ }).click();
await page.waitForTimeout(400);
check("buyer inquiry appears in admin inbox", await adminDialog.getByText("Arash", { exact: true }).isVisible());
await page.screenshot({ path: "shots/17-admin-inbox.png" });

// Add a new category
await page.getByRole("button", { name: "Categories" }).click();
await page.waitForTimeout(300);
await page.getByPlaceholder("Category name…").fill("Rare Silicates");
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.waitForTimeout(400);
check("new category created", await page.locator('input[value="Rare Silicates"]').isVisible());

// Add a new specimen
await page.getByRole("button", { name: "Specimens" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Add New Specimen" }).click();
await page.waitForTimeout(300);
await page.getByLabel("Specimen Name *").fill("Emerald Matrix");
await page.getByRole("button", { name: "Save Specimen" }).click();
await page.waitForTimeout(400);
check("new specimen added in admin", await adminDialog.getByText("Emerald Matrix").isVisible());

// Create a fully custom section (0–100 section builder)
await adminDialog.getByRole("button", { name: "Sections", exact: true }).click();
await page.waitForTimeout(300);
await adminDialog.getByPlaceholder("New section name…").fill("Smoke Custom Room");
await adminDialog.getByRole("button", { name: "Create" }).click();
await page.waitForTimeout(500);
check("custom section builder opens its editor", await adminDialog.getByText("Edit Custom Section").isVisible());

// Close admin and verify live site updated
await page.getByRole("button", { name: "Back to Site" }).click();
await page.waitForTimeout(500);
await page.locator("#collection").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
check("new category visible in collection filters", await page.locator("#collection").getByRole("button", { name: "Rare Silicates" }).isVisible());
check("new specimen visible in collection grid", await page.locator("#collection").getByText("Emerald Matrix").isVisible());
check("custom section renders on the home page", await page.getByText("Smoke Custom Room").first().isVisible());

console.log(results.join("\n"));
console.log("\nRUNTIME ERRORS: " + (errors.length ? "\n" + errors.join("\n") : "none"));
await browser.close();
if (errors.length || results.some((result) => result.startsWith("FAIL"))) process.exitCode = 1;