import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";

const srcDir = path.resolve("src");
const outDir = path.resolve("public");
const pagesDir = path.join(srcDir, "pages");

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function walkFiles(rootDir) {
  const out = [];
  const queue = [rootDir];

  while (queue.length) {
    const current = queue.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(fullPath);
      else if (entry.isFile()) out.push(fullPath);
    }
  }

  return out;
}

function toPosixPath(p) {
  return p.split(path.sep).join("/");
}

async function readJson(jsonPath) {
  const raw = await fs.readFile(jsonPath, "utf8");
  return JSON.parse(raw);
}

async function renderPages({ env, context }) {
  const all = await walkFiles(pagesDir);
  const pageTemplates = all.filter((f) => f.endsWith(".njk"));

  for (const pagePath of pageTemplates) {
    const rel = toPosixPath(path.relative(srcDir, pagePath));
    const outRel = rel
      .replace(/^pages\//, "")
      .replace(/\.njk$/, ".html");
    const outPath = path.join(outDir, outRel);

    await ensureDir(path.dirname(outPath));
    const html = env.render(rel, {
      ...context,
      page: { template: rel, out: outRel },
    });
    await fs.writeFile(outPath, html, "utf8");
  }
}

async function copyStatic() {
  const assetsSrc = path.join(srcDir, "assets");
  const assetsOut = path.join(outDir, "assets");
  await ensureDir(outDir);

  await fs.rm(assetsOut, { recursive: true, force: true });
  await fs.cp(assetsSrc, assetsOut, { recursive: true });
}

async function copyVendors() {
  const vendorOut = path.join(outDir, "vendor");
  await fs.rm(vendorOut, { recursive: true, force: true });
  await ensureDir(vendorOut);

  const aceRoot = path.dirname(
    fileURLToPath(new URL("../node_modules/ace-builds/package.json", import.meta.url)),
  );

  await ensureDir(path.join(vendorOut, "ace"));
  const aceFiles = [
    "ace.js",
    "ext-language_tools.js",
    "mode-html.js",
    "mode-javascript.js",
    "mode-typescript.js",
    "mode-css.js",
    "mode-json.js",
    "theme-github.js",
    "theme-github_dark.js",
  ];
  for (const file of aceFiles) {
    await fs.copyFile(
      path.join(aceRoot, "src-min-noconflict", file),
      path.join(vendorOut, "ace", file),
    );
  }

  const bareframeDist = path.resolve("bareframe", "dist");
  try {
    const stat = await fs.stat(bareframeDist);
    if (stat.isDirectory()) {
      await fs.cp(bareframeDist, path.join(vendorOut, "bareframe"), { recursive: true });
    }
  } catch {
    // bareframe is optional
  }
}

async function writeNoJekyll() {
  await fs.writeFile(path.join(outDir, ".nojekyll"), "", "utf8");
}

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await ensureDir(outDir);

  const [site, cheats] = await Promise.all([
    readJson(path.join(srcDir, "content", "site.json")),
    readJson(path.join(srcDir, "content", "cheats.json")),
  ]);

  const context = { site, cheats };
  const env = nunjucks.configure(srcDir, { autoescape: true, noCache: true });

  await Promise.all([copyStatic(), copyVendors(), writeNoJekyll()]);
  await renderPages({ env, context });
}

await main();
