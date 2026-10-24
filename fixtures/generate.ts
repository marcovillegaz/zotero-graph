import { writeFileSync } from "node:fs";
import { assertLibraryData } from "../src/core/validate";
import type { Collection, Item, LibraryData, Tag } from "../src/core/types";

// PRNG determinista (mulberry32): misma semilla, mismo fixture.
let seed = 20240101;
const rand = (): number => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(a: readonly T[]): T => a[Math.floor(rand() * a.length)]!;

const collections: Collection[] = [
  { id: 1, name: "Métodos", parentId: null, rootName: "Métodos" },
  { id: 2, name: "Aprendizaje", parentId: 1, rootName: "Métodos" },
  { id: 3, name: "Redes neuronales", parentId: 2, rootName: "Métodos" }, // 3 niveles
  { id: 4, name: "Dominio", parentId: null, rootName: "Dominio" },
  { id: 5, name: "Hidrología", parentId: 4, rootName: "Dominio" },
  { id: 6, name: "Por leer", parentId: null, rootName: "Por leer" },
];

const tagDefs: { name: string; variants?: string[] }[] = [
  { name: "machine learning", variants: ["ML", "Machine Learning", "machine-learning"] },
  { name: "neural network", variants: ["neural networks", "Neural Network"] },
  { name: "hydrology" },
  { name: "remote sensing" },
  { name: "estado:leído" },
  { name: "estado:pendiente" },
  { name: "benchmark" },
  { name: "survey" },
];

const authors = ["Silva", "Pérez", "Chen", "Müller", "Okafor", "Rossi", "Kim", "Dubois"];
const types = ["journalArticle", "book", "conferencePaper", "thesis", "report"] as const;
const words = ["Modelo", "Análisis", "Evaluación", "Estimación", "Predicción", "Revisión"];
const topics = ["de caudales", "de precipitación", "con redes profundas", "bayesiano", "de cuencas", "satelital"];

const items: Item[] = [];
const usedKeys = new Set<string>();
const makeKey = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let k: string;
  do { k = Array.from({ length: 8 }, () => chars[Math.floor(rand() * chars.length)]).join(""); } while (usedKeys.has(k));
  usedKeys.add(k);
  return k;
};

const add = (over: Partial<Item> & { title: string }): Item => {
  const it: Item = {
    key: makeKey(), firstAuthor: pick(authors), year: 2005 + Math.floor(rand() * 20),
    itemType: pick(types), annotationCount: Math.floor(rand() * 12),
    collectionIds: [pick([1, 2, 3, 4, 5, 6])], tagIds: [], ...over,
  };
  items.push(it);
  return it;
};

for (let i = 0; i < 36; i++) {
  const n = 1 + Math.floor(rand() * 3);
  add({
    title: `${pick(words)} ${pick(topics)} ${i + 1}`,
    publication: rand() > 0.3 ? pick(["J. Hydrol.", "WRR", "Nature", "NeurIPS"]) : undefined,
    tagIds: [...new Set(Array.from({ length: n }, () => 1 + Math.floor(rand() * tagDefs.length)))],
  });
}

// Casos borde (§5 de CLAUDE.md)
add({ title: "Duplicado A: Estimación de caudales", firstAuthor: "Silva", year: 2015, itemType: "journalArticle", tagIds: [3] });
add({ title: "Duplicado A: Estimación de caudales", firstAuthor: "Silva", year: 2015, itemType: "journalArticle", tagIds: [3] });
add({ title: "Sin año", year: null, tagIds: [1] });
add({ title: "Sin autores", firstAuthor: "", tagIds: [2] });
add({ title: "Sin tags", tagIds: [] });
add({ title: "PDF suelto.pdf", itemType: "attachment", firstAuthor: "", year: null, collectionIds: [], tagIds: [], annotationCount: 3 });
add({ title: "En varias colecciones", collectionIds: [1, 3, 5, 6], tagIds: [1, 2] });
add({ title: "Sin anotaciones", annotationCount: 0, tagIds: [4] });
add({ title: "Muy anotado", annotationCount: 142, tagIds: [1, 7] });
add({ title: "Colección profunda", collectionIds: [3], tagIds: [2] });
add({ title: "Etiquetas con variantes", tagIds: [1, 2], firstAuthor: "Chen et al." });

const tags: Tag[] = tagDefs.map((t, i) => {
  const id = i + 1;
  const tag: Tag = { id, name: t.name, count: items.filter((it) => it.tagIds.includes(id)).length };
  if (t.variants) tag.variants = t.variants;
  return tag;
});

const data: LibraryData = assertLibraryData({ asof: "2024-01-01T00:00:00.000Z", items, collections, tags });
writeFileSync(new URL("./library.json", import.meta.url), JSON.stringify(data, null, 2) + "\n");
console.log(`fixtures/library.json: ${items.length} ítems, ${collections.length} colecciones, ${tags.length} tags`);
