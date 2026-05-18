import { expect, test } from "@playwright/test";

test("home page shows deployment and diagnostics surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Mixed Reality Pharmacy Lab" })).toBeVisible();
  await expect(page.getByText("Object Scale")).toBeVisible();
  await expect(page.getByText("Use External 3D Assets")).toBeVisible();
  await expect(page.getByText("Meta Quest Setup Help")).toBeVisible();

  await page.getByText("System Diagnostics").click();
  await page.getByRole("button", { name: "Run Diagnostics" }).click();
  await expect(page.getByText(/Secure Context/)).toBeVisible();
  await expect(page.getByText(/Protocol/)).toBeVisible();

  await page.getByText("Quest Testing Checklist").click();
  await expect(page.getByText("Website dibuka via HTTPS")).toBeVisible();
});
