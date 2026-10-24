# 04 — El plugin de Zotero

Carpetas: `addon/` y `src/zotero/`. Más `zotero-plugin.config.ts` en la raíz.

## Verificado y no verificado

| Cosa | Estado |
|---|---|
| `npm run build` genera `build/zotero-library-graph.xpi` | Verificado (bitácora, 2026-10-24) |
| El `.xpi` se instala y ejecuta en Zotero | **No verificado** |
| `npm run dev` abre Zotero con el perfil de desarrollo y muestra `[graph] startup` | **No verificado**: nunca se ejecutó con Zotero |
| Menús, ventana y `ZoteroAdapter` real | No existen aún (Fase 2) |

Todo lo que sigue explica el diseño y el código existente; lo que depende de Zotero real se marca como no probado.

## Responsabilidad

El **shell** es la capa que se conecta al ciclo de vida de Zotero. Hoy hace una sola cosa: escribir un mensaje en el log.

## `addon/manifest.json`: la identidad

`addon/manifest.json:6-10`:

```json
"applications": {
  "zotero": {
    "id": "zotero-library-graph@marcovillegaz",
    "strict_min_version": "7.0"
  }
}
```

Dice qué plugin es (el `id` es único), y que exige Zotero 7 o superior. Sin manifiesto, Zotero no reconoce el paquete como plugin.

## `addon/bootstrap.js`: el ciclo de vida

`addon/bootstrap.js` completo (17 líneas):

```js
var chromeHandle;
function install() {}
async function startup({ rootURI }) {
  Services.scriptloader.loadSubScript(rootURI + "content/scripts/zotero-library-graph.js", { Zotero });
  Zotero.debug("[graph] bootstrap startup");
}
function shutdown() {
  Zotero.debug("[graph] bootstrap shutdown");
  chromeHandle = null;
}
function uninstall() {}
```

Zotero busca estas cuatro funciones por nombre y las llama en momentos concretos:

| Función | Cuándo la llama Zotero | Qué hace aquí |
|---|---|---|
| `install` | Al instalar o actualizar el plugin | Nada |
| `startup` | Al arrancar Zotero, o al activar el plugin | Carga el script principal y escribe un log |
| `shutdown` | Al cerrar Zotero o desactivar el plugin | Escribe un log y suelta `chromeHandle` |
| `uninstall` | Al desinstalar | Nada |

Detalle de `startup` (`addon/bootstrap.js:6-9`):

- `{ rootURI }` desestructura el parámetro: Zotero pasa un objeto y tomamos solo `rootURI`, la ruta interna donde vive el plugin.
- `Services.scriptloader.loadSubScript(url, scope)` es una función de la plataforma de Firefox que ejecuta otro archivo JS. Aquí carga `content/scripts/zotero-library-graph.js` (el código compilado desde `src/zotero/index.ts`) y le entrega `{ Zotero }` como variable disponible.
- `Zotero.debug("[graph] ...")` escribe en el log de depuración de Zotero. El prefijo `[graph]` es convención del proyecto.

Por qué es JavaScript y no TypeScript: Zotero lo ejecuta directamente, sin compilar. Además `eslint.config.js:6` excluye `addon` del lint.

`var chromeHandle` y la línea `chromeHandle = null` son andamiaje de la plantilla del scaffold; hoy no se usa para nada. (`/* global Services */` en la línea 1 solo avisa a ESLint de que `Services` existe.)

## `src/zotero/index.ts`: el código real del shell

`src/zotero/index.ts:2-6`:

```ts
export function startup(): void {
  Zotero.debug("[graph] startup");
}

startup();
```

Es la entrada que el empaquetador compila a `zotero-library-graph.js`. Al cargarse, llama a `startup()` y deja el mensaje en el log. El tipo del objeto global `Zotero` viene del paquete `zotero-types` (`tsconfig.zotero.json:4`). Ver más abajo por qué hay dos `tsconfig`.

## `zotero-plugin-scaffold`: la herramienta de empaquetado

El **scaffold** (paquete `zotero-plugin-scaffold`) automatiza tres cosas: compilar, crear el `.xpi` y lanzar Zotero con recarga en caliente. Evita escribir a mano los scripts de zip y la configuración de Firefox. La decisión está en `docs/decisiones/0001-tooling-zotero-plugin-scaffold.md`.

Se configura en `zotero-plugin.config.ts`:

- Líneas 5-7: el scaffold lee variables con sus propios nombres; aquí se copian desde las de este proyecto (`ZOTERO_BIN`, `ZOTERO_DEV_PROFILE`, `ZOTERO_DEV_DATA`). `??=` asigna solo si aún no tienen valor.
- Línea 11: `dist: "build"` es la carpeta de salida.
- Líneas 16-26: `build.esbuildOptions` compila `src/zotero/index.ts` (con `bundle: true`, junta todo en un archivo) hacia `build/addon/content/scripts/zotero-library-graph.js`. `target: "firefox115"` fija la versión de JavaScript que entiende Zotero 7.
- Línea 28: `createProfileIfMissing: true` crea el perfil de desarrollo si no existe.

Comandos en `package.json:12,14`: `dev` es `tsx scripts/env-guard.ts && zotero-plugin serve` (primero el guardián, después el servidor); `build` es `zotero-plugin build`.

## El `.xpi`

Un `.xpi` es un `.zip` con otra extensión. Contiene `manifest.json`, `bootstrap.js`, locales y el script compilado. Se genera con `npm run build` en `build/zotero-library-graph.xpi`. Puedes abrirlo renombrándolo a `.zip` en una copia para ver su contenido.

## Perfil de desarrollo y por qué nunca se toca la biblioteca real

Un **perfil de Zotero** es la carpeta donde guarda preferencias y plugins; el **data dir** es donde guarda la biblioteca (base de datos y PDFs). Si ejecutas tu plugin en el perfil normal, un error podría modificar o corromper tu biblioteca real, que es irreemplazable.

Por eso el proyecto exige un perfil y un data dir dedicados:

1. Copiar `.env.example` a `.env` y ajustar `ZOTERO_BIN`, `ZOTERO_DEV_PROFILE`, `ZOTERO_DEV_DATA`.
2. Ejecutar `powershell -File fixtures/zotero-profile/setup.ps1`: valida las rutas con `scripts/env-guard.ts` y crea las carpetas (`setup.ps1:12-19`).
3. `npm run dev` abre Zotero con ese perfil.
4. Comprobar en Zotero (Ajustes, Avanzado, Archivos y carpetas) que el data dir mostrado es el de desarrollo.

Protecciones en tres niveles: ver la [guía 05](05-calidad-y-guardarrailes.md) y `docs/decisiones/0002-guardarrailes-biblioteca-real.md`.

Estado de la biblioteca de desarrollo: queda vacía o se llena a mano; poblarla desde `fixtures/library.json` es trabajo de la Fase 2 (`fixtures/zotero-profile/README.md`).

## Qué puede importar

El shell puede importar de `core`, `view` y `adapters`. Hoy no importa nada.

## Cómo se prueba

- Tipos: `tsc --noEmit -p tsconfig.zotero.json` (parte de `npm run typecheck`).
- Empaquetado: `npm run build`.
- Pruebas dentro de Zotero: `npm run test:zotero` solo ejecuta el guardián y escribe "pendiente (Fase 2)" (`package.json:19`).

## Pruébalo tú

1. `npm run build`. Esperado: aparece `build/zotero-library-graph.xpi` sin errores.
2. Copia ese `.xpi` a una carpeta temporal, renómbralo a `.zip` y ábrelo. Esperado: ves `manifest.json`, `bootstrap.js` y `content/scripts/zotero-library-graph.js`. (No instales ese archivo en tu Zotero normal.)
3. Con la variable `ZOTERO_DEV_DATA` vacía (por ejemplo, sin `.env`), `npm run dev`. Esperado: `[env-guard] ABORTADO` y salida con error antes de abrir Zotero. Esto prueba el guardián sin arriesgar nada.
