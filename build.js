import { build } from 'esbuild';

build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  minify: true,
  platform: 'node',
  outfile: 'dist/scopie.min.cjs',
  sourcemap: false,
  target: 'es2020',
})

build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  minify: false,
  platform: 'node',
  outfile: 'dist/scopie.js',
  target: 'es2020',
})

