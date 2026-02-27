# Cheatsheet

A simple, system-themed cheatsheet site (mostly HTML) built from Nunchucks templates into `public/` and deployed to GitHub Pages.

## Structure

- `src/pages/` — page templates (`*.njk`)
- `src/layouts/` — shared layouts
- `src/includes/` — partials
- `src/content/cheats.json` — your cheat sections + code snippets
- `src/assets/` — CSS/JS copied to `public/assets/`
- `public/` — build output (what GitHub Pages serves)

## Local development

Requirements: Node.js 20+

```bash
npm install
npm run build
npm run dev
```

Open `http://localhost:4321`.

## Editing content

Add/update snippets in `src/content/cheats.json`.

Each snippet looks like:

```json
{ "title": "Example", "lang": "html", "code": "<h1>Hello</h1>\n" }
```

`lang` is used for syntax highlighting (`html`, `css`, `javascript`, `json`, ...).

## Syntax highlighting

- Static highlighting uses `highlight.js` (loaded via CDN).
- Ace Editor assets are included and can be enabled per-block later (see “Ace blocks”).

### Ace blocks (optional)

If you want editable code blocks, add an element with `data-ace`:

```html
<div data-ace data-lang="html" data-editable="true">&lt;h1&gt;Hello&lt;/h1&gt;</div>
```

By default, blocks are read-only unless `data-editable="true"`.

## Using the local `../nunjucks/` library (optional)

This repo depends on the published `@samuelbines/nunchucks` package. If you want to develop against your local checkout:

```bash
npm install ../nunjucks
```

## Bareframe (optional)

If you add the Bareframe repo alongside this project (or as a submodule), the simplest approach is to vendor its built output into `public/` yourself.

Recommended convention:

- Put Bareframe’s built JS at `public/vendor/bareframe/bareframe.min.js`
- Reference it from templates when you’re ready

## GitHub Pages

Deployment is configured in `.github/workflows/deploy-pages.yml` and publishes the `public/` folder on pushes to `main`.
