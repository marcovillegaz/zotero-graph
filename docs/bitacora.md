# Bitácora

## 2026-10-24 — Primera tanda de guías pedagógicas

**Hecho**
- Guías en `docs/guia/` (00 a 06) y `docs/glosario.md`, escritas leyendo el código de la Fase 0. Índice en `docs/guia/00-mapa.md`; enlazadas desde `README.md`.

**Pendiente**
- Verificar en Zotero real de desarrollo lo marcado como "no verificado" en la guía 04 (`npm run dev`).
- Añadir una prueba unitaria directa de `JsonAdapter` (hoy solo se ejerce vía Playwright).
- Actualizar las guías 03 y 04 cuando llegue la vista real (Fase 1) y el `ZoteroAdapter` (Fase 2).
- Generar `graph.html` (el primer grafo se creó con `--no-viz`).

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
