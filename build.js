import { build } from 'esbuild';

build({
  entryPoints: ['./src/scopie.js'],
  bundle: true,
  minify: true,
  platform: 'node',
  outfile: 'dist/scopie.node.min.cjs',
  sourcemap: false,
  target: 'es2020',
})

build({
  entryPoints: ['./src/scopie.js'],
  bundle: true,
  minify: false,
  platform: 'node',
  outfile: 'dist/scopie.node.js',
  target: 'es2020',
})

build({
  entryPoints: ['./src/scopie.js'],
  bundle: true,
  minify: true,
  platform: 'node',
  outfile: 'dist/scopie.node.min.js',
  target: 'es2020',
})

build({
  entryPoints: ['./src/scopie.js'],
  bundle: false,
  minify: false,
  outfile: 'dist/scopie.browser.js',
  sourcemap: true,
})

build({
  entryPoints: ['./src/scopie.js'],
  bundle: false,
  minify: true,
  outfile: 'dist/scopie.browser.min.js',
  sourcemap: true,
})
