import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("public");

await fs.rm(outDir, { recursive: true, force: true });
