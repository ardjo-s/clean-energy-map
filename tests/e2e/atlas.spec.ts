import { expect, test } from "@playwright/test";

test("loads only source-backed records and restores selected facility from URL", async ({ page }) => {
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/data/atlas-v1.json"));
  await page.goto("/");
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const dataset = await response.json();
  await expect(page.getByText("Coverage varies by geography")).toBeVisible();
  const facility = dataset.facilities[0];
  test.skip(!facility, "Published dataset has no facilities.");
  await page.getByLabel("Search facilities, countries, operators").fill(facility.officialName);
  await page.getByRole("button", { name: new RegExp(facility.officialName) }).click();
  await expect(page.getByRole("heading", { name: facility.officialName })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`facility=${encodeURIComponent(facility.id)}`));
  await page.reload();
  await expect(page.getByRole("heading", { name: facility.officialName })).toBeVisible();
});

test("filters are shareable and mobile has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("Coverage varies by geography")).toBeVisible();
  await page.getByRole("button", { name: /Filters/ }).click();
  await page.getByLabel("Eligible").check();
  await expect(page).toHaveURL(/classification=eligible/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("country indicators expose calculation lineage", async ({ page }) => {
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/data/atlas-v1.json"));
  await page.goto("/");
  const dataset = await (await responsePromise).json();
  const indicator = dataset.countryIndicators[0];
  test.skip(!indicator, "Published dataset has no country indicators.");
  await page.getByLabel("Geography").selectOption(indicator.countryCode);
  await expect(page.getByText("Numerator:")).toBeVisible();
  await expect(page.getByText("Denominator:")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`geography=${indicator.countryCode}`));
});
