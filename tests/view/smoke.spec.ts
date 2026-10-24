import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test("la vista muestra los conteos del fixture", async ({ page }) => {
  const d = JSON.parse(readFileSync("fixtures/library.json", "utf8"));
  await page.goto("/");
  await expect(page.getByTestId("summary")).toHaveText(
    `${d.items.length} ítems, ${d.collections.length} colecciones, ${d.tags.length} tags`,
  );
});
