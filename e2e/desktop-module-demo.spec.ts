import { expect, test } from "@playwright/test";

test("desktop demo opens scenario selection for both modules", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Desktop Module Demo" }).click();
  await expect(page.getByRole("heading", { name: "Pilih Modul" })).toBeVisible();

  await page.getByRole("button", { name: "Modul 1: Penimbangan Bahan" }).click();
  await expect(page.getByText("Pilih Skenario Penimbangan")).toBeVisible();
  await expect(page.getByText("Penimbangan Lactose 1 g")).toBeVisible();
  await page.getByRole("button", { name: "Start Selected Scenario" }).click();
  await expect(page.getByRole("button", { name: "Place Weighing Boat" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Desktop Module Demo" }).click();
  await page.getByRole("button", { name: "Modul 2: Pencampuran Sediaan" }).click();
  await expect(page.getByText("Pilih Skenario Pencampuran")).toBeVisible();
  await expect(page.getByText("Pencampuran Pengenceran Serbuk")).toBeVisible();
  await page.getByRole("button", { name: "Start Selected Scenario" }).click();
  await expect(page.getByRole("button", { name: "Add Ingredient A" })).toBeVisible();
});
