import { defineConfig } from "zotero-plugin-scaffold";

// El scaffold lee estas variables con su propio nombre (ver dist/shared/scaffold-src, ZoteroRunner).
// scripts/env-guard.ts ya validó que no apuntan a la biblioteca real.
process.env.ZOTERO_PLUGIN_ZOTERO_BIN_PATH ??= process.env.ZOTERO_BIN;
process.env.ZOTERO_PLUGIN_PROFILE_PATH ??= process.env.ZOTERO_DEV_PROFILE;
process.env.ZOTERO_PLUGIN_DATA_DIR ??= process.env.ZOTERO_DEV_DATA;

export default defineConfig({
  source: ["src/zotero", "addon"],
  dist: "build",
  name: "Zotero Library Graph",
  id: "zotero-library-graph@marcovillegaz",
  namespace: "zotero-library-graph",
  xpiName: "zotero-library-graph",
  build: {
    assets: ["addon/**/*.*"],
    esbuildOptions: [
      {
        entryPoints: ["src/zotero/index.ts"],
        define: { __env__: `"${process.env.NODE_ENV ?? "production"}"` },
        bundle: true,
        target: "firefox115",
        outfile: "build/addon/content/scripts/zotero-library-graph.js",
      },
    ],
  },
  server: { createProfileIfMissing: true },
});
