export interface LibraryData {
  asof: string; // ISO date
  items: Item[];
  collections: Collection[];
  tags: Tag[];
}

export interface Item {
  key: string; // Zotero item key (8 chars)
  title: string;
  firstAuthor: string; // "Apellido" o "Apellido et al."
  year: number | null;
  itemType: string; // journalArticle, book, ...
  publication?: string;
  annotationCount: number;
  collectionIds: number[];
  tagIds: number[];
}

export interface Collection {
  id: number;
  name: string;
  parentId: number | null;
  rootName: string;
}

export interface Tag {
  id: number;
  name: string;
  count: number;
  variants?: string[];
}

export interface LibraryAdapter {
  load(): Promise<LibraryData>;
  selectItem(key: string): void; // no-op en JsonAdapter
  openItem(key: string): void; // abre PDF o ficha
  onChange?(cb: () => void): void; // refresco en vivo (Fase 3)
}
