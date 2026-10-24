import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertLibraryData } from "../../src/core/validate";

const data = assertLibraryData(JSON.parse(readFileSync("fixtures/library.json", "utf8")));

describe("fixtures/library.json", () => {
  it("tiene ~50 ítems", () => expect(data.items.length).toBeGreaterThanOrEqual(45));
  it("tiene duplicados", () => {
    const titles = data.items.map((i) => i.title);
    expect(new Set(titles).size).toBeLessThan(titles.length);
  });
  it("cubre ítems sin año, sin autor, sin tags", () => {
    expect(data.items.some((i) => i.year === null && i.itemType !== "attachment")).toBe(true);
    expect(data.items.some((i) => i.firstAuthor === "")).toBe(true);
    expect(data.items.some((i) => i.tagIds.length === 0)).toBe(true);
  });
  it("tiene PDF suelto", () => expect(data.items.some((i) => i.itemType === "attachment")).toBe(true));
  it("tiene tags con variantes", () => expect(data.tags.some((t) => (t.variants?.length ?? 0) > 0)).toBe(true));
  it("tiene colecciones anidadas a 3 niveles", () => {
    const depth = (id: number): number => {
      const c = data.collections.find((x) => x.id === id)!;
      return c.parentId === null ? 1 : 1 + depth(c.parentId);
    };
    expect(Math.max(...data.collections.map((c) => depth(c.id)))).toBeGreaterThanOrEqual(3);
  });
  it("tiene ítems en varias colecciones", () => expect(data.items.some((i) => i.collectionIds.length > 1)).toBe(true));
  it("cubre 0 y 100+ anotaciones", () => {
    expect(data.items.some((i) => i.annotationCount === 0)).toBe(true);
    expect(data.items.some((i) => i.annotationCount >= 100)).toBe(true);
  });
});
