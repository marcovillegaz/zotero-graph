# 00 — Mapa del proyecto

Esta guía es la puerta de entrada. Describe el estado de la **Fase 0**: lo que existe hoy, no lo planificado. Los términos técnicos están definidos en [`../glosario.md`](../glosario.md).

## Qué es un plugin de Zotero

Zotero es un programa de escritorio construido sobre la plataforma de Firefox. Por eso un plugin de Zotero 7 se parece a una extensión de Firefox: es un paquete comprimido (`.xpi`, en realidad un `.zip`) que contiene un `manifest.json`, un archivo `bootstrap.js` y los scripts del plugin. Zotero lo carga al arrancar y llama a unas funciones de ciclo de vida (`startup`, `shutdown`, ...).

Analogía: un plugin es como un paquete de Python instalado en un entorno ajeno. Tu código no controla el programa; el programa lo invoca en momentos definidos. La analogía deja de valer en que el "entorno" aquí es el navegador interno de Zotero, con su propio objeto global `Zotero` que tu código puede usar.

## Por qué hay capas

El plan es mostrar un grafo dentro de Zotero. Pero depurar dentro de Zotero es lento. Si la vista estuviera mezclada con la API de Zotero, cada cambio exigiría reiniciar Zotero y tocar la biblioteca. Para evitarlo, el proyecto separa:

```
shell (src/zotero)  --usa-->  view (src/view)
        |                           ^
        +--implementa--> LibraryAdapter (src/core)
```

| Capa | Carpeta | Qué hace | Guía |
|---|---|---|---|
| Core | `src/core/` | Define los tipos de datos y valida. Funciones puras. | [01](01-core.md) |
| Adapters | `src/adapters/` | Entregan datos con la forma del contrato (desde JSON hoy; desde Zotero mañana). | [02](02-adaptadores.md) |
| View | `src/view/` | Dibuja en pantalla. No sabe que Zotero existe. | [03](03-vista.md) |
| Shell | `src/zotero/` + `addon/` | Enchufa todo a Zotero. | [04](04-plugin-zotero.md) |

Qué pasaría sin capas: la vista no se podría probar en un navegador normal, y un error al leer la biblioteca podría tocar datos reales.

## Lenguajes y formatos que verás

- **TypeScript (`.ts`)**: JavaScript con tipos. Un compilador (`tsc`) revisa los tipos antes de ejecutar. Parecido a tener anotaciones de tipo en Python con `mypy`, pero obligatorio aquí (modo `strict`).
- **JavaScript (`.js`, `.mjs`)**: lo que realmente ejecutan el navegador y Zotero. `addon/bootstrap.js` está en JS puro porque Zotero lo carga tal cual, sin compilar.
- **JSON**: datos y configuración (`fixtures/library.json`, `package.json`, `manifest.json`, `tsconfig*.json`).
- **PowerShell (`.ps1`)**: scripts de Windows; aquí, `fixtures/zotero-profile/setup.ps1`.
- **Archivos de configuración de herramientas**: ESLint, Vite, Vitest, Playwright, el scaffold de Zotero (`*.config.*`).
- **HTML (`.html`)**: la página que carga la vista.
- **FTL (`.ftl`)**: textos traducibles de Zotero (Fluent).

## Tabla archivo, para qué sirve, lenguaje

| Archivo | Para qué sirve | Lenguaje |
|---|---|---|
| `src/core/types.ts` | Contrato de datos e interfaz `LibraryAdapter` | TypeScript |
| `src/core/validate.ts` | `assertLibraryData`: valida integridad referencial | TypeScript |
| `src/adapters/json-adapter.ts` | Lee datos de un JSON o de un objeto | TypeScript |
| `src/adapters/zotero-adapter.ts` | Stub del lector de Zotero (no implementado) | TypeScript |
| `src/view/index.html` | Página de la vista standalone | HTML |
| `src/view/entry.ts` | Punto de entrada: conecta adaptador y vista | TypeScript |
| `src/view/main.ts` | `mountView`: pinta un resumen (placeholder) | TypeScript |
| `src/zotero/index.ts` | Shell del plugin: solo registra un log | TypeScript |
| `addon/bootstrap.js` | Ciclo de vida que Zotero invoca | JavaScript |
| `addon/manifest.json` | Identidad y versión mínima de Zotero | JSON |
| `addon/locale/*/addon.ftl` | Textos del plugin por idioma | Fluent |
| `zotero-plugin.config.ts` | Cómo se empaqueta y ejecuta el plugin | TypeScript |
| `fixtures/generate.ts` | Genera el fixture de forma determinista | TypeScript |
| `fixtures/library.json` | Biblioteca sintética (47 ítems) | JSON |
| `fixtures/zotero-profile/setup.ps1` | Crea carpetas del perfil de desarrollo | PowerShell |
| `scripts/env-guard.ts` | Aborta si las rutas apuntan a la biblioteca real | TypeScript |
| `.claude/hooks/block-real-library.mjs` | Hook que bloquea herramientas de Claude Code | JavaScript (módulo) |
| `.claude/settings.json` | Permisos y hooks de Claude Code | JSON |
| `eslint.config.js` | Reglas de estilo y de capas | JavaScript |
| `tsconfig.json`, `tsconfig.zotero.json` | Configuración del compilador | JSON |
| `vite.config.ts` | Servidor de la vista | TypeScript |
| `vitest.config.ts` | Pruebas unitarias | TypeScript |
| `playwright.config.ts` | Pruebas de navegador | TypeScript |
| `tests/unit/*.test.ts` | Pruebas unitarias | TypeScript |
| `tests/view/smoke.spec.ts` | Prueba de navegador | TypeScript |
| `package.json` | Dependencias y comandos `npm run ...` | JSON |
| `.env.example` | Plantilla de variables de entorno | texto |

## Recorrido de un dato, de punta a punta

Es lo que ocurre con `npm run dev:view`:

1. **`fixtures/library.json`** es un archivo con la biblioteca sintética. Vite lo sirve como estático en `/library.json` (`vite.config.ts:6`, `publicDir`).
2. **`src/view/entry.ts:4`** crea `new JsonAdapter("/library.json")` y llama a `mountView(...)`.
3. **`mountView`** (`src/view/main.ts:5`) ejecuta `await adapter.load()`. Solo conoce la interfaz `LibraryAdapter`.
4. **`JsonAdapter.load`** (`src/adapters/json-adapter.ts:10-12`) hace `fetch` de la URL y pasa el JSON a **`assertLibraryData`**.
5. **`assertLibraryData`** (`src/core/validate.ts:4`) comprueba que los ids referenciados existan, que no haya claves duplicadas, que los conteos de tags cuadren. Si algo falla, lanza un error con todos los problemas. Si todo bien, devuelve el dato tipado como `LibraryData`.
6. De vuelta en `mountView`, la línea 6 escribe en la página un párrafo con los conteos (`47 ítems, 6 colecciones, 8 tags`).
7. En pantalla ves ese párrafo. Es un placeholder; el grafo real es de la Fase 1.

```
library.json -> fetch -> assertLibraryData -> LibraryData -> mountView -> <p data-testid="summary">
```

## Índice de guías

1. [01 — Core](01-core.md): tipos, contrato y validación pura.
2. [02 — Adaptadores](02-adaptadores.md): patrón adaptador, `JsonAdapter`, `ZoteroAdapter`.
3. [03 — Vista](03-vista.md): Vite, `index.html`, `mountView`, Playwright.
4. [04 — Plugin de Zotero](04-plugin-zotero.md): `addon/`, ciclo de vida, `.xpi`, perfil de desarrollo.
5. [05 — Calidad y guardarraíles](05-calidad-y-guardarrailes.md): ESLint, tsconfig, pruebas, fixture, env-guard, hook.
6. [06 — Agentes](06-agentes.md): el equipo de subagentes y `/feature`.
7. [Glosario](../glosario.md).

## Pruébalo tú

1. `npm run check`. Resultado esperado: lint, typecheck y pruebas unitarias pasan sin errores.
2. `npm run dev:view` y abre `http://localhost:5173`. Esperado: una línea con `47 ítems, 6 colecciones, 8 tags`. Detén el servidor con Ctrl+C.
3. Abre `fixtures/library.json` y busca `"tagIds"` en cualquier ítem; luego busca ese id en la lista `tags`. Es exactamente la referencia que `assertLibraryData` verifica.
