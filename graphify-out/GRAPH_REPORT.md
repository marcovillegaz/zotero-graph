# Graph Report - zotero-graph  (2026-10-24)

## Corpus Check
- Corpus is ~8,486 words - fits in a single context window. You may not need a graph.

## Summary
- 197 nodes · 261 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Docs y agentes
- Config y tooling
- Adaptadores
- Generador de fixture
- Env guard y tests
- Dependencias dev
- tsconfig
- Scripts npm
- Manifest del addon
- tsconfig Zotero
- Hook biblioteca real
- MCP Playwright
- Tipos i10n

## God Nodes (most connected - your core abstractions)
1. `scripts` - 11 edges
2. `compilerOptions` - 11 edges
3. `LibraryAdapter` - 10 edges
4. `CLAUDE.md project instructions` - 10 edges
5. `LibraryData` - 8 edges
6. `writer agent` - 8 edges
7. `JsonAdapter` - 7 edges
8. `Standard feature flow (7 steps)` - 7 edges
9. `Arquitectura doc` - 7 edges
10. `developer agent` - 6 edges

## Surprising Connections (you probably didn't know these)
- `writer agent` --references--> `ADR 0001 zotero-plugin-scaffold tooling`  [INFERRED]
  .claude/agents/writer.md → docs/decisiones/0001-tooling-zotero-plugin-scaffold.md
- `view index.html` --conceptually_related_to--> `Three-layer architecture (core, view, adapters, shell)`  [INFERRED]
  src/view/index.html → CLAUDE.md
- `Bitacora` --references--> `Roadmap phases 0-5`  [INFERRED]
  docs/bitacora.md → CLAUDE.md
- `cartographer agent` --references--> `graphify knowledge graph`  [EXTRACTED]
  .claude/agents/cartographer.md → CLAUDE.md
- `tester agent` --references--> `Fixture edge cases`  [EXTRACTED]
  .claude/agents/tester.md → fixtures/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Five-subagent team with separated responsibilities** — claude_agents_cartographer, claude_agents_developer, claude_agents_qa, claude_agents_tester, claude_agents_writer [EXTRACTED 1.00]
- **Three-level real library guardrails** — docs_decisiones_0002_guardarrailes_biblioteca_real_env_guard, docs_decisiones_0002_guardarrailes_biblioteca_real_block_hook, claude_hard_rules [EXTRACTED 1.00]

## Communities (16 total, 4 thin omitted)

### Community 0 - "Docs y agentes"
Cohesion: 0.12
Nodes (33): CHANGELOG, CLAUDE.md project instructions, cartographer agent, developer agent, qa agent, tester agent, writer agent, /feature command (+25 more)

### Community 1 - "Config y tooling"
Cohesion: 0.08
Nodes (23): zoteroGlobal, config, prefsPrefix, engines, node, name, private, repository (+15 more)

### Community 2 - "Adaptadores"
Cohesion: 0.14
Nodes (7): JsonAdapter, ZoteroAdapter, LibraryAdapter, LibraryData, assertLibraryData(), mountView(), data

### Community 3 - "Generador de fixture"
Cohesion: 0.11
Nodes (18): add(), authors, collections, data, items, makeKey(), pick(), rand() (+10 more)

### Community 4 - "Env guard y tests"
Cohesion: 0.18
Nodes (9): vitest, checkEnv(), forbiddenReason(), isInside(), norm(), env, home, real (+1 more)

### Community 5 - "Dependencias dev"
Cohesion: 0.14
Nodes (14): devDependencies, dotenv, eslint, @eslint/js, @playwright/test, prettier, tsx, @types/node (+6 more)

### Community 6 - "tsconfig"
Cohesion: 0.14
Nodes (13): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck (+5 more)

### Community 7 - "Scripts npm"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:view, fixture, lint, test:unit (+3 more)

### Community 8 - "Manifest del addon"
Cohesion: 0.22
Nodes (8): applications, zotero, description, manifest_version, name, version, id, strict_min_version

### Community 9 - "tsconfig Zotero"
Cohesion: 0.29
Nodes (6): ./tsconfig.json, compilerOptions, types, exclude, extends, include

### Community 11 - "Hook biblioteca real"
Cohesion: 0.50
Nodes (3): blocked, hit, input

### Community 12 - "MCP Playwright"
Cohesion: 0.50
Nodes (3): npx, playwright, @playwright/mcp

## Knowledge Gaps
- **12 isolated node(s):** `npx`, `@playwright/mcp`, `@types/node`, `dotenv`, `eslint` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 108 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Env guard y tests` to `Config y tooling`, `Adaptadores`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **What connects `npx`, `@playwright/mcp`, `@types/node` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Docs y agentes` be split into smaller, more focused modules?**
  _Cohesion score 0.11932773109243698 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dependencias dev` to `Config y tooling`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Config y tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Scripts npm` to `Config y tooling`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `Adaptadores` be split into smaller, more focused modules?**
  _Cohesion score 0.14333333333333334 - nodes in this community are weakly interconnected._