# 06 — Los agentes: un equipo de cinco

Claude Code permite definir **subagentes**: asistentes con un rol, herramientas limitadas y sus propias instrucciones, cada uno en un archivo de `.claude/agents/`. El agente principal (con quien hablas) actúa como jefe de proyecto: descompone la tarea, delega y consolida.

Analogía: un pequeño laboratorio. Hay quien diseña el experimento, quien lo ejecuta, quien lo audita y quien lleva el cuaderno de laboratorio. Nadie hace el trabajo de otro, y eso evita que quien escribe el código también decida que "está bien". La analogía deja de valer en que los agentes no recuerdan conversaciones previas: todo lo que necesitan debe estar en `CLAUDE.md`, en los archivos y en lo que se les entrega.

## Quién hace qué

| Agente | Rol | Es dueño de | Herramientas clave | No hace |
|---|---|---|---|---|
| developer | Implementa features y correcciones | `src/`, `addon/` | Edición, Bash, PowerShell | Editar `docs/`; dejar el `check` en rojo |
| tester | Escribe pruebas y mantiene fixtures | `tests/`, `fixtures/` | Edición, Bash, PowerShell | Cambiar `src/` (salvo puntos de prueba acordados) |
| qa | Usa la vista como usuario y reporta | `docs/qa/` | Playwright MCP, lectura | Corregir código |
| writer | Documentación viva | `docs/`, `README.md`, `CHANGELOG.md` | Lectura y edición, sin ejecución | Modificar código |
| cartographer | Grafo de conocimiento del proyecto | `graphify-out/` | Lectura, Bash (graphify), Skill | Editar `src/` o `graphify-out/` a mano |

Las definiciones están en `.claude/agents/developer.md`, `tester.md`, `qa.md`, `writer.md` y `cartographer.md`. Cada archivo tiene un encabezado con `name`, `description` (que el agente principal usa para decidir a quién delegar) y `tools` (lista de herramientas permitidas). Que `writer` no tenga Bash es deliberado: no puede ejecutar ni alterar nada, solo documentar.

## Por qué separar responsabilidades

- **Revisión cruzada**: el tester escribe las pruebas antes de que el developer implemente. Así las pruebas definen "listo" y no se ajustan después al código que ya existe.
- **QA independiente**: quien reporta no corrige, por lo que no minimiza sus propios hallazgos.
- **Contexto acotado**: cada agente lee solo lo que necesita.
- **Seguridad**: las herramientas de cada rol son las mínimas.

## El flujo `/feature`

Un **slash command** es una instrucción guardada que se invoca con `/nombre`. `.claude/commands/feature.md` define `/feature <tema>`. Orquesta siete pasos (`feature.md:10-16`):

1. **Plan**: el agente principal entra en modo plan; si es grande, lo valida contigo.
2. **cartographer**: mapa de impacto (qué archivos y módulos toca).
3. **tester**: pruebas que fallan al inicio.
4. **developer**: implementa hasta que pasen y `npm run check` esté verde.
5. **qa**: prueba la vista; los bugs vuelven al paso 3 (primero como prueba que falla).
6. **cartographer**: regenera el grafo y verifica reglas de capas.
7. **writer**: bitácora, comandos, arquitectura, ADR si aplica, changelog y estas guías.

```
plan -> cartographer -> tester -> developer -> qa -> cartographer -> writer
                          ^                    |
                          +---- bugs ----------+
```

Al terminar, el agente principal resume qué se hizo, qué quedó pendiente y el estado de la "definición de listo" (`CLAUDE.md`, sección 9).

## Cuándo invocar a cada uno directamente

- **cartographer**: "¿qué módulos usan `assertLibraryData`?", "¿qué rompe si cambio `Item`?", o antes de empezar cualquier feature.
- **tester**: "falta cubrir X", "convierte este bug en una prueba", cambiar el fixture.
- **developer**: cuando ya hay pruebas que fallan o un informe de QA con bug reproducido.
- **qa**: tras terminar una feature de vista, o en hitos para revisar el plugin en el perfil de desarrollo.
- **writer**: después de cualquier cambio relevante; también para pedir una explicación nueva o actualizar una guía.

Ejemplo de petición: `/feature mostrar el grafo de ítems y colecciones` (el tema real lo defines tú).

## Reglas compartidas

Todos leen `CLAUDE.md` y respetan las reglas duras: no tocar la biblioteca real, la vista no conoce a Zotero, nada termina con `check` en rojo, sin escrituras hasta la Fase 4, no inventar APIs de Zotero. El hook de la [guía 05](05-calidad-y-guardarrailes.md) se aplica a todos ellos.

Los cambios de contrato de datos, arquitectura o escrituras requieren un ADR y tu aprobación.

## Graphify

El cartographer usa **graphify** (`/graphify . --update`) para generar `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`, `graph.html`). Estado: el primer grafo ya existe en `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`, `manifest.json`). Se generó con `--no-viz`, así que todavía no hay `graph.html`; para obtenerlo corre `/graphify . --update` sin esa opción. Léelo empezando por `GRAPH_REPORT.md`.

## Pruébalo tú

1. Abre `.claude/agents/writer.md` y localiza `tools:` (línea 4). Esperado: `Read, Edit, Write, Glob, Grep`, sin Bash. Compáralo con `tester.md`.
2. Abre `.claude/commands/feature.md` y cuenta los pasos numerados. Esperado: 7, igual que en `CLAUDE.md` sección 6.
3. En Claude Code, escribe `/feature` con un tema pequeño de prueba solo cuando quieras ejecutar el flujo real; para solo mirar qué hace, lee el archivo. No hay nada que ejecutar sin riesgo en este paso: la lectura basta.
