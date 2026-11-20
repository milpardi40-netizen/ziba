import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

await mkdir('shots/photography', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

try {
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href, { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('.specimen-image img'));
    images.forEach((image) => { image.loading = 'eager'; });
    await Promise.all(images.map((image) => image.decode()));
  });

  const images = await page.locator('.specimen-image').evaluateAll((frames) => frames.map((frame) => {
    const image = frame.querySelector('img');
    return {
      id: frame.dataset.photo,
      loaded: image?.complete && image.naturalWidth > 0,
      fit: image ? getComputedStyle(image).objectFit : null,
    };
  }));
  assert.ok(images.every((image) => image.loaded), 'Every photograph must load successfully');
  assert.ok(images.every((image) => image.fit === 'contain'), 'Photographs must never be cover-cropped');
  const catalog = page.locator('#collection [data-photo]');
  assert.equal(await catalog.count(), 10);
  assert.equal(new Set(await catalog.evaluateAll((items) => items.map((item) => item.dataset.photo))).size, 10);
  console.log(`PASS: ${images.length} image frames loaded; ten distinct specimen photographs; no cover cropping.`);

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(650);
    const measurements = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      heights: Array.from(document.querySelectorAll('#collection [data-photo]')).map((el) => el.getBoundingClientRect().height),
      cards: Array.from(document.querySelectorAll('#collection article')).map((el) => el.getBoundingClientRect().width),
    }));
    assert.ok(measurements.overflow <= 0, `Horizontal overflow at ${width}px`);
    assert.ok(measurements.heights.every((height) => height >= 160 && height <= 177), `Oversized image at ${width}px`);
    assert.ok(measurements.cards.every((card) => card > 200 && card <= width), `Card width at ${width}px`);
    await page.locator('#collection article').first().evaluate((el) => window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - 100,
      behavior: 'instant',
    }));
    await page.waitForTimeout(400);
    if (width === 1440 || width === 390 || width === 320) {
      await page.screenshot({ path: `shots/photography/cards-${width}.png` });
    }
    console.log(`PASS: ${width}px layout, consistent ${measurements.heights[0]}px image frames, no horizontal overflow.`);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(600);
  await page.locator('#collection article button[aria-label^="Open specimen"]').first().click();
  await page.waitForTimeout(600);
  assert.equal(await page.locator('[role="dialog"] [data-photo]').getAttribute('data-photo'), 'amethyst');
  assert.ok(await page.getByRole('dialog').getByRole('link', { name: 'Source', exact: true }).isVisible());
  await page.getByRole('button', { name: 'Next specimen' }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('[role="dialog"] [data-photo]').getAttribute('data-photo'), 'rhodochrosite');
  await page.screenshot({ path: 'shots/photography/expanded-specimen.png' });
  await page.keyboard.press('Escape');
  console.log('PASS: Expanded photographs, source attribution, next navigation, and Escape.');

  for (const section of ['highlights', 'stories', 'glow', 'deeptime']) {
    await page.locator(`#${section}`).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `shots/photography/${section}.png` });
  }
  await page.locator('#photography-credits summary').click();
  assert.equal(await page.locator('#photography-credits li').count(), 10);
  const links = await page.locator('#photography-credits li a').evaluateAll((anchors) => anchors.map((anchor) => anchor.href));
  assert.ok(links.every((href) => href.startsWith('https://')));
  console.log('PASS: All ten source and license credits are available in the footer.');

  assert.deepEqual(errors, [], 'There must be no runtime errors');
  console.log('PASS: No runtime errors.');
} finally {
  await browser.close();
}