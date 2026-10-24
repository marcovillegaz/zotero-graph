# 0002 — Guardarraíles para la biblioteca real

## Contexto
La regla dura 1 prohíbe tocar la biblioteca real y el perfil por defecto de Zotero. Una instrucción en un prompt no basta: un script o un agente puede equivocarse de ruta.

## Decisión
Aplicar la regla en tres niveles:
1. `scripts/env-guard.ts` aborta `dev`, `test:zotero` y la preparación del perfil si `ZOTERO_DEV_DATA` o `ZOTERO_DEV_PROFILE` están vacíos o apuntan a la biblioteca real, al data dir por defecto o a los perfiles de `%APPDATA%`.
2. `.claude/settings.json` niega Read/Edit/Write sobre esas rutas.
3. El hook `PreToolUse` `.claude/hooks/block-real-library.mjs` rechaza cualquier herramienta cuyo input mencione la ruta real.

## Consecuencias
- Un literal con la ruta real en el input de una herramienta queda bloqueado, también en código legítimo; las pruebas arman la ruta por partes.
- El hook compara texto, no resuelve rutas: no detecta enlaces simbólicos ni rutas construidas dinámicamente. El guard de entorno es la defensa para esos casos.
