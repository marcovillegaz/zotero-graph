# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added
- Esqueleto de tres capas (`core`, `view`, `adapters`, `zotero`) y contrato de datos `LibraryData`.
- `JsonAdapter`, `assertLibraryData` y stub de `ZoteroAdapter`.
- Fixture sintético determinista (`fixtures/library.json`) con los casos borde de la sección 5 de `CLAUDE.md`.
- Tooling sobre `zotero-plugin-scaffold`: build del `.xpi`, vista standalone con Vite, Vitest y Playwright.
- Guardarraíles contra la biblioteca real: `scripts/env-guard.ts`, hook y permisos de Claude Code, reglas de capas en ESLint.
- Cinco subagentes (`developer`, `tester`, `qa`, `writer`, `cartographer`) y el comando `/feature`.
