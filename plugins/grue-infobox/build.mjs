import { mkdir, copyFile } from "node:fs/promises"
await mkdir(new URL("./dist/", import.meta.url), { recursive: true })
await Promise.all([
  copyFile(new URL("./index.js", import.meta.url), new URL("./dist/index.js", import.meta.url)),
  copyFile(new URL("./components.js", import.meta.url), new URL("./dist/components.js", import.meta.url)),
])
console.log("Grue Infobox v0.2.0: dist files ready")
