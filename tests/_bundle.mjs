import { build } from 'esbuild'
import { writeFileSync } from 'node:fs'
const r = await build({
  entryPoints: ['tests/smoke.js'],
  bundle: true, platform: 'node', format: 'esm', write: false,
  external: ['react', 'react-dom', 'react-dom/server'],
  loader: { '.js': 'jsx', '.jsx': 'jsx' }, jsx: 'automatic'
})
writeFileSync('tests/.smoke.bundle.mjs', r.outputFiles[0].text)
