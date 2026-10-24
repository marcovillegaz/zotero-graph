# CLAUDE.md — zotero-library-graph

Plugin para Zotero 7+ que muestra la biblioteca como un grafo interactivo de referencias, colecciones y tags, integrado de forma nativa en la interfaz. Nace del prototipo HTML generado en la auditoría de la biblioteca (`grafo-biblioteca.html`), que es la referencia visual y funcional del MVP.

- Dueño: Marco (marcovillegaz)
- Idioma: código, identificadores y commits en inglés; documentación y comunicación en español.
- Sistema operativo principal: Windows (Zotero corre en Windows; Claude Code nativo en Windows).

---

## 1. Reglas duras (no negociables)

1. **Nunca tocar la biblioteca real.** El data dir `D:\Users\marco\Zotero` y el perfil por defecto de Zotero están fuera de alcance para lectura y escritura de cualquier agente o script. Todo desarrollo y prueba usa el perfil de desarrollo y la biblioteca de fixture (sección 5).
2. **La vista no conoce a Zotero.** Nada dentro de `src/view/` puede importar de `src/zotero/` ni usar el objeto global `Zotero`. La comunicación es solo a través de la interfaz `LibraryAdapter`.
3. **Ninguna tarea termina con pruebas rotas.** `npm run check` (lint + typecheck + unit) debe pasar antes de declarar algo listo.
4. **Sin escrituras en la biblioteca hasta la Fase 4.** El adaptador de Zotero es de solo lectura hasta que se decida explícitamente lo contrario en un ADR.
5. **No inventar APIs de Zotero.** Si no está claro cómo se hace algo en la API interna, se consulta la documentación o el código fuente de Zotero y se deja la fuente citada en el PR.

---

## 2. Arquitectura

Tres capas con dependencias en una sola dirección:

```
shell (src/zotero/plugin)  ──usa──▶  view (src/view)
        │                                  ▲
        └──implementa──▶ LibraryAdapter ───┘   (src/core)
```

| Capa | Carpeta | Responsabilidad | Puede depender de |
|---|---|---|---|
| Core | `src/core/` | Tipos del contrato de datos, interfaz `LibraryAdapter`, transformaciones puras (construcción del grafo, normalización de tags, filtros, métricas) | Nada externo |
| View | `src/view/` | Render del grafo (force-graph), panel lateral, filtros, leyenda, búsqueda. Emite eventos (`select-item`, `open-item`) | `core` |
| Adapters | `src/adapters/` | `JsonAdapter` (fixture, navegador) y `ZoteroAdapter` (API interna de Zotero) | `core` (y `Zotero` solo en `ZoteroAdapter`) |
| Shell | `src/zotero/` | `bootstrap.js`, registro de menús, ventana o pestaña, ciclo de vida del plugin | `core`, `view`, `adapters` |

### Contrato de datos (`src/core/types.ts`)

Se mantiene compatible con `graph.json` del prototipo:

```ts
interface LibraryData {
  asof: string;                 // ISO date
  items: Item[];
  collections: Collection[];
  tags: Tag[];
}
interface Item {
  key: string;                  // Zotero item key (8 chars)
  title: string;
  firstAuthor: string;          // "Apellido" o "Apellido et al."
  year: number | null;
  itemType: string;             // journalArticle, book, ...
  publication?: string;
  annotationCount: number;
  collectionIds: number[];
  tagIds: number[];
}
interface Collection { id: number; name: string; parentId: number | null; rootName: string; }
interface Tag { id: number; name: string; count: number; variants?: string[]; }

interface LibraryAdapter {
  load(): Promise<LibraryData>;
  selectItem(key: string): void;     // no-op en JsonAdapter
  openItem(key: string): void;       // abre PDF o ficha
  onChange?(cb: () => void): void;   // refresco en vivo (Fase 3)
}
```

Cualquier cambio a este contrato requiere un ADR y actualizar fixture, adaptadores y pruebas en el mismo PR.

---

## 3. Estructura del repositorio

```
src/
  core/            tipos, adapter interface, graph builder, tag normalizer
  view/            UI del grafo (sin Zotero)
  adapters/        json-adapter.ts, zotero-adapter.ts
  zotero/          bootstrap, menús, ventana/pestaña
addon/             manifest.json, locales, íconos
fixtures/
  library.json     biblioteca de prueba (~50 refs) para la vista
  zotero-profile/  instrucciones y script para poblar el perfil de desarrollo
tests/
  unit/            Vitest
  view/            Playwright sobre la vista standalone
  zotero/          pruebas dentro de Zotero
docs/              documentación viva (dueño: writer)
graphify-out/      grafo del proyecto (dueño: cartographer; no editar a mano)
.claude/agents/    definiciones de subagentes
```

---

## 4. Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Compila y lanza Zotero con el perfil de desarrollo y recarga en caliente |
| `npm run dev:view` | Sirve la vista standalone con `JsonAdapter` y `fixtures/library.json` |
| `npm run build` | Genera el `.xpi` en `build/` |
| `npm run lint` / `npm run typecheck` | ESLint y `tsc --noEmit` |
| `npm run test:unit` | Vitest (rápido; se corre en cada cambio) |
| `npm run test:view` | Playwright contra `dev:view`, incluye capturas de regresión visual |
| `npm run test:zotero` | Pruebas de integración dentro de Zotero contra la biblioteca de fixture |
| `npm run check` | `lint` + `typecheck` + `test:unit` (gate obligatorio) |
| `npm run fixture` | Regenera `fixtures/library.json` y repuebla el perfil de desarrollo |
| `/graphify . --update` | Actualiza el grafo del proyecto en `graphify-out/` |

Si un comando de esta tabla aún no existe o cambia, el writer actualiza esta tabla y `docs/comandos.md` en el mismo PR.

---

## 5. Entorno de desarrollo

- Variables en `.env` (no se commitea; ver `.env.example`):
  - `ZOTERO_BIN`: ruta al ejecutable de Zotero.
  - `ZOTERO_DEV_PROFILE`: perfil dedicado, p. ej. `C:\Users\marco\ZoteroDev\profile`.
  - `ZOTERO_DEV_DATA`: data dir dedicado, p. ej. `C:\Users\marco\ZoteroDev\data`.
- Los scripts deben abortar si `ZOTERO_DEV_DATA` apunta a `D:\Users\marco\Zotero` o al data dir por defecto.
- Biblioteca de fixture: ~50 referencias anonimizadas o sintéticas que cubren casos borde: duplicados, ítems sin año, sin autores, sin tags, PDFs sueltos, tags con variantes de mayúsculas/plural, colecciones anidadas de 3 niveles, ítems en varias colecciones, ítems con 0 y con 100+ anotaciones.
- Depuración: ventana *Run JavaScript* de Zotero y Browser Toolbox. Logs con `Zotero.debug('[graph] ...')`, siempre con el prefijo `[graph]`.

---

## 6. Agentes

Cinco subagentes con responsabilidades separadas. Cada uno tiene su archivo en `.claude/agents/`. El agente principal orquesta: descompone la tarea, delega y consolida.

### developer
- **Hace:** implementa features y correcciones según un plan aprobado o un informe de QA.
- **Dueño de:** `src/`, `addon/`.
- **Reglas:** respeta la arquitectura de capas; escribe o actualiza pruebas unitarias junto con el código; corre `npm run check` antes de entregar; no edita `docs/` (deja notas para el writer en la descripción del cambio).
- **Entrega:** diff + resumen de qué cambió y qué falta.

### tester
- **Hace:** diseña y escribe pruebas unitarias, de vista (Playwright) y de integración en Zotero; mantiene los fixtures.
- **Dueño de:** `tests/`, `fixtures/`.
- **Reglas:** prueba comportamiento, no implementación; cada bug reportado por QA se convierte primero en una prueba que falla; no modifica `src/` salvo para exponer puntos de prueba acordados con el developer.
- **Entrega:** pruebas nuevas, resultado de la suite y cobertura de los casos borde de la sección 5.

### qa
- **Hace:** usa la vista como un usuario (Playwright MCP sobre `dev:view`) y, en hitos, revisa el plugin instalado en el perfil de desarrollo.
- **Dueño de:** `docs/qa/` (informes).
- **Reglas:** no corrige código; reporta con pasos para reproducir, resultado esperado vs. obtenido y captura; usa la skill `qa-report` para el formato del informe destinado al developer.
- **Entrega:** informe de QA priorizado (bloqueante, mayor, menor, cosmético).

### writer
- **Hace:** mantiene la documentación viva para no perder el hilo del proyecto.
- **Dueño de:** `docs/`, la tabla de comandos de este archivo, `CHANGELOG.md`, `README.md`.
- **Documentos a su cargo:**
  - `docs/comandos.md`: guía de comandos del proyecto, de Zotero para desarrollo y de Claude Code (agentes, slash commands, graphify), con ejemplos.
  - `docs/arquitectura.md`: capas, contrato de datos y diagramas (apoyado en los mapas del cartographer).
  - `docs/decisiones/NNNN-titulo.md`: ADRs con contexto, decisión y consecuencias.
  - `docs/bitacora.md`: qué se hizo en cada sesión, qué quedó pendiente y próximos pasos.
  - `CHANGELOG.md`: por versión, en formato Keep a Changelog.
- **Reglas:** escribe después de cada cambio relevante; documenta lo que existe, no lo planificado (lo planificado va en la bitácora como pendiente); no modifica código.

### cartographer
- **Hace:** construye, consulta y explota el grafo de conocimiento del proyecto generado con graphify.
- **Dueño de:** `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`, `graph.html`).
- **Tareas típicas:**
  - Regenerar el grafo (`/graphify . --update`) después de cambios estructurales.
  - Responder preguntas de arquitectura consultando `graph.json` antes de leer archivos: dónde se usa X, qué depende de Y, qué rompe si cambio Z.
  - Verificar las reglas de capas: reportar cualquier arista desde `src/view/` o `src/core/` hacia `src/zotero/` o hacia `Zotero`.
  - Detectar módulos huérfanos, nodos con demasiadas dependencias y comunidades que no calzan con la estructura de carpetas.
  - Entregar al writer mapas y resúmenes para `docs/arquitectura.md`.
- **Reglas:** solo lectura sobre `src/`; nunca edita `graphify-out/` a mano; cita nodos y archivos concretos en sus respuestas.

### Flujo estándar de una feature

1. El agente principal define el plan (modo plan) y lo valida con Marco si la tarea es grande.
2. **cartographer** entrega el mapa de impacto: archivos y módulos afectados.
3. **tester** escribe las pruebas que definen "listo" (fallan al inicio).
4. **developer** implementa hasta que pasen y `npm run check` esté verde.
5. **qa** prueba la vista y reporta; los bugs vuelven al paso 3.
6. **cartographer** regenera el grafo y verifica las reglas de capas.
7. **writer** actualiza bitácora, comandos, arquitectura y changelog.

Para trabajo en paralelo (p. ej. vista y adaptador a la vez) se usan worktrees de git, un agente por worktree.

---

## 7. Hoja de ruta

| Fase | Objetivo | Criterio de término |
|---|---|---|
| 0 | Repo, plantilla, CLAUDE.md, agentes, fixture, graphify | `npm run check` verde en repo vacío; fixture generado |
| 1 | Vista standalone con `JsonAdapter` (port del prototipo a TS) | Paridad funcional con `grafo-biblioteca.html`; `test:view` verde |
| 2 | MVP en Zotero: menú → ventana con `ZoteroAdapter` de solo lectura | Grafo en vivo sobre la biblioteca de fixture; `test:zotero` verde |
| 3 | Integración nativa: pestaña propia, sincronía de selección, refresco en vivo | Clic en nodo selecciona el ítem en Zotero y viceversa |
| 4 | Curaduría desde el grafo: fusionar tags, asignar `estado:`, mover a colecciones | ADR aprobado para escrituras; cada acción con deshacer |
| 5 | Distribución: firma, releases en GitHub, actualizaciones automáticas | `.xpi` instalable desde un release |

Fase actual: **0**.

---

## 8. Convenciones

- TypeScript en modo `strict`. Sin `any` salvo en los bordes con la API de Zotero, tipados localmente.
- Funciones de `src/core/` puras y deterministas: mismo input, mismo output.
- Commits: Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).
- Ramas: `feat/<tema>`, `fix/<tema>`; `main` siempre instalable.
- Estilo visual: el del prototipo (paleta, tipografía Inter, modo claro/oscuro con tokens CSS).

## 9. Definición de listo

Una tarea está lista cuando:
- `npm run check` pasa y las pruebas nuevas cubren el cambio.
- QA no reporta bloqueantes ni mayores.
- El cartographer no detecta violaciones de capas.
- El writer actualizó la bitácora y, si aplica, comandos, arquitectura, ADR y changelog.

## 10. Cuando haya dudas

- Arquitectura o "dónde está X": preguntar primero al cartographer (grafo) antes de recorrer archivos.
- Decisiones que cambian el contrato de datos, la arquitectura o habilitan escrituras: proponer ADR y consultar a Marco.
- Preferir la solución simple que funciona antes que la general; agregar complejidad solo cuando un caso real la exija.
