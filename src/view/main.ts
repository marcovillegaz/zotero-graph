import type { LibraryAdapter } from "../core/types";

/** Monta la vista sobre un contenedor. Placeholder hasta Fase 1 (port del prototipo). */
export async function mountView(root: HTMLElement, adapter: LibraryAdapter): Promise<void> {
  const data = await adapter.load();
  root.innerHTML = `<p data-testid="summary">${data.items.length} ítems, ${data.collections.length} colecciones, ${data.tags.length} tags</p>`;
}
