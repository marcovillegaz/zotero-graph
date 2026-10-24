# 03 — La vista

Carpeta: `src/view/`. Tres archivos: `index.html`, `entry.ts` y `main.ts`. Hoy es un **placeholder**: muestra tres conteos. El grafo real llega en la Fase 1.

## Responsabilidad

Dibujar. Recibe un `LibraryAdapter`, pide los datos y los pinta. No sabe de dónde vienen.

## Qué puede y qué no puede importar

- Puede: `core` (tipos) y librerías de interfaz.
- No puede: `src/zotero/`, `zotero-adapter` ni el global `Zotero` (`eslint.config.js:31-38`).

Nota: `src/view/entry.ts:1` importa `JsonAdapter` desde `adapters`. Es válido: la regla solo prohíbe lo relacionado con Zotero. `entry.ts` es el único punto donde se elige qué adaptador usar; `main.ts` solo ve la interfaz.

## Los tres archivos

### `index.html`

`src/view/index.html:9-10`:

```html
<main id="app"></main>
<script type="module" src="./entry.ts"></script>
```

- `<main id="app">` es un contenedor vacío donde se montará la vista.
- `<script type="module" src="./entry.ts">` carga el punto de entrada. Un navegador no entiende TypeScript, pero Vite lo traduce al vuelo (ver más abajo).

### `entry.ts`: elegir el adaptador

`src/view/entry.ts:4`:

```ts
void mountView(document.getElementById("app")!, new JsonAdapter("/library.json"));
```

- `document.getElementById("app")` busca el contenedor del HTML.
- El `!` final es la **aserción de no-nulo**: le dices a TypeScript "esto no será `null`" (la función podría devolver `null` si el elemento no existiera).
- `new JsonAdapter("/library.json")` crea el adaptador con una URL.
- `void` descarta de forma explícita la promesa que devuelve `mountView`. Sin él, ESLint podría quejarse de una promesa sin manejar.

### `main.ts`: `mountView`

`src/view/main.ts:4-7`:

```ts
export async function mountView(root: HTMLElement, adapter: LibraryAdapter): Promise<void> {
  const data = await adapter.load();
  root.innerHTML = `<p data-testid="summary">${data.items.length} ítems, ${data.collections.length} colecciones, ${data.tags.length} tags</p>`;
}
```

- Recibe el contenedor y el adaptador **por parámetro** (se llama **inyección de dependencias**: la función no crea ni busca su adaptador). Gracias a eso, cualquier adaptador sirve.
- `data-testid="summary"` es una etiqueta pensada para las pruebas: Playwright localiza el párrafo por ella, sin depender del texto ni del estilo.
- Las comillas invertidas permiten `${expresión}` dentro del texto (como las f-strings de Python).

Por qué separar `entry.ts` de `main.ts`: `main.ts` es reutilizable (la tomará el shell de Zotero con otro adaptador); `entry.ts` es específico de la versión standalone.

## Vite: el servidor de desarrollo

Un **bundler / servidor de desarrollo** (Vite) toma tu TypeScript, lo traduce a JavaScript para el navegador y lo sirve con recarga automática.

`vite.config.ts:4-8`:

```ts
export default defineConfig({
  root: "src/view",
  publicDir: "../../fixtures",
  server: { port: 5173, strictPort: true },
});
```

- `root: "src/view"`: la raíz del sitio es esa carpeta; por eso `/` sirve `index.html`.
- `publicDir: "../../fixtures"`: todo lo que esté en `fixtures/` se sirve como estático en la raíz. Así `fixtures/library.json` es accesible como `/library.json`, que es lo que pide `entry.ts`.
- `strictPort: true`: si el 5173 está ocupado, falla en vez de elegir otro puerto. Playwright espera exactamente ese puerto.

## Cómo se sirve: `npm run dev:view`

`package.json:13` define `dev:view` como `vite --config vite.config.ts`. Al ejecutarlo, Vite queda escuchando en `http://localhost:5173`. Ctrl+C lo detiene.

## Cómo la prueba Playwright

**Playwright** controla un navegador real desde código (abrir una página, hacer clic, leer texto). Es como un usuario automático.

`tests/view/smoke.spec.ts:4-10`:

```ts
test("la vista muestra los conteos del fixture", async ({ page }) => {
  const d = JSON.parse(readFileSync("fixtures/library.json", "utf8"));
  await page.goto("/");
  await expect(page.getByTestId("summary")).toHaveText(
    `${d.items.length} ítems, ${d.collections.length} colecciones, ${d.tags.length} tags`,
  );
});
```

Idea: leer el JSON directamente, calcular el texto esperado y comparar con lo que muestra la página. Si cambias el fixture, la prueba sigue valiendo porque el esperado se calcula, no se escribe a mano.

`playwright.config.ts:3-7` dice dónde están las pruebas (`tests/view`), la URL base y cómo arrancar el servidor: `webServer: { command: "npm run dev:view", ..., reuseExistingServer: true }`. Playwright levanta `dev:view` por ti, o reutiliza el que ya tengas abierto. Se corre con `npm run test:view`.

Estado: la prueba y el comando existen y, según la bitácora, pasaron. Las capturas de regresión visual de `CLAUDE.md` aún no existen.

## Pruébalo tú

1. `npm run dev:view` y abre `http://localhost:5173`. Esperado: `47 ítems, 6 colecciones, 8 tags`.
2. Con el servidor aún corriendo, edita el texto de `src/view/main.ts` (por ejemplo cambia "ítems" por "referencias") y guarda. Esperado: el navegador se recarga solo y muestra el cambio. Devuelve el texto original después, o `npm run test:view` fallará.
3. `npm run test:view`. Esperado: 1 prueba pasa. (Requiere haber instalado los navegadores de Playwright; si falla por eso, ejecuta `npx playwright install chromium`.)
