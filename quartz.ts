
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { slugifyFilePath } from "./quartz/util/path"
import type { FilePath } from "./quartz/util/path"
import fs from "node:fs"
import path from "node:path"
import { componentRegistry } from "./quartz/components/registry"

// Search for Excalidraw files inside the Quartz content folder.
function findDrawing(root: string, requested: string): string | null {
  const target = requested
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
    .toLowerCase()

  const matches: string[] = []

  function walk(folder: string) {
    for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
      if (item.name.startsWith(".")) continue

      const full = path.join(folder, item.name)

      if (item.isDirectory()) {
        walk(full)
      } else if (item.isFile() && /\.excalidraw\.md$/i.test(item.name)) {
        matches.push(
          path.relative(root, full).replace(/\\/g, "/")
        )
      }
    }
  }

  walk(root)

  // Match the full path first, then a unique filename.
  const exact = matches.find((file) =>
    file.replace(/\.md$/i, "").toLowerCase() === target
  )

  if (exact) return exact

  const filename = target.split("/").pop()
  const candidates = matches.filter((file) =>
    file.split("/").pop()?.replace(/\.md$/i, "").toLowerCase() === filename
  )

  if (candidates.length === 1) return candidates[0]

  if (candidates.length > 1) {
    console.warn(`Ambiguous Excalidraw embed: ${requested}`)
  }

  return null
}


/* Grue Mind — Hidden Explorer folders */

componentRegistry.setOptionOverrides("@quartz-community/explorer", {
  filterFn: (node: { slugSegment?: string }) => {
    const hidden = ["excalidraw", "tags"]

    return !hidden.includes(
      (node.slugSegment ?? "").toLowerCase()
    )
  },
})


const config = await loadQuartzConfig()

// Run before Obsidian's normal embed processing.
config.plugins.transformers.unshift({
  name: "GrueExcalidrawEmbeds",

  textTransform(ctx, src) {
    const contentRoot = path.resolve(ctx.argv.directory)

    return src.replace(
      /^[ \t]*!\[\[([^\]|\n]+?\.excalidraw(?:\.md)?)(?:\|(\d{1,4})(?:x(\d{1,4}))?)?\]\][ \t]*$/gm,
      (original, file: string, widthText?: string, heightText?: string) => {
        const drawing = findDrawing(contentRoot, file.trim())
        if (!drawing) return original

        const slug = slugifyFilePath(drawing as FilePath)
        const width = widthText ? Number(widthText) : null
        const height = heightText
          ? Number(heightText)
          : width
            ? Math.max(260, Math.round(width * 0.6))
            : 480

        if ((width !== null && width <= 0) || height <= 0) return original

        const drawingUrl = "/" + slug
        const maxWidth = width ? `max-width:${width}px;` : ""

        return `
<div class="grue-excalidraw" style="${maxWidth}height:${height}px;">
  <iframe
    class="grue-excalidraw-frame"
    data-drawing="${drawingUrl}"
    title="Interactive Excalidraw Diagram"
    loading="lazy"
  ></iframe>
</div>`
      },
    )
  },

  externalResources() {
    return {
      js: [{
        contentType: "inline",
        loadTime: "afterDOMReady",
        script: `
          function setupGrueExcalidraw() {
            if (window.self !== window.top) {
              document.documentElement.classList.add("grue-embedded-page");
            }

            const prefix = location.hostname.endsWith("github.io")
              ? "/elgrue.my"
              : "";

            document.querySelectorAll(
              "iframe.grue-excalidraw-frame[data-drawing]"
            ).forEach((frame) => {
              const target = prefix + frame.dataset.drawing;
              if (frame.getAttribute("src") !== target) {
                frame.setAttribute("src", target);
              }
            });
          }

          setupGrueExcalidraw();
          document.addEventListener("nav", setupGrueExcalidraw);
        `,
      }],
    }
  },
})

export default config
export const layout = await loadQuartzLayout()