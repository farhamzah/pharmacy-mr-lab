import { expect, test } from "@playwright/test";

test("result export controls are available and module can produce result", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Desktop Module Demo" }).click();
  await page.getByRole("button", { name: "Modul 2: Pencampuran Sediaan" }).click();
  await page.getByRole("button", { name: "Start Selected Scenario" }).click();
  await page.getByRole("button", { name: "Add Ingredient A" }).click();
  await page.getByRole("button", { name: "Add Ingredient B" }).click();
  for (let i = 0; i < 5; i += 1) {
    await page.getByRole("button", { name: "Mix 5 Seconds" }).click();
  }
  await page.getByRole("button", { name: "Transfer To Container" }).click();
  await page.getByRole("button", { name: "Finish" }).click();
  await expect(page.getByText("Module Result")).toBeVisible();

  await page.goto("/");
  await page.getByText("Result Export").click();
  await expect(page.getByRole("button", { name: "Export Last Result JSON" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export History CSV" })).toBeVisible();
});
