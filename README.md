# Zotero Library Graph

Plugin para Zotero 7+ que muestra la biblioteca como un grafo interactivo de referencias, colecciones y tags, integrado en la interfaz de Zotero.

**Estado:** Fase 0 (bases del repo y harness de agentes). La vista real llega en la Fase 1; ver la hoja de ruta en `CLAUDE.md`.

## Requisitos

- Node.js 22 o superior
- Zotero 7 o superior (solo para `npm run dev`)
- Windows como plataforma principal

## Inicio rápido

```
npm install
npm run check        # lint + typecheck + pruebas unitarias
npm run dev:view     # vista standalone con fixtures/library.json
npm run build        # genera build/zotero-library-graph.xpi
```

Para ejecutar el plugin dentro de Zotero hay que crear antes el perfil de desarrollo: ver `fixtures/zotero-profile/README.md`. **Nunca** se usa la biblioteca real.

## Documentación

- `CLAUDE.md`: reglas del proyecto, arquitectura y agentes.
- `docs/comandos.md`, `docs/arquitectura.md`, `docs/decisiones/`, `docs/bitacora.md`.
- Guías para aprender el proyecto (empieza por la 00):
  - `docs/guia/00-mapa.md`: visión general, lenguajes y recorrido de un dato.
  - `docs/guia/01-core.md`: tipos, contrato y validación pura.
  - `docs/guia/02-adaptadores.md`: patrón adaptador, `JsonAdapter` y `ZoteroAdapter`.
  - `docs/guia/03-vista.md`: Vite, `mountView` y Playwright.
  - `docs/guia/04-plugin-zotero.md`: `addon/`, ciclo de vida, `.xpi` y perfil de desarrollo.
  - `docs/guia/05-calidad-y-guardarrailes.md`: ESLint, tsconfig, pruebas, env-guard y hook.
  - `docs/guia/06-agentes.md`: el equipo de subagentes y `/feature`.
  - `docs/glosario.md`: términos clave.
