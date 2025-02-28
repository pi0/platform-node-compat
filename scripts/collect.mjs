import { writeFile } from "node:fs/promises"
import { builtinModules } from "node:module"

console.log(`Collecting Node.js compat data from Node.js ${process.version}`)

const modules = {}
for (const id of [
  ...builtinModules,
  // https://nodejs.org/api/modules.html#built-in-modules-with-mandatory-node-prefix
  "sqlite"
]) {
  const mod = await import(`node:${id}`)
  const exports = Object.getOwnPropertyNames(mod).filter((name) => name !== "default").sort()

  const defaultExports = Object.getOwnPropertyNames(mod.default || {}).sort()
  const extraDefaultExports = defaultExports.filter((name) =>
    !['name', 'length', 'prototype'].includes(name) && !exports.includes(name)
  )

  modules[id] = { exports, extraDefaultExports: extraDefaultExports.length ? extraDefaultExports : undefined }
}

const globalKeys = Object.getOwnPropertyNames(globalThis).sort()
const processKeys = Object.getOwnPropertyNames(process).sort()

await writeFile(new URL("../src/_node-compat.mjs", import.meta.url), /* js */ `
// Auto generated with scripts/collect.mjs
export default ${JSON.stringify({
  version: process.version.slice(1),
  globals: {
    globalKeys,
    processKeys
  },
  modules,
}, null, 2)}`.trim())
