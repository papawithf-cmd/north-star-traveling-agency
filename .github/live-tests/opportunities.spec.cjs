const { test, expect } = require("@playwright/test");

test("restored opportunities survive navigation and refresh", async ({ page }) => {
  const restored = [
    ["Cabin Crew Opportunities", "northstar-emirates-cabin-crew"],
    ["Cabin Services Assistant", "northstar-emirates-cabin-services-assistant"],
    ["Fulfilment Associate", "northstar-amazon-fulfilment-associate"],
  ];

  await page.goto("/opportunities", { waitUntil: "domcontentloaded" });

  for (const [title, slug] of restored) {
    await expect(page.locator(`a[href="/opportunities/${slug}"]`).first()).toBeVisible({ timeout: 45000 });
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  }

  for (const [title, slug] of restored) {
    await page.goto("/opportunities", { waitUntil: "domcontentloaded" });
    await page.locator(`a[href="/opportunities/${slug}"]`).first().click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(new RegExp(`/opportunities/${slug}$`));
    await expect(page.locator("h1").first()).toContainText(title);
  }

  await page.goto("/opportunities", { waitUntil: "domcontentloaded" });
  await page.reload({ waitUntil: "domcontentloaded" });

  for (const [title, slug] of restored) {
    await expect(page.locator(`a[href="/opportunities/${slug}"]`).first()).toBeVisible({ timeout: 45000 });
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  }
});
