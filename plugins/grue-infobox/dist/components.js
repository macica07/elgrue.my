import { h } from "preact"
import fs from "node:fs"
import path from "node:path"
import { slugifyFilePath } from "@quartz-community/utils"

// Grue Infobox v0.2.0 — estilo inspirado en Omni Infobox (MIT).
// A diferencia del panel de Obsidian, esta es una representación estática para Quartz.
const boxCss = `
/* Fallback: si JS está desactivado, la ficha sigue siendo legible en beforeBody. */
.grue-infobox {
  box-sizing: border-box;
  display: block;
  width: min(320px, 100%);
  max-width: 100%;
  margin: .8rem 0 1.25rem auto;
  color: var(--darkgray);
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 14px;
  overflow: hidden;
  font-family: var(--bodyFont), system-ui, sans-serif;
  font-size: .87rem;
  line-height: 1.55;
  box-shadow: 0 4px 18px rgba(0, 0, 0, .075);
}

/* La navegación de Quartz inserta la ficha como primer hijo de <article>. */
.page .center > article > .grue-infobox {
  float: right;
  clear: right;
  width: min(320px, 44%);
  margin: 0 0 1.25rem 1.4rem;
}
/* Asegura que una infobox larga no se desborde debajo del artículo. */
.page .center > article:has(> .grue-infobox)::after {
  content: "";
  display: block;
  clear: both;
}

.grue-infobox .gi-title,
.grue-infobox .gi-subtitle,
.grue-infobox .gi-supertitle {
  text-align: center;
  border-bottom: 1px solid var(--lightgray);
}
.grue-infobox .gi-title {
  padding: .75rem .8rem;
  font-weight: 750;
  font-size: 1.5rem;
  line-height: 1.2;
  color: var(--dark);
}
.grue-infobox .gi-supertitle {
  padding: .55rem .7rem;
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--gray);
}
.grue-infobox .gi-subtitle {
  padding: .55rem .9rem;
  font-size: .9rem;
  font-style: italic;
  color: var(--gray);
}

/* Media + caption como Omni Infobox. */
.grue-infobox .gi-figure {
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 12px 8px;
  margin: 0;
  text-align: center !important;
  border-bottom: 1px solid var(--lightgray);
}

.grue-infobox .gi-media {
  display: block;
  width: 100%;
  overflow: hidden;
  border-radius: 14px;
  background: rgba(0, 0, 0, .12);
}

.grue-infobox .gi-media img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 440px;
  max-width: 100%;
  object-fit: contain;
  margin: 0 auto;
  border-radius: 0 !important;
}

.grue-infobox .gi-caption {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: .6rem .35rem 0;
  margin: 0 auto;
  text-align: center !important;
  font-size: .81rem;
  font-style: italic;
  color: var(--gray);
  line-height: 1.4;
}

.grue-infobox .gi-caption a,
.grue-infobox .gi-caption .internal {
  display: inline !important;
  text-align: center !important;
}

.grue-infobox .gi-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  padding: .7rem .8rem;
  border-bottom: 1px solid var(--lightgray);
}
.grue-infobox .gi-tag {
  display: inline-block;
  max-width: 100%;
  border-radius: 999px;
  padding: .13rem .55rem;
  font-size: .76rem;
  font-weight: 650;
  overflow-wrap: anywhere;
  color: var(--secondary);
  background: color-mix(in srgb, var(--secondary) 13%, var(--light));
}

.grue-infobox .gi-section {
  border-top: 1px solid var(--lightgray);
  padding: .52rem .75rem;
  font-size: .72rem;
  font-weight: 650;
  letter-spacing: .09em;
  text-transform: uppercase;
  text-align: center;
  background: var(--lightgray);
  color: var(--darkgray);
}
.grue-infobox .gi-row {
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: .7rem;
  padding: .6rem .8rem;
  border-top: 1px solid var(--lightgray);
  font-size: .82rem;
  line-height: 1.5;
}
.grue-infobox .gi-key {
  flex: 0 1 auto;
  min-width: 0;
  font-weight: 650;
  color: var(--darkgray);
  overflow-wrap: anywhere;
}
.grue-infobox .gi-value {
  flex: 1 1 auto;
  min-width: 0;
  text-align: right;
  color: var(--darkgray);
  overflow-wrap: anywhere;
}
.grue-infobox .gi-value ul {
  display: inline-block;
  margin: .05rem 0;
  padding-left: 1.1rem;
  text-align: left;
}
.grue-infobox a {
  color: var(--secondary);
}

@media (max-width: 950px) {
  .page .center > article > .grue-infobox {
    float: none;
    width: min(380px, 100%);
    margin: .4rem auto 1.25rem;
  }
}
@media (max-width: 450px) {
  .grue-infobox { width: 100%; font-size: .85rem; }
  .page .center > article > .grue-infobox { width: 100%; }
}

/* Force image spacing inside the infobox */
.grue-infobox .gi-figure .gi-media {
  display: block !important;
  box-sizing: border-box !important;
  width: calc(100% - 24px) !important;
  max-width: none !important;
  margin: 12px auto 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border-radius: 12px !important;
}

.grue-infobox .gi-figure .gi-media img {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  border-radius: 0 !important;
}

.grue-infobox .gi-figure .gi-caption {
  display: block !important;
  width: 100% !important;
  text-align: center !important;
  padding: 8px 12px !important;
  box-sizing: border-box !important;
}

article .grue-divider {
  display: flow-root !important;
  clear: none !important;
  box-sizing: border-box;

  width: auto !important;
  max-width: none;
  height: 0;
  margin: 1.35rem 14px;
  padding: 0;

  border: 0;
  border-top: 2px solid var(--lightgray);
  opacity: 0.75;
}

`

// IMPORTANT: in Quartz 5 "beforeBody" is inside .page-header, not inside the
// <article>. A float placed there CANNOT wrap the article text. Quartz fires a
// "nav" event on the first load and after SPA navigation; relocate the
// server-rendered card into the article on each event.
const afterDOMLoaded = `
function mountGrueInfobox() {
  const card = document.querySelector('.grue-infobox');
  const article = document.querySelector('.center > article');
  if (!card || !article) return;
  if (card.parentElement !== article) article.insertBefore(card, article.firstChild);
}
document.addEventListener('nav', mountGrueInfobox);
document.addEventListener('render', mountGrueInfobox);
(function initGrueAmbientPointer() {
  if (window.__grueAmbientPointerInstalled) return;
  window.__grueAmbientPointerInstalled = true;

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  let lastX = 0;
  let lastY = 0;
  let scheduled = false;

  function resetPointer() {
    root.style.setProperty('--grue-shift-x', '0px');
    root.style.setProperty('--grue-shift-y', '0px');
  }

  function paint() {
    scheduled = false;
    root.style.setProperty('--grue-shift-x', lastX.toFixed(1) + 'px');
    root.style.setProperty('--grue-shift-y', lastY.toFixed(1) + 'px');
  }

  window.addEventListener('pointermove', function(event) {
    if (reduced.matches || !finePointer.matches) return;
    // Range limited to +/-16px for a barely noticeable parallax.
    lastX = ((event.clientX / window.innerWidth) - 0.5) * 32;
    lastY = ((event.clientY / window.innerHeight) - 0.5) * 32;
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(paint);
    }
  }, { passive: true });

  window.addEventListener('blur', resetPointer);
  reduced.addEventListener('change', resetPointer);
  finePointer.addEventListener('change', resetPointer);
})();

`

const txt = (v) => (v === null || v === undefined ? "" : String(v))
const isRecord = (v) => !!v && typeof v === "object" && !Array.isArray(v)
const strField = (v) => Array.isArray(v) ? v.map(txt).join(", ") : txt(v)

const assetPaths = new Map()
let scanned = false
function scanImages(dir, relative = "") {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".obsidian", "private", "templates"].includes(entry.name)) continue
    const rel = relative ? `${relative}/${entry.name}` : entry.name
    if (entry.isDirectory()) scanImages(path.join(dir, entry.name), rel)
    else if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(entry.name)) {
      const name = entry.name.toLowerCase()
      if (!assetPaths.has(name)) assetPaths.set(name, rel)
      assetPaths.set(rel.toLowerCase(), rel)
    }
  }
}
function getAssetMap() {
  if (!scanned) {
    scanned = true
    scanImages(path.join(process.cwd(), "content"))
  }
  return assetPaths
}
function imageUrl(value, slug) {
  const raw = strField(value).trim().replace(/^!?\[\[(.+?)\]\]$/, "$1")
  if (/^https:\/\//i.test(raw)) return raw
  if (/^(?:javascript|data|file|http):/i.test(raw) || raw.startsWith("/")) return null
  const filename = raw.split("|")[0].replace(/\\/g, "/").trim()
  if (!filename || filename.includes("..")) return null
  const asset = getAssetMap().get(filename.toLowerCase()) ||
    getAssetMap().get(path.posix.basename(filename).toLowerCase())
  if (!asset) return null
  const target = String(slugifyFilePath(asset))
  const from = path.posix.dirname(String(slug || "index"))
  const relative = path.posix.relative(from === "." ? "" : from, target)
  return (relative.startsWith(".") ? "" : "./") +
    relative.split("/").map(encodeURIComponent).join("/")
}

function resolveNote(target, currentSlug, allFiles) {
  const normalized = txt(target).replace(/\.md$/i, "").trim().toLowerCase()
  const matches = (allFiles || []).filter((f) => {
    const slug = txt(f.slug).toLowerCase()
    return slug === normalized || slug.endsWith("/" + normalized) ||
      txt(f.frontmatter?.title).toLowerCase() === normalized
  })
  if (!matches.length) return null
  const currentDir = path.posix.dirname(txt(currentSlug || "index"))
  const rel = path.posix.relative(currentDir === "." ? "" : currentDir, txt(matches[0].slug))
  return (rel.startsWith(".") ? "" : "./") + rel.split("/").map(encodeURIComponent).join("/")
}
// Wikilinks are rendered as text if the destination cannot be resolved.
// All values go through Preact's escaping; no raw HTML injection.
function inlineLinks(value, slug, allFiles) {
  const raw = strField(value)
  const matcher = /\[\[([^\]]+)\]\]/g
  const nodes = []
  let position = 0
  let match
  while ((match = matcher.exec(raw)) !== null) {
    if (match.index > position) nodes.push(raw.slice(position, match.index))
    const [target, alias] = match[1].split("|")
    const href = resolveNote(target, slug, allFiles)
    nodes.push(href
      ? h("a", { href, class: "internal" }, alias || target)
      : (alias || target))
    position = matcher.lastIndex
  }
  if (position < raw.length) nodes.push(raw.slice(position))
  return nodes.length ? nodes : raw
}
function renderValue(v, slug, allFiles) {
  if (Array.isArray(v)) return h("ul", null, v.map((item, i) =>
    h("li", { key: i }, inlineLinks(item, slug, allFiles))))
  // Display multiline strings as a list when all nonblank lines are bullets.
  const raw = txt(v)
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean)
  if (lines.length > 1 && lines.every((line) => line.startsWith("- ") || line.startsWith("* "))) {
    return h("ul", null, lines.map((line, i) =>
      h("li", { key: i }, inlineLinks(line.slice(2), slug, allFiles))))
  }
  return inlineLinks(raw, slug, allFiles)
}

export const GrueInfobox = () => {
  const Component = ({ fileData, allFiles }) => {
    const box = fileData?.frontmatter?.infobox
    if (!isRecord(box)) return null
    const slug = fileData?.slug || "index"
    const imgs = Array.isArray(box.images) && box.images.length
      ? box.images : box.image ? [{ image: box.image, caption: box.caption }] : []
    const tags = Array.isArray(box.tags)
      ? box.tags
      : typeof box.tags === "string" ? box.tags.split(/[ ,]+/).filter(Boolean) : []
    return h("aside", {
      class: "grue-infobox",
      "aria-label": `Infobox: ${txt(box.title || fileData?.frontmatter?.title)}`,
    }, [
      box.supertitle && h("div", { class: "gi-supertitle" }, inlineLinks(box.supertitle, slug, allFiles)),
      h("div", { class: "gi-title" }, inlineLinks(box.title || fileData?.frontmatter?.title || "Information", slug, allFiles)),
      box.subtitle && h("div", { class: "gi-subtitle" }, inlineLinks(box.subtitle, slug, allFiles)),
      ...imgs.map((im, i) => {
        const spec = isRecord(im) ? im : { image: im }
        const src = imageUrl(spec.image, slug)
        return src ? h("figure", { class: "gi-figure", key: i }, [
  h("div", { class: "gi-media" }, [
    h("img", {
      src,
      alt: txt(spec.label || box.title || "Infobox image"),
      loading: "lazy"
    }),
  ]),
  spec.caption && h("figcaption", { class: "gi-caption" }, inlineLinks(spec.caption, slug, allFiles)),
]) : null
      }),
      box.showTags !== false && tags.length > 0 &&
        h("div", { class: "gi-tags" }, tags.map((tag, i) =>
          h("span", { class: "gi-tag", key: i }, "#" + txt(tag).replace(/^#/, "")))),
      ...(Array.isArray(box.fields) ? box.fields.flatMap((row, i) => {
        if (!isRecord(row)) return []
        return Object.entries(row).map(([key, val], j) =>
          key.toLowerCase() === "section"
            ? h("div", { class: "gi-section", key: `section-${i}-${j}` }, inlineLinks(val, slug, allFiles))
            : h("div", { class: "gi-row", key: `row-${i}-${j}` }, [
              h("div", { class: "gi-key" }, inlineLinks(key, slug, allFiles)),
              h("div", { class: "gi-value" }, renderValue(val, slug, allFiles)),
            ]))
      }) : []),
    ])
  }
  Component.displayName = "GrueInfobox"
  Component.css = boxCss
  Component.afterDOMLoaded = afterDOMLoaded
  return Component
}
