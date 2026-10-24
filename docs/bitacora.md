# Bitácora

## 2026-10-24 — Fase 0: bases del repo y harness

**Hecho**
- Repo git local (`main`), tooling sobre `zotero-plugin-scaffold`, TypeScript estricto, ESLint, Vitest, Playwright, Vite.
- Contrato de datos, `assertLibraryData`, `JsonAdapter`, stub de `ZoteroAdapter`, vista placeholder y shell con log `[graph] startup`.
- Fixture sintético determinista (47 ítems) con los casos borde.
- Guardarraíles (ADR 0002), cinco subagentes, `/feature` y servidor MCP de Playwright.
- Verificado: `npm run check` verde, `test:view` verde, `npm run build` genera el `.xpi`, el fixture es idéntico entre corridas.

**Pendiente**
- Copiar `grafo-biblioteca.html` y su `graph.json` a `reference/` antes de la Fase 1.
- Crear el perfil de desarrollo (`fixtures/zotero-profile/setup.ps1`) y probar `npm run dev` con Zotero (no verificado todavía).
- Poblar la biblioteca de desarrollo desde `library.json` (Fase 2).
- `repository.url` de `package.json` es provisional; ajustarlo cuando exista el remoto.
- Sin remoto ni CI por decisión de Marco.

**Próximos pasos**
Fase 1: port del prototipo a TypeScript sobre `JsonAdapter`, con paridad funcional y `test:view` verde.
