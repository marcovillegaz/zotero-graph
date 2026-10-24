# Comandos

## Proyecto (npm)

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Valida el entorno (`env-guard`), compila y lanza Zotero con el perfil de desarrollo |
| `npm run dev:view` | Sirve la vista standalone en `http://localhost:5173` con `fixtures/library.json` |
| `npm run build` | Genera `build/zotero-library-graph.xpi` |
| `npm run lint` / `npm run typecheck` | ESLint; `tsc --noEmit` sobre `tsconfig.json` y `tsconfig.zotero.json` |
| `npm run test:unit` | Vitest (`tests/unit/`) |
| `npm run test:view` | Playwright contra `dev:view` (requiere `npx playwright install chromium` una vez) |
| `npm run test:zotero` | Valida el entorno; las pruebas dentro de Zotero llegan en la Fase 2 |
| `npm run check` | `lint` + `typecheck` + `test:unit` (gate obligatorio) |
| `npm run fixture` | Regenera `fixtures/library.json` (determinista) |

Pendiente: `npm run fixture` aún no repuebla el perfil de desarrollo de Zotero (Fase 2).

## Zotero para desarrollo

- Variables en `.env` (ver `.env.example`): `ZOTERO_BIN`, `ZOTERO_DEV_PROFILE`, `ZOTERO_DEV_DATA`. `scripts/env-guard.ts` aborta si apuntan a la biblioteca real.
- El scaffold lee `ZOTERO_PLUGIN_ZOTERO_BIN_PATH`, `ZOTERO_PLUGIN_PROFILE_PATH` y `ZOTERO_PLUGIN_DATA_DIR`; `zotero-plugin.config.ts` las rellena desde las variables de arriba.
- Crear carpetas del perfil: `powershell -File fixtures/zotero-profile/setup.ps1`.
- Depuración: *Herramientas → Desarrollador → Run JavaScript* y Browser Toolbox. Logs con `Zotero.debug('[graph] ...')`.

## Claude Code

- Agentes (`.claude/agents/`): `developer`, `tester`, `qa`, `writer`, `cartographer`. Se invocan por nombre o los delega el agente principal.
- `/feature <tema>`: guía el flujo estándar de siete pasos.
- `/graphify . --update`: actualiza el grafo en `graphify-out/`.
- Guardarraíles: `.claude/settings.json` niega acceso a la biblioteca real y el hook `.claude/hooks/block-real-library.mjs` bloquea cualquier herramienta cuyo input mencione su ruta.
- QA usa el servidor MCP de Playwright definido en `.mcp.json`.
