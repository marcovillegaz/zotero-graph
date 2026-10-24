# 01 — Core: tipos, contrato y validación

Carpeta: `src/core/`. Dos archivos: `types.ts` y `validate.ts`.

## Responsabilidad

Core define **qué forma tienen los datos** y comprueba que un dato cumpla esa forma. No lee archivos, no usa la red, no dibuja y no conoce a Zotero.

## Por qué core debe ser puro

Una **función pura** devuelve siempre lo mismo para los mismos argumentos y no tiene efectos secundarios (no escribe en disco, no cambia variables globales, no consulta la hora ni la red). Es como una función matemática, o una función de NumPy que no modifica sus entradas.

Ventajas concretas:

- Se prueba con un `expect(f(x)).toBe(y)`, sin montar Zotero ni un navegador.
- Se reutiliza igual en el navegador, en Zotero y en Node.
- Si core no importa nada, nada puede romperlo desde fuera.

Sin esta regla, un cambio en la API de Zotero podría romper la validación, y no podrías probar la lógica sin Zotero abierto.

ESLint lo impone (`eslint.config.js:19-29`): en `src/core/**/*.ts` prohíbe importar otras capas, importar paquetes externos y usar el global `Zotero`. Ver [guía 05](05-calidad-y-guardarrailes.md).

## TypeScript mínimo que necesitas

### `interface`: describir la forma de un objeto

`src/core/types.ts:8-18`:

```ts
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
```

Es parecido a un `dataclass` de Python o a un `struct` de Matlab, pero existe solo en tiempo de compilación: desaparece al ejecutar. Por eso hace falta validar datos que llegan de fuera (ver `unknown` más abajo).

- `export` hace visible el tipo a otros archivos.
- `year: number | null` es un **tipo unión**: el valor es un número **o** `null`. El compilador te obliga a manejar ambos casos antes de usarlo.
- `publication?: string` significa que la propiedad es opcional (puede faltar).
- `number[]` es un arreglo de números.

### La interfaz `LibraryAdapter`

`src/core/types.ts:34-39`:

```ts
export interface LibraryAdapter {
  load(): Promise<LibraryData>;
  selectItem(key: string): void; // no-op en JsonAdapter
  openItem(key: string): void; // abre PDF o ficha
  onChange?(cb: () => void): void; // refresco en vivo (Fase 3)
}
```

Una interfaz con métodos es un **contrato**: "cualquiera que se llame adaptador debe tener estos métodos". `Promise<LibraryData>` significa "un resultado que llegará después"; se explica en la [guía 02](02-adaptadores.md). `void` quiere decir que no devuelve nada.

### `unknown`: "no sé qué es, compruébalo"

`src/core/validate.ts:4-5`:

```ts
export function assertLibraryData(x: unknown): LibraryData {
  const d = x as LibraryData;
```

- Línea 4: el parámetro `x` es `unknown`. Un JSON leído de disco podría contener cualquier cosa; TypeScript no puede saberlo. `unknown` obliga a verificar antes de usar. (Es más seguro que `any`, que desactiva la revisión.)
- Línea 5: `x as LibraryData` es una **aserción de tipo**: le dices al compilador "confía en mí, es un `LibraryData`". No comprueba nada en ejecución. Por eso lo que sigue (líneas 7-37) hace las comprobaciones reales.

El nombre `assert...` indica la convención: o devuelve el dato válido (línea 39) o lanza un error (líneas 7, 12, 38).

### `as const`: arreglo de literales exactos

`src/core/validate.ts:9-11`:

```ts
for (const k of ["items", "collections", "tags"] as const) {
  if (!Array.isArray(d[k])) errors.push(`${k} no es un arreglo`);
}
```

Sin `as const`, `k` sería un `string` cualquiera y `d[k]` no compilaría (no toda cadena es una propiedad de `LibraryData`). Con `as const`, `k` es exactamente `"items" | "collections" | "tags"`, y TypeScript sabe que `d[k]` es válido.

### `Set` y `Map`

`src/core/validate.ts:14-17`:

```ts
const collIds = new Set(d.collections.map((c) => c.id));
const tagIds = new Set(d.tags.map((t) => t.id));
if (collIds.size !== d.collections.length) errors.push("ids de colección duplicados");
```

- `Set` es un conjunto: no admite repetidos y `has(x)` es rápido. Igual que `set` en Python.
- `.map((c) => c.id)` transforma cada colección en su id (como una comprensión de lista).
- Truco: si al convertir a conjunto el tamaño baja, había duplicados (línea 16).

`src/core/validate.ts:22-23` y `32`:

```ts
const keys = new Set<string>();
const tagUse = new Map<number, number>();
...
tagUse.set(t, (tagUse.get(t) ?? 0) + 1);
```

- `Map<number, number>` es un diccionario de id de tag a número de usos. `new Set<string>()` indica entre `< >` el tipo de los elementos.
- `tagUse.get(t) ?? 0`: `get` devuelve `undefined` si no existe; `??` usa `0` en ese caso. Equivale a `d.get(t, 0)` de Python.

## Qué valida `assertLibraryData`

Lee `src/core/validate.ts` en este orden:

1. Líneas 7-12: forma general (objeto, `asof` es fecha, `items`/`collections`/`tags` son arreglos). Si falla, lanza de inmediato porque no se puede seguir.
2. Líneas 14-20: ids únicos de colecciones y tags; todo `parentId` apunta a una colección existente.
3. Líneas 22-34: cada ítem tiene `key` de 8 caracteres `A-Z0-9` (regex en la línea 25), sin repetir, sin anotaciones negativas, y sus `collectionIds` y `tagIds` existen. Va contando cuántas veces se usa cada tag.
4. Líneas 35-37: el `count` declarado de cada tag debe igualar los usos contados.
5. Línea 38: si hubo errores, los lanza **todos juntos**, un problema por línea. Es más útil que fallar con el primero.

Esto se llama **integridad referencial**: si un ítem dice `tagIds: [7]`, el tag 7 tiene que existir. Igual que una clave foránea en una base de datos.

## Cómo se prueba

`tests/unit/fixture.test.ts:5` pasa el fixture por `assertLibraryData`; si el fixture estuviera roto, la prueba fallaría al cargarse. Además comprueba que el fixture cubre los casos borde.

## Qué puede y qué no puede importar

- Puede: sus propios archivos (`./types`).
- No puede: `view`, `adapters`, `zotero`, paquetes npm ni el global `Zotero`.

## Pruébalo tú

1. `npm run test:unit`. Esperado: todas las pruebas pasan, incluida `fixtures/library.json`.
2. Rompe una referencia **en una copia**: copia `fixtures/library.json` a una carpeta temporal, cambia en un ítem un `tagIds` a `[999]` y valida la copia con `npx tsx -e "import {assertLibraryData} from './src/core/validate'; import {readFileSync} from 'node:fs'; assertLibraryData(JSON.parse(readFileSync(process.argv[1],'utf8')))" <ruta-de-la-copia>`. Esperado: error `ítem XXXXXXXX: tag 999 no existe` (y también un `count` desajustado). No edites el original; si lo haces, `npm run fixture` lo regenera.
3. Cambia temporalmente `year: number | null` a `year: number` en una copia mental y piensa qué ítems del fixture dejarían de cumplirlo (los "Sin año"). Es el valor de los tipos unión.
