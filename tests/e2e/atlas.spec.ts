import { expect, test } from "@playwright/test";

const sourceBackedFacility = { id: "us-eia-1-onshore_wind", officialName: "Sand Point" } as const;

test("loads source-backed records and restores a selected facility from URL", async ({ page }) => {
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/data/atlas-v1.json"));
  await page.goto("/");
  expect((await responsePromise).ok()).toBeTruthy();
  await expect(page.getByText(/verified wave.*global coverage varies/i)).toBeVisible();
  const mobileSearch = page.getByRole("button", { name: "Search", exact: true });
  if (await mobileSearch.isVisible()) await mobileSearch.click();
  await page.getByLabel("Search facilities, countries, operators").fill(sourceBackedFacility.officialName);
  await page.getByRole("button", { name: new RegExp(sourceBackedFacility.officialName) }).click();
  await expect(page.getByRole("heading", { name: sourceBackedFacility.officialName })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`facility=${encodeURIComponent(sourceBackedFacility.id)}`));
  await page.reload();
  await expect(page.getByRole("heading", { name: sourceBackedFacility.officialName })).toBeVisible();
  await expect(page.getByText("Download full field-level evidence")).toBeVisible();
});

test("filters are shareable, update map input, and mobile has no overflow", async ({ page }) => {
  await page.goto("/");
  const map = page.getByRole("region", { name: "Clean-energy facility map" });
  const initialCount = Number(await map.getAttribute("data-record-count"));
  await page.getByRole("button", { name: /Filters/ }).click();
  await page.getByLabel("Eligible").check();
  await expect(page).toHaveURL(/classification=eligible/);
  await expect.poll(async () => Number(await map.getAttribute("data-record-count"))).toBeLessThan(initialCount);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("country profile keeps all four metrics distinct and exposes calculation lineage", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Geography").selectOption("US");
  const profile = page.locator(".country-profile");
  await expect(profile).toContainText("Electricity generation");
  await expect(profile).toContainText("Installed electrical capacity");
  await expect(profile).toContainText("Total energy supply");
  await expect(profile).toContainText("Final energy consumption");
  await expect(profile).toContainText("Source observations");
  await expect(profile.getByText("Not assessed", { exact: true })).toHaveCount(2);
  await expect(page).toHaveURL(/geography=US/);
});

test("target geography search shows withheld coverage without false zero claim", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Filters/ })).toBeVisible();
  const mobileSearch = page.getByRole("button", { name: "Search", exact: true });
  if (await mobileSearch.isVisible()) await mobileSearch.click();
  await page.getByLabel("Search facilities, countries, operators").fill("China");
  await page.getByRole("button", { name: "Open geography China" }).click();
  await expect(page.getByRole("heading", { name: "China" })).toBeVisible();
  await expect(page.locator(".country-profile")).toContainText("withheld");
  await expect(page.locator(".country-profile")).toContainText("No electricity proxy or mapped-facility sum is substituted");
  await expect(page).toHaveURL(/geography=CN/);
});

test("coverage and source ledgers are searchable and expose release metadata", async ({ page }) => {
  await page.goto("/?geography=CN&view=coverage");
  await expect(page.getByText("Empty map layers mean unassessed coverage")).toBeVisible();
  await page.getByLabel("Search coverage").fill("offshore wind");
  await expect(page.locator(".evidence-drawer")).toContainText("China · offshore wind");
  await page.goto("/?view=sources");
  await page.getByLabel("Search sources").fill("EIA-860");
  await expect(page.locator(".evidence-drawer")).toContainText("Form EIA-860 detailed data");
  await expect(page.locator(".evidence-drawer")).toContainText("Snapshot");
});

test("source-backed ownership remains phase-specific and visible", async ({ page }) => {
  await page.goto("/?facility=us-eia-10018-geothermal");
  const inspector = page.locator(".inspector");
  await expect(inspector).toContainText("Ownership history");
  await expect(inspector).toContainText("Phase phase-");
  await expect(inspector).toContainText("effective dates unavailable");
  await expect(inspector).toContainText("Source value");
});

test("map view state is shareable and the facilities layer is real", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop-only floating layer panel.");
  await page.goto("/?lng=-100&lat=40&zoom=3.5");
  await expect(page).toHaveURL(/lng=-100/);
  await page.getByText("Map layers").click();
  await page.getByRole("checkbox", { name: "Facilities", exact: true }).uncheck();
  await expect(page.getByRole("region", { name: "Clean-energy facility map" })).toHaveAttribute("data-facilities-visible", "false");
  await page.reload();
  await expect(page).toHaveURL(/lng=/);
});

test("desktop primary navigation is keyboard reachable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop header layout.");
  await page.goto("/");
  await expect(page.getByLabel("Search facilities, countries, operators")).toBeVisible();
  for (let index = 0; index < 8 && !await page.evaluate(() => document.activeElement?.matches("button,input,select,a[href]") ?? false); index += 1) await page.keyboard.press("Tab");
  await expect.poll(() => page.evaluate(() => document.activeElement?.matches("button,input,select,a[href]") ?? false)).toBe(true);
  await expect(page.getByText(/financing transactions/i)).toHaveCount(0);
});
