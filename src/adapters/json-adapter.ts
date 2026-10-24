import type { LibraryAdapter, LibraryData } from "../core/types";
import { assertLibraryData } from "../core/validate";

/** Adaptador de fixture para el navegador: acepta datos ya cargados o una URL a un JSON. */
export class JsonAdapter implements LibraryAdapter {
  constructor(private readonly source: LibraryData | string) {}

  async load(): Promise<LibraryData> {
    if (typeof this.source !== "string") return assertLibraryData(this.source);
    const res = await fetch(this.source);
    if (!res.ok) throw new Error(`JsonAdapter: ${this.source} respondió ${res.status}`);
    return assertLibraryData(await res.json());
  }

  selectItem(key: string): void {
    console.debug("[graph] selectItem", key);
  }

  openItem(key: string): void {
    console.debug("[graph] openItem", key);
  }
}
