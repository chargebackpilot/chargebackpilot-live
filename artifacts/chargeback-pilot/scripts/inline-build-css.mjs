import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist", "public");
const indexPath = path.join(dist, "index.html");
const indexHtml = await fs.readFile(indexPath, "utf-8");
const stylesheetMatch = indexHtml.match(
  /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+\.css)">/i
);

if (!stylesheetMatch) {
  console.log("inline css: no build stylesheet link found");
  process.exit(0);
}

const stylesheetHref = stylesheetMatch[1];
const stylesheetPath = path.join(dist, stylesheetHref.replace(/^\//, ""));
const css = await fs.readFile(stylesheetPath, "utf-8");
const inlineStyle = `<style data-cbp-inline-css>${css.replace(/<\/style/gi, "<\\/style")}</style>`;

async function findHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(fullPath);
      return entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
    })
  );
  return files.flat();
}

let updated = 0;
for (const htmlPath of await findHtmlFiles(dist)) {
  const html = await fs.readFile(htmlPath, "utf-8");
  if (!html.includes(stylesheetHref)) continue;
  await fs.writeFile(
    htmlPath,
    html.replace(
      /<link\s+rel="stylesheet"\s+crossorigin\s+href="[^"]+\.css">\s*/i,
      `${inlineStyle}\n`
    )
  );
  updated += 1;
}

console.log(`inline css: inlined ${path.basename(stylesheetPath)} into ${updated} html files`);
