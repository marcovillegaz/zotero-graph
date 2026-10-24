import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/view",
  use: { baseURL: "http://localhost:5173" },
  webServer: { command: "npm run dev:view", url: "http://localhost:5173", reuseExistingServer: true },
});
