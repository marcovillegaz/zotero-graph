# Fixtures

`library.json` es una biblioteca **sintética y determinista** (47 ítems, 6 colecciones, 8 tags) que cumple el contrato `LibraryData` de `src/core/types.ts`. No se edita a mano: se regenera con `npm run fixture` (`generate.ts`, PRNG con semilla fija; dos corridas producen el mismo archivo).

## Casos borde (sección 5 de CLAUDE.md)

Las keys dependen de la semilla; si cambia el generador, vuelve a calcular esta tabla (la cubre `tests/unit/fixture.test.ts`).

| Caso | Ítems |
|---|---|
| Duplicados (mismo título) | `SSULGGGV`, `CMV6AAW8` |
| Sin año | `8TFNKWT7` |
| Sin autores | `ZUWSARKU` |
| Sin tags | `KMN5LHHH` |
| PDF suelto (`attachment`, sin colección) | `KHC6BNEZ` |
| Varias colecciones | `JEPXWBKP` |
| 0 anotaciones | `ZWLM9QCU`, `KMN5LHHH`, `N74SWHLH` |
| 100+ anotaciones | `GQJXZLPE` |
| Colecciones anidadas a 3 niveles | Métodos → Aprendizaje → Redes neuronales (ids 1 → 2 → 3) |
| Tags con variantes | `machine learning` (`ML`, `Machine Learning`, …), `neural network` (plurales/mayúsculas) |

## Perfil de desarrollo de Zotero

Ver `zotero-profile/README.md`. El poblamiento automático de la biblioteca de desarrollo a partir de `library.json` está pendiente (Fase 2).
