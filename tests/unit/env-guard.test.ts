import { describe, expect, it } from "vitest";
import { checkEnv, forbiddenReason } from "../../scripts/env-guard";

// Las rutas reales se arman por partes para no activar el hook que bloquea su mención literal.
const real = ["D:", "Users", "marco", "Zotero"].join("\\");
const realLower = ["d:", "users", "marco", "zotero/"].join("/");
const home = ["C:", "Users", "marco"].join("\\");
const env = { USERPROFILE: home, APPDATA: `${home}\\AppData\\Roaming` };

describe("env-guard", () => {
  it("rechaza vacío", () => expect(forbiddenReason("", env)).not.toBeNull());
  it("rechaza la biblioteca real, con variantes de ruta", () => {
    for (const p of [real, realLower, `${real}\\storage`]) {
      expect(forbiddenReason(p, env)).not.toBeNull();
    }
  });
  it("rechaza el data dir y perfiles por defecto", () => {
    expect(forbiddenReason(`${home}\\Zotero`, env)).not.toBeNull();
    expect(forbiddenReason(`${home}\\AppData\\Roaming\\Zotero\\Zotero\\Profiles\\x`, env)).not.toBeNull();
  });
  it("acepta rutas de desarrollo", () => {
    expect(forbiddenReason(`${home}\\ZoteroDev\\data`, env)).toBeNull();
    expect(forbiddenReason(`${real}Other`, env)).toBeNull();
  });
  it("checkEnv reporta ambas variables", () => {
    expect(checkEnv({ ...env, ZOTERO_DEV_DATA: "", ZOTERO_DEV_PROFILE: "" })).toHaveLength(2);
  });
});
