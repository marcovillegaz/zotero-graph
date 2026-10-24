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
