# Arquitectura

Tres capas con dependencias en una sola dirección:

```
shell (src/zotero)  ──usa──▶  view (src/view)
      │                            ▲
      └──implementa──▶ LibraryAdapter ───┘   (src/core)
```

| Capa | Carpeta | Puede depender de |
|---|---|---|
| Core | `src/core/` | Nada externo |
| View | `src/view/` | `core` |
| Adapters | `src/adapters/` | `core`; `Zotero` solo en `zotero-adapter.ts` |
| Shell | `src/zotero/` | `core`, `view`, `adapters` |

## Contrato de datos

Definido en `src/core/types.ts`: `LibraryData`, `Item`, `Collection`, `Tag` y la interfaz `LibraryAdapter` (`load`, `selectItem`, `openItem`, `onChange?`). `assertLibraryData` (`src/core/validate.ts`) valida la integridad referencial (ids de colecciones y tags, keys de 8 caracteres, `count` de cada tag).

Cualquier cambio al contrato requiere un ADR y actualizar fixture, adaptadores y pruebas en el mismo cambio.

## Cómo se hacen cumplir las reglas

- **Capas:** `eslint.config.js` prohíbe a `core` importar otras capas o paquetes externos, y a `view` importar `zotero`. Ambas capas tienen `Zotero` prohibido como global.
- **Tipos de Zotero:** `zotero-types` solo está en `tsconfig.zotero.json` (`src/zotero/` y `zotero-adapter.ts`); en `tsconfig.json` el global `Zotero` no existe.
- **Biblioteca real:** `scripts/env-guard.ts`, permisos y hook de Claude Code (ADR 0002).

## Estado

Implementado: contrato, validación, `JsonAdapter`, stub de `ZoteroAdapter`, vista placeholder y shell que solo registra el log `[graph] startup`. La vista real y el `ZoteroAdapter` llegan en las Fases 1 y 2.
