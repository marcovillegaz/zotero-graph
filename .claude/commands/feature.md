---
description: Guía el flujo estándar de una feature con los cinco subagentes
argument-hint: <tema de la feature>
---

Implementa la feature: **$ARGUMENTS**

Sigue el flujo estándar de `CLAUDE.md` (sección 6). Orquesta y consolida; delega cada paso en el subagente indicado:

1. **Plan.** Entra en modo plan y define el plan. Si la tarea es grande, valídalo con Marco antes de seguir.
2. **cartographer** → mapa de impacto: archivos y módulos afectados.
3. **tester** → escribe las pruebas que definen "listo" (deben fallar al inicio).
4. **developer** → implementa hasta que pasen y `npm run check` esté verde.
5. **qa** → prueba la vista y reporta. Los bugs vuelven al paso 3.
6. **cartographer** → regenera el grafo (`/graphify . --update`) y verifica las reglas de capas.
7. **writer** → actualiza bitácora, comandos, arquitectura, ADR (si aplica) y changelog.

Reglas que no se negocian: no tocar la biblioteca real, `src/view/` no conoce a Zotero, sin escrituras en la biblioteca hasta la Fase 4, nada termina con `npm run check` en rojo. Si la tarea cambia el contrato de datos o la arquitectura, propón un ADR y consulta a Marco.

Al terminar, resume qué se hizo, qué quedó pendiente y el estado de la definición de listo (sección 9).
