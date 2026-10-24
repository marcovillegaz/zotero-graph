# 02 — Adaptadores

Carpeta: `src/adapters/`. Dos archivos: `json-adapter.ts` y `zotero-adapter.ts`.

## El problema que resuelve

La vista necesita datos de la biblioteca. Pero esos datos pueden venir de dos sitios: un archivo JSON (desarrollo y pruebas) o la API interna de Zotero (producción). Si la vista leyera directamente de cada fuente, tendría `if` por todas partes y no se podría ejecutar fuera de Zotero.

## El patrón adaptador

Defines **una interfaz** (el enchufe) y varias implementaciones (los enchufes concretos). Quien consume solo conoce el enchufe.

Analogía: un cargador universal. El portátil (la vista) pide "corriente de 19 V" (la interfaz); no le importa si viene de un enchufe europeo o de un inversor de coche (JSON o Zotero). La analogía deja de valer en que un adaptador de software además traduce la forma de los datos, no solo el voltaje.

La interfaz está en `src/core/types.ts:34-39` (ver [guía 01](01-core.md)). Cualquier clase que haga `implements LibraryAdapter` debe tener `load`, `selectItem` y `openItem`.

## `JsonAdapter`: la implementación que funciona hoy

`src/adapters/json-adapter.ts:5-13`:

```ts
export class JsonAdapter implements LibraryAdapter {
  constructor(private readonly source: LibraryData | string) {}

  async load(): Promise<LibraryData> {
    if (typeof this.source !== "string") return assertLibraryData(this.source);
    const res = await fetch(this.source);
    if (!res.ok) throw new Error(`JsonAdapter: ${this.source} respondió ${res.status}`);
    return assertLibraryData(await res.json());
  }
```

Línea a línea:

- Línea 5: `class ... implements LibraryAdapter`. El compilador exige que cumpla el contrato; si olvidas un método, no compila.
- Línea 6: `constructor(private readonly source: ...)` declara y guarda `source` en un solo paso. `LibraryData | string` es una unión: o te pasan los datos ya cargados, o una URL. `readonly` impide reasignarlo.
- Línea 8: `async load(): Promise<LibraryData>`. Ver la siguiente sección.
- Línea 9: si `source` no es una cadena, ya son datos; solo se validan.
- Línea 10: `fetch(url)` pide la URL por HTTP. Devuelve una respuesta `res`.
- Línea 11: `res.ok` es falso para errores 404, 500, etc. Se lanza un error con el código.
- Línea 12: `res.json()` convierte el cuerpo en objeto; `assertLibraryData` lo valida. Esta es la **frontera** donde datos externos no confiables pasan a ser un `LibraryData` confiable.

`selectItem` y `openItem` (líneas 15-21) solo escriben un `console.debug("[graph] ...")`. Sin Zotero no hay nada que seleccionar o abrir; la interfaz comenta "no-op en JsonAdapter".

## `async` / `await` y `Promise`

Pedir un archivo o llamar a una API toma tiempo. Si el programa esperara bloqueado, la pantalla se congelaría. JavaScript resuelve esto con **promesas**: una `Promise<T>` es "un valor de tipo T que llegará más tarde".

- `async` marca una función que devuelve una promesa.
- `await` pausa **esa función** hasta que la promesa se cumple, sin congelar el resto.

Analogía: pedir un análisis a un laboratorio y recibir un ticket (la promesa). Con `await` dices "espero el resultado antes de seguir". La analogía deja de valer en que, mientras esperas, el navegador sigue atendiendo clics.

Uso real: `src/view/main.ts:5` hace `const data = await adapter.load();`.

## `ZoteroAdapter`: un stub

`src/adapters/zotero-adapter.ts:3-16` define la clase con los tres métodos, y cada uno hace `throw new Error("ZoteroAdapter: not implemented (Fase 2)")`. Un **stub** es un esqueleto que cumple la forma del contrato pero aún no hace el trabajo. Sirve para que el resto compile y para marcar dónde irá el código real.

Observa `selectItem(_key: string)`: el guion bajo inicial avisa a ESLint de que el parámetro no se usa a propósito (`eslint.config.js:16`).

Cuando se implemente (Fase 2), será de solo lectura (regla dura 4 de `CLAUDE.md`), y es la única pieza de `src/adapters/` autorizada a usar el objeto `Zotero`.

## Por qué la vista no conoce a Zotero

La regla 2 de `CLAUDE.md` prohíbe que `src/view/` importe de `src/zotero/` o use `Zotero`. Consecuencias:

1. La vista corre en cualquier navegador con `JsonAdapter`; se desarrolla y prueba en segundos.
2. Un error de la vista no puede dañar la biblioteca real, porque ni siquiera tiene acceso.
3. El día que cambie la API de Zotero, solo se reescribe `ZoteroAdapter`.

Se impone con ESLint (`eslint.config.js:31-38`): en `src/view/**` hay una regla que rechaza cualquier import cuya ruta contenga `zotero` o `zotero-adapter`, y prohíbe el global `Zotero`.

También hay una separación en el compilador: `tsconfig.json:14` incluye solo `src/adapters/json-adapter.ts` y `tsconfig.zotero.json:6` incluye `zotero-adapter.ts`, que es el único que ve los tipos de Zotero. Ver [guía 05](05-calidad-y-guardarrailes.md).

## Qué puede importar

Los adaptadores pueden importar de `core`. `JsonAdapter` no usa `Zotero`. `ZoteroAdapter` es la excepción y hoy no usa nada de Zotero porque es un stub.

## Cómo se prueba

Hoy `JsonAdapter` se ejercita de forma indirecta con `tests/view/smoke.spec.ts` (el navegador carga `/library.json` mediante `JsonAdapter`). No hay prueba unitaria directa de `JsonAdapter` ni de `ZoteroAdapter` (ver bitácora si se agrega una).

## Pruébalo tú

1. `npm run dev:view`, y en el navegador abre `http://localhost:5173/library.json`. Esperado: ves el JSON crudo que consume `fetch`.
2. Con el servidor activo, abre las herramientas de desarrollo (F12), pestaña *Network*, recarga `http://localhost:5173` y busca `library.json`. Esperado: estado 200. Es la misma petición del `fetch` de `json-adapter.ts:10`.
3. En la consola del navegador no se ve nada de `selectItem`, porque la vista aún no lo llama. Búscalo con `Grep` en `src/view`: no aparece. Esperado: sin resultados.
