function initHighlight() {
  if (!globalThis.hljs) return;
  globalThis.hljs.highlightAll();
}

function detectScheme() {
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function initAceEditors() {
  const nodes = Array.from(document.querySelectorAll("[data-ace]"));
  if (!nodes.length) return;

  await loadScript("./vendor/ace/ace.js");
  await loadScript("./vendor/ace/ext-language_tools.js");
  await loadScript("./vendor/ace/mode-html.js");
  await loadScript("./vendor/ace/mode-javascript.js");
  await loadScript("./vendor/ace/mode-typescript.js");
  await loadScript("./vendor/ace/mode-css.js");
  await loadScript("./vendor/ace/mode-json.js");
  await loadScript("./vendor/ace/theme-github.js");
  await loadScript("./vendor/ace/theme-github_dark.js");

  const theme = detectScheme() === "dark" ? "ace/theme/github_dark" : "ace/theme/github";

  for (const el of nodes) {
    const lang = el.getAttribute("data-lang") || "text";
    const mode = {
      html: "ace/mode/html",
      css: "ace/mode/css",
      javascript: "ace/mode/javascript",
      js: "ace/mode/javascript",
      typescript: "ace/mode/typescript",
      ts: "ace/mode/typescript",
      json: "ace/mode/json",
    }[lang] || "ace/mode/text";

    const editor = globalThis.ace.edit(el, {
      mode,
      theme,
      readOnly: el.getAttribute("data-editable") !== "true",
      showPrintMargin: false,
      highlightActiveLine: false,
      highlightGutterLine: false,
      useWorker: false,
    });

    editor.setOptions({
      fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
      fontSize: 13,
      tabSize: 2,
      wrap: true,
    });
  }
}

initHighlight();
initAceEditors();
