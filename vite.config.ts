import { defineConfig } from "vite";

// Vista standalone: sirve src/view y la carpeta fixtures como estática.
export default defineConfig({
  root: "src/view",
  publicDir: "../../fixtures",
  server: { port: 5173, strictPort: true },
});
