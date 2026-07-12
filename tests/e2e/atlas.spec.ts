import { expect, test } from "@playwright/test";

const sourceBackedFacility = { id: "us-eia-1-onshore_wind", officialName: "Sand Point" } as const;

test("loads only source-backed records and restores selected facility from URL", async ({ page }) => {
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/data/atlas-v1.json"));
  await page.goto("/");
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  await expect(page.getByText("Coverage varies by geography")).toBeVisible();
  const mobileSearch = page.getByRole("button", { name: "Search", exact: true });
  if (await mobileSearch.isVisible()) await mobileSearch.click();
  await page.getByLabel("Search facilities, countries, operators").fill(sourceBackedFacility.officialName);
  await page.getByRole("button", { name: new RegExp(sourceBackedFacility.officialName) }).click();
  await expect(page.getByRole("heading", { name: sourceBackedFacility.officialName })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`facility=${encodeURIComponent(sourceBackedFacility.id)}`));
  await page.reload();
  await expect(page.getByRole("heading", { name: sourceBackedFacility.officialName })).toBeVisible();
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
  expect((await responsePromise).ok()).toBeTruthy();
  await page.getByLabel("Geography").selectOption("US");
  const countryProfile = page.locator(".country-profile");
  await expect(countryProfile).toContainText("Numerator:");
  await expect(countryProfile).toContainText("Denominator:");
  await expect(page).toHaveURL(/geography=US/);
});
