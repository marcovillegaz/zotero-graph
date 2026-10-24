// PreToolUse: bloquea cualquier herramienta cuyo input mencione la biblioteca real de Zotero.
let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.stringify(JSON.parse(raw || "{}").tool_input ?? {})
  .replace(/\\/g, "/")
  .toLowerCase();

const blocked = [
  "d:/users/marco/zotero",
  "appdata/roaming/zotero",
  "appdata/local/zotero",
  "~/zotero",
  "%userprofile%/zotero",
  "$env:userprofile/zotero",
];
const hit = blocked.find((b) => input.includes(b));
if (hit) {
  console.error(`Bloqueado: la biblioteca real de Zotero está fuera de alcance (${hit}). Usa el perfil de desarrollo.`);
  process.exit(2);
}
