# Aoktac demo site

Static sales demo for Taizhou Aoktac Machinery (TEC BLOW stretch blow molding machines).
Plain HTML, CSS and ES modules, no build step. Three.js and Lenis load from CDNs.

Run locally: `python -m http.server 5174` in this folder, then open http://localhost:5174.
Deploy: any static host. On Vercel, import the repo with the "Other" preset and no build command.

Films and the 3D bottle are visualizations generated from Aoktac's own photos; the machine photos are Aoktac's own. See assets/film/PROVENANCE.md.

## Hosting

- Vercel: pushes to `main` deploy automatically.
- GitHub Pages: pushes to `main` publish automatically.
- Cloudflare Pages (https://aoktac-website.pages.dev): `node scripts/build-dist.mjs` then `npx wrangler pages deploy dist --project-name aoktac-website --branch main`.
