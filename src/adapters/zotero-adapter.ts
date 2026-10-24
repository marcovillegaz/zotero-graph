import type { LibraryAdapter, LibraryData } from "../core/types";

/** Adaptador de solo lectura sobre la API interna de Zotero. Pendiente: Fase 2. */
export class ZoteroAdapter implements LibraryAdapter {
  load(): Promise<LibraryData> {
    throw new Error("ZoteroAdapter: not implemented (Fase 2)");
  }

  selectItem(_key: string): void {
    throw new Error("ZoteroAdapter: not implemented (Fase 2)");
  }

  openItem(_key: string): void {
    throw new Error("ZoteroAdapter: not implemented (Fase 2)");
  }
}
