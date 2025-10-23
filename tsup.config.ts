import { exec } from 'child_process';
import { defineConfig } from 'tsup';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: 'lib',
  external: ['eslint'],
  async onSuccess() {
    await execAsync('tsc-alias -p tsconfig.json');
  },
});
