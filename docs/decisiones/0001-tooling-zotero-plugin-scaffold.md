# 0001 — Tooling con zotero-plugin-scaffold

## Contexto
Hace falta compilar, empaquetar el `.xpi` y recargar el plugin en Zotero durante el desarrollo. Las alternativas eran clonar `zotero-plugin-template`, o escribir esbuild y scripts propios.

## Decisión
Usar el paquete `zotero-plugin-scaffold` con una estructura de carpetas propia (`src/core`, `src/view`, `src/adapters`, `src/zotero`, `addon/`). La configuración vive en `zotero-plugin.config.ts` y la salida en `build/`.

## Consecuencias
- Poco código propio de build/serve; mantenido por la comunidad.
- El scaffold exige `repository.url` y `config.prefsPrefix` en `package.json`. La URL del repositorio es un valor provisional hasta que exista el remoto.
- Nuestras variables (`ZOTERO_BIN`, `ZOTERO_DEV_PROFILE`, `ZOTERO_DEV_DATA`) se mapean a las que lee el scaffold (`ZOTERO_PLUGIN_*`).
- El scaffold genera `manifest.json` desde su configuración; el de `addon/` es referencia hasta confirmarlo en Fase 2.
