# Perfil de desarrollo de Zotero

Zotero se ejecuta siempre con un perfil y un data dir **dedicados**; nunca con la biblioteca real.

1. Copia `.env.example` a `.env` en la raíz y ajusta las rutas (`ZOTERO_BIN`, `ZOTERO_DEV_PROFILE`, `ZOTERO_DEV_DATA`).
2. Ejecuta `powershell -File fixtures/zotero-profile/setup.ps1`. Valida las rutas con `scripts/env-guard.ts` y crea las carpetas.
3. `npm run dev` compila el plugin y abre Zotero con ese perfil (`createProfileIfMissing` está activo en `zotero-plugin.config.ts`).
4. En Zotero: *Ajustes → Avanzado → Archivos y carpetas* debe mostrar el data dir de desarrollo, no `D:\Users\marco\Zotero`.

## Pendiente (Fase 2)

Poblar la biblioteca de desarrollo con el contenido de `fixtures/library.json` (ítems, colecciones, tags, anotaciones). Requiere confirmar en el código fuente de Zotero la API para crear ítems y anotaciones; hasta entonces la biblioteca de desarrollo se llena a mano o queda vacía.
