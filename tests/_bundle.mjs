/* Bundlea el smoke test con esbuild: tiene JSX y TypeScript, que node no ejecuta directo. */
import { build } from 'esbuild'
import { writeFileSync } from 'node:fs'

const r = await build({
  entryPoints: ['tests/smoke.tsx'],
  bundle: true, platform: 'node', format: 'esm', write: false,
  external: ['react', 'react-dom', 'react-dom/server'],
  loader: { '.ts': 'ts', '.tsx': 'tsx' },
  jsx: 'automatic',
  target: 'node20'
})
writeFileSync('tests/.smoke.bundle.mjs', r.outputFiles[0].text)
