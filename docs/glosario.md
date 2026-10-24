# Glosario

Términos del proyecto en orden alfabético. Se amplía junto con las guías de `docs/guia/`.

**Adapter (adaptador).** Clase que traduce una fuente de datos concreta a la interfaz común `LibraryAdapter`. Ver [guía 02](guia/02-adaptadores.md).

**ADR (Architecture Decision Record).** Documento corto en `docs/decisiones/` con contexto, decisión y consecuencias de una elección importante.

**async / await / Promise.** Mecanismo de JavaScript para operaciones que tardan. Una `Promise` es un valor que llegará después; `await` espera ese valor sin congelar el programa.

**Aserción de tipo (`as`).** Le dice al compilador "trata este valor como tal tipo". No comprueba nada al ejecutar.

**Bootstrap (`bootstrap.js`).** Archivo del plugin con las funciones `install`, `startup`, `shutdown`, `uninstall` que Zotero llama en el ciclo de vida. Ver [guía 04](guia/04-plugin-zotero.md).

**Bundler.** Herramienta que junta muchos archivos fuente en uno (o pocos) listos para ejecutar. Aquí, esbuild lo hace dentro del scaffold.

**Capa.** Grupo de código con una responsabilidad y reglas de qué puede importar: core, adapters, view, shell.

**Data dir.** Carpeta donde Zotero guarda la base de datos de la biblioteca y los archivos. El proyecto usa uno dedicado de desarrollo.

**Determinista.** Que da siempre el mismo resultado con la misma entrada.

**Fixture.** Datos de prueba fijos. Aquí `fixtures/library.json`, biblioteca sintética de 47 ítems.

**Función pura.** Función cuyo resultado depende solo de sus argumentos y que no tiene efectos secundarios. Ver [guía 01](guia/01-core.md).

**Gate.** Comprobación obligatoria antes de dar algo por listo. Aquí, `npm run check`.

**Hook.** Programa que Claude Code ejecuta automáticamente en un evento. El del proyecto bloquea herramientas que mencionen la biblioteca real.

**Inyección de dependencias.** Pasar a una función lo que necesita (por ejemplo el adaptador) en vez de que lo cree ella.

**Integridad referencial.** Todo identificador que se usa (por ejemplo `tagIds`) corresponde a un elemento que existe.

**Interface (TypeScript).** Descripción de la forma de un objeto o de los métodos de un contrato.

**Lint / ESLint.** Análisis estático del código en busca de errores y de violaciones de reglas. Aquí también impone las reglas de capas.

**Mulberry32 / PRNG.** Generador de números pseudoaleatorios determinista que depende de una semilla.

**Perfil de Zotero.** Carpeta con preferencias y plugins de una instalación de Zotero. El desarrollo usa uno propio.

**Playwright.** Herramienta que controla un navegador real para probar la vista como lo haría un usuario.

**Scaffold (`zotero-plugin-scaffold`).** Paquete que compila, empaqueta el `.xpi` y lanza Zotero con recarga en caliente. Ver ADR 0001.

**Slash command.** Instrucción guardada que se invoca con `/nombre` en Claude Code, como `/feature`.

**Strict mode (modo estricto).** Opción de TypeScript (`"strict": true`) que activa las comprobaciones de tipos más rigurosas.

**Stub.** Implementación vacía que cumple la forma de un contrato pero aún no hace el trabajo (`ZoteroAdapter` hoy).

**Subagente.** Asistente de Claude Code con rol y herramientas propios, definido en `.claude/agents/`. Ver [guía 06](guia/06-agentes.md).

**Tipo unión.** Tipo que admite varios valores posibles, como `number | null`.

**Typecheck.** Verificación de tipos con `tsc --noEmit`, sin generar archivos.

**`unknown`.** Tipo de TypeScript para un valor cuyo tipo no se conoce y debe verificarse antes de usarse.

**Vite.** Servidor de desarrollo y empaquetador para la vista standalone. Ver [guía 03](guia/03-vista.md).

**Vitest.** Ejecutor de pruebas unitarias (equivalente a pytest).

**`.xpi`.** Paquete de un plugin: un `.zip` con otra extensión. Se genera con `npm run build`.

**Zotero.debug.** Función de Zotero que escribe en su log de depuración. El proyecto usa siempre el prefijo `[graph]`.
