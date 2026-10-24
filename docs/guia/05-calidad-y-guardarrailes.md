# 05 — Calidad y guardarraíles

Esta guía explica las redes de seguridad del proyecto: qué detecta cada una y por qué existe. Principio: un error detectado por una máquina en segundos es mucho más barato que uno detectado por ti (o por tu biblioteca) más tarde.

## Mapa rápido

| Herramienta | Qué detecta | Comando | Configuración |
|---|---|---|---|
| ESLint | Estilo, errores comunes, violaciones de capas | `npm run lint` | `eslint.config.js` |
| TypeScript (`tsc`) | Errores de tipos | `npm run typecheck` | `tsconfig.json`, `tsconfig.zotero.json` |
| Vitest | Lógica incorrecta (pruebas unitarias) | `npm run test:unit` | `vitest.config.ts` |
| Playwright | La vista en un navegador real | `npm run test:view` | `playwright.config.ts` |
| env-guard | Rutas peligrosas en el entorno | automático en `dev` | `scripts/env-guard.ts` |
| Hook de Claude Code | Agentes tocando la biblioteca real | automático | `.claude/hooks/block-real-library.mjs` |

## ESLint y las reglas de capas

**Lint** es un análisis estático: revisa el código sin ejecutarlo. Piensa en un corrector ortográfico, pero de programación. Aquí se usa además para **hacer cumplir la arquitectura**.

`eslint.config.js:19-43`:

- Para `src/core/**/*.ts` (líneas 19-29): `no-restricted-globals` prohíbe `Zotero`; `no-restricted-imports` prohíbe importar rutas relativas que contengan `view`, `adapters` o `zotero`, y prohíbe cualquier import que no empiece por `.` (o sea, paquetes externos).
- Para `src/view/**/*.ts` (líneas 31-38): prohíbe `Zotero` e imports cuya ruta contenga `zotero`.
- Para `src/zotero/**` y `src/adapters/zotero-adapter.ts` (líneas 40-43): permite `any`, porque en el borde con la API de Zotero a veces no hay tipos.
- Línea 16: `no-unused-vars` es error, salvo parámetros que empiezan con `_`.
- Línea 6: se ignoran `node_modules`, `build`, `addon` y otros generados.

Sin estas reglas, la separación de capas sería solo una promesa en un documento. Con ellas, romperla hace fallar `npm run lint`.

## `tsconfig`: strict y dos configuraciones

`tsconfig.json:7`: `"strict": true`. El **modo estricto** activa un conjunto de comprobaciones: no se permite `null` donde no se declaró, no hay tipos `any` implícitos, etc. Es incómodo al principio y evita clases enteras de errores (equivalente a pasar `mypy --strict` en Python).

`tsconfig.json:8`: `noUncheckedIndexedAccess`. Acceder a `arreglo[i]` da `T | undefined`, porque el índice podría no existir. Por eso en `fixtures/generate.ts:13` aparece `a[...]!`: el `!` afirma "sé que existe".

Hay **dos** configuraciones:

- `tsconfig.json` (líneas 12 y 14): tipos de `node`; incluye core, view, `json-adapter.ts`, scripts, fixtures, tests y configs. **No** ve los tipos de Zotero.
- `tsconfig.zotero.json` (líneas 2-6): extiende la anterior y añade `zotero-types`; incluye `src/zotero`, `zotero-adapter.ts` y `src/core`. Aquí el global `Zotero` existe.

Efecto: si alguien usa `Zotero` en `src/view/`, `tsc` también falla (el nombre no existe para ese compilador), reforzando la regla de ESLint. `npm run typecheck` (`package.json:16`) ejecuta ambas con `--noEmit`: solo revisa, no genera archivos.

## Vitest: pruebas unitarias

Una **prueba unitaria** ejecuta una pieza pequeña y comprueba su resultado. Vitest es el ejecutor (algo como `pytest`).

`vitest.config.ts:4` busca `tests/unit/**/*.test.ts`. Hoy hay dos archivos:

- `tests/unit/fixture.test.ts`: valida el fixture con `assertLibraryData` y comprueba que cubre cada caso borde (duplicados, sin año, sin autor, sin tags, PDF suelto, variantes, 3 niveles, varias colecciones, 0 y 100+ anotaciones).
- `tests/unit/env-guard.test.ts`: comprueba que `forbiddenReason` rechaza rutas peligrosas y acepta las de desarrollo.

Estilo de una prueba (`tests/unit/fixture.test.ts:18`):

```ts
it("tiene PDF suelto", () => expect(data.items.some((i) => i.itemType === "attachment")).toBe(true));
```

`describe` agrupa, `it` nombra un caso y `expect(...).toBe(...)` es la afirmación. Se prueba **comportamiento** (qué debe cumplir el fixture), no cómo está implementado el generador.

## Playwright

Ya descrito en la [guía 03](03-vista.md): un navegador real que abre la vista y verifica el texto. `npm run test:view`.

## `npm run check`: la puerta de entrada

`package.json:20`: `npm run lint && npm run typecheck && npm run test:unit`. El `&&` ejecuta en cadena y se detiene en el primer fallo. Es el **gate obligatorio**: ninguna tarea se declara lista con `check` en rojo (regla dura 3). No incluye `test:view` porque es más lento.

## Fixture determinista

Un **fixture** es un conjunto de datos de prueba fijo. **Determinista** significa que cada ejecución produce exactamente el mismo resultado.

Los casos borde que debe cubrir están en `CLAUDE.md`, sección 5. Cómo se generan los datos "al azar" de forma repetible, en `fixtures/generate.ts:5-11`:

```ts
// PRNG determinista (mulberry32): misma semilla, mismo fixture.
let seed = 20240101;
const rand = (): number => {
  seed = (seed + 0x6d2b79f5) | 0;
  ...
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
```

Un **PRNG** (generador de números pseudoaleatorios) produce una secuencia que parece azar pero depende solo de la semilla (`seed`). Igual que `numpy.random.seed(...)`. Con semilla fija, `npm run fixture` regenera siempre el mismo `fixtures/library.json`. Así los diffs de git no cambian sin motivo y las pruebas no son frágiles. Las operaciones `| 0`, `>>>` y `Math.imul` son aritmética de enteros de 32 bits propia del algoritmo mulberry32; no hace falta entenderla para usarla.

Al final (`fixtures/generate.ts:89`), el generador pasa su propio resultado por `assertLibraryData`: no puede escribir un fixture inválido. Nunca se edita `library.json` a mano; se cambia el generador y se corre `npm run fixture`.

## env-guard: el guardián del entorno

`scripts/env-guard.ts` impide arrancar con rutas peligrosas.

- `forbiddenReason` (`scripts/env-guard.ts:13-28`) normaliza la ruta (minúsculas, barras, sin barra final) y la compara con tres rutas prohibidas: la biblioteca real, el directorio de usuario `Zotero` y el de `%APPDATA%`. `isInside` rechaza también subcarpetas. Devuelve el motivo o `null` si es segura.
- `checkEnv` (líneas 30-37) revisa `ZOTERO_DEV_DATA` y `ZOTERO_DEV_PROFILE`.
- Líneas 39-46: solo si el archivo se ejecuta directamente (no al importarlo desde las pruebas), carga `.env`, revisa y sale con código 1 si hay errores.

Se invoca antes de `npm run dev` y `npm run test:zotero` (`package.json:12,19`) y desde `setup.ps1`.

## El hook de Claude Code

Un **hook** es un programa que Claude Code ejecuta automáticamente en ciertos eventos. Este es un `PreToolUse`: se ejecuta **antes** de que un agente use una herramienta.

`.claude/settings.json:20-27` lo registra para `Bash|PowerShell|Read|Edit|Write|Glob|Grep`. `.claude/hooks/block-real-library.mjs`:

- Líneas 3-6: lee el JSON del evento desde la entrada estándar, toma `tool_input`, cambia `\` por `/` y pasa a minúsculas.
- Líneas 8-15: lista de fragmentos prohibidos (la biblioteca real, las carpetas `Zotero` dentro de `AppData` y atajos del directorio personal).
- Líneas 16-20: si el input contiene alguno, escribe el motivo y sale con código **2**, que para Claude Code significa "bloquea esta acción".

Además `settings.json:11-18` niega lecturas y escrituras directas sobre esas rutas.

Consecuencias que debes conocer (ADR 0002): el hook compara **texto**, así que incluso un documento o una prueba legítima que escriba la ruta literal queda bloqueado. Por eso `tests/unit/env-guard.test.ts:5-7` arma las rutas por partes (`["D:", "Users", ...].join("\\")`) y por eso estas guías no repiten esas rutas. El hook no detecta rutas construidas dinámicamente ni enlaces simbólicos; para eso existe env-guard.

Resumen de los tres niveles: `env-guard` (scripts), `permissions.deny` (permisos) y el hook (texto del input).

## Pruébalo tú

1. `npm run check`. Esperado: lint, typecheck y 2 archivos de prueba verdes.
2. `npm run fixture` y luego `git status`. Esperado: `fixtures/library.json` no aparece modificado (idéntico), y la salida dice `fixtures/library.json: 47 ítems, 6 colecciones, 8 tags`. (Verificado: el fixture ya está commiteado, así que `git status` no muestra cambios.)
3. Prueba de la regla de capas, en una rama descartable: añade en `src/view/main.ts` la línea `import "../zotero/index";` y ejecuta `npm run lint`. Esperado: error `La vista no conoce a Zotero.` Deshaz el cambio después.
