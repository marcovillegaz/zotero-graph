import type { LibraryData } from "./types";

/** Valida integridad referencial del contrato; lanza con todos los problemas encontrados. */
export function assertLibraryData(x: unknown): LibraryData {
  const d = x as LibraryData;
  const errors: string[] = [];
  if (!d || typeof d !== "object") throw new Error("LibraryData: no es un objeto");
  if (typeof d.asof !== "string" || Number.isNaN(Date.parse(d.asof))) errors.push("asof inválido");
  for (const k of ["items", "collections", "tags"] as const) {
    if (!Array.isArray(d[k])) errors.push(`${k} no es un arreglo`);
  }
  if (errors.length) throw new Error(`LibraryData: ${errors.join("; ")}`);

  const collIds = new Set(d.collections.map((c) => c.id));
  const tagIds = new Set(d.tags.map((t) => t.id));
  if (collIds.size !== d.collections.length) errors.push("ids de colección duplicados");
  if (tagIds.size !== d.tags.length) errors.push("ids de tag duplicados");
  for (const c of d.collections) {
    if (c.parentId !== null && !collIds.has(c.parentId)) errors.push(`colección ${c.id}: parentId ${c.parentId} no existe`);
  }

  const keys = new Set<string>();
  const tagUse = new Map<number, number>();
  for (const it of d.items) {
    if (!/^[A-Z0-9]{8}$/.test(it.key)) errors.push(`ítem ${it.key}: key debe tener 8 caracteres A-Z0-9`);
    if (keys.has(it.key)) errors.push(`ítem ${it.key}: key duplicada`);
    keys.add(it.key);
    if (it.annotationCount < 0) errors.push(`ítem ${it.key}: annotationCount negativo`);
    for (const c of it.collectionIds) if (!collIds.has(c)) errors.push(`ítem ${it.key}: colección ${c} no existe`);
    for (const t of it.tagIds) {
      if (!tagIds.has(t)) errors.push(`ítem ${it.key}: tag ${t} no existe`);
      tagUse.set(t, (tagUse.get(t) ?? 0) + 1);
    }
  }
  for (const t of d.tags) {
    if (t.count !== (tagUse.get(t.id) ?? 0)) errors.push(`tag ${t.id}: count ${t.count} != usos ${tagUse.get(t.id) ?? 0}`);
  }
  if (errors.length) throw new Error(`LibraryData inválido:\n  ${errors.join("\n  ")}`);
  return d;
}
