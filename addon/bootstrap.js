/* global Services */
var chromeHandle;

function install() {}

async function startup({ rootURI }) {
  Services.scriptloader.loadSubScript(rootURI + "content/scripts/zotero-library-graph.js", { Zotero });
  Zotero.debug("[graph] bootstrap startup");
}

function shutdown() {
  Zotero.debug("[graph] bootstrap shutdown");
  chromeHandle = null;
}

function uninstall() {}
