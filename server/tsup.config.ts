import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  clean: true,
  // @casino/shared is TypeScript source, which plain `node` cannot load —
  // inline it into the bundle. Everything else (express, ...) stays external.
  noExternal: ['@casino/shared'],
})
