// Assemble the public site into dist/ for Cloudflare Pages (the site itself has no build step).
// Copies only what visitors need: the page, its scripts and styles, and assets without the
// provenance notes; adds _headers so Cloudflare caches the films and images.
import { cpSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

for (const f of ["index.html", "app.js", "styles.css", "showcase3d.js", "showcase-worker.js"]) cpSync(join(root, f), join(out, f));
cpSync(join(root, "assets"), join(out, "assets"), {
  recursive: true,
  filter: (src) => !src.endsWith(".json") && !src.endsWith("PROVENANCE.md"),
});

writeFileSync(join(out, "_headers"), `/assets/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800
`);

// Byte sizes of the film videos for functions/assets/film/[name].js, which answers Safari's range
// requests on Cloudflare Pages (the static file it gets there carries no Content-Length).
const film = join(root, "assets", "film"), sizes = {};
for (const n of readdirSync(film)) if (n.endsWith(".mp4")) sizes[n] = statSync(join(film, n)).size;
writeFileSync(join(root, "functions", "_film-sizes.json"), JSON.stringify(sizes, null, 2) + "\n");

let files = 0, bytes = 0;
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n), s = statSync(p); if (s.isDirectory()) walk(p); else { files++; bytes += s.size; } } };
walk(out);
console.log(`dist/: ${files} files, ${(bytes / 1e6).toFixed(1)} MB`);
