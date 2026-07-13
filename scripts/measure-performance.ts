import { chromium, type Page } from "@playwright/test";

const baseUrl = process.env.PERF_BASE_URL ?? "http://127.0.0.1:3000";
const runs = Number.parseInt(process.env.PERF_RUNS ?? "3", 10);
const budgetsMs = {
  initialAtlasReady: 8_000,
  mapZoomAndClusterRedraw: 1_500,
  filterAndClusterRefresh: 750,
  inspectorOpen: 500,
} as const;

if (!Number.isInteger(runs) || runs < 1) throw new Error("PERF_RUNS must be a positive integer.");

type Measurements = Record<keyof typeof budgetsMs, number>;

function median(values: number[]) {
  const sorted = values.toSorted((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

async function measure(page: Page) {
  const started = performance.now();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.locator(".legend > div:nth-child(2) > strong").waitFor();
  const canvas = page.locator(".maplibregl-canvas");
  await canvas.waitFor();
  const initialAtlasReady = performance.now() - started;

  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Map canvas has no measurable bounds.");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  const mapUrl = page.url();
  const mapStarted = performance.now();
  await page.mouse.wheel(0, -700);
  await page.waitForURL((url) => url.toString() !== mapUrl && url.searchParams.has("zoom"));
  const mapZoomAndClusterRedraw = performance.now() - mapStarted;

  await page.getByRole("button", { name: /Filters/ }).click();
  const count = page.locator(".legend > div:nth-child(2) > strong");
  const previousCount = await count.textContent();
  const filterStarted = performance.now();
  await page.getByRole("checkbox", { name: "Eligible" }).check();
  await page.waitForFunction(
    (previous) => document.querySelector(".legend > div:nth-child(2) > strong")?.textContent !== previous,
    previousCount,
  );
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const filterAndClusterRefresh = performance.now() - filterStarted;

  const search = page.getByLabel("Search facilities, countries, operators");
  await search.fill("Sand Point");
  const result = page.getByRole("button", { name: /Sand Point/ }).first();
  await result.waitFor();
  const inspectorStarted = performance.now();
  await result.click();
  await page.locator(".inspector").waitFor();
  const inspectorOpen = performance.now() - inspectorStarted;

  return { initialAtlasReady, mapZoomAndClusterRedraw, filterAndClusterRefresh, inspectorOpen } satisfies Measurements;
}

async function main() {
  const browser = await chromium.launch();
  try {
    const samples: Measurements[] = [];
    for (let index = 0; index < runs; index += 1) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      samples.push(await measure(page));
      await page.close();
    }
    const medians = Object.fromEntries(
      Object.keys(budgetsMs).map((name) => [name, median(samples.map((sample) => sample[name as keyof Measurements]))]),
    ) as Measurements;
    const failures = Object.entries(budgetsMs)
      .filter(([name, budget]) => medians[name as keyof Measurements] > budget)
      .map(([name, budget]) => `${name}: ${medians[name as keyof Measurements].toFixed(1)} ms > ${budget} ms`);
    console.log(JSON.stringify({ baseUrl, viewport: "1440x900", runs, budgetsMs, mediansMs: medians, samplesMs: samples, status: failures.length ? "failed" : "passed", failures }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
