import path from "node:path";
import { pathToFileURL } from "node:url";

const REAL_DATA_DIR = "D:\\Users\\marco\\Zotero";

const norm = (p: string): string =>
  path.win32.normalize(p.trim().replace(/\//g, "\\")).replace(/\\+$/, "").toLowerCase();

const isInside = (child: string, parent: string): boolean =>
  child === parent || child.startsWith(parent + "\\");

/** Devuelve el motivo del rechazo, o null si la ruta es segura para desarrollo. */
export function forbiddenReason(
  value: string | undefined,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  if (!value || !value.trim()) return "vacía";
  const p = norm(value);
  const forbidden = [
    REAL_DATA_DIR,
    env.USERPROFILE ? path.win32.join(env.USERPROFILE, "Zotero") : "",
    env.APPDATA ? path.win32.join(env.APPDATA, "Zotero") : "",
  ].filter(Boolean);
  for (const f of forbidden) {
    if (isInside(p, norm(f))) return `apunta a la biblioteca/perfil real (${f})`;
  }
  return null;
}

export function checkEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  const errors: string[] = [];
  for (const key of ["ZOTERO_DEV_DATA", "ZOTERO_DEV_PROFILE"]) {
    const reason = forbiddenReason(env[key], env);
    if (reason) errors.push(`${key}: ${reason}`);
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await import("dotenv/config");
  const errors = checkEnv();
  if (errors.length) {
    console.error("[env-guard] ABORTADO:\n  " + errors.join("\n  "));
    process.exit(1);
  }
}
