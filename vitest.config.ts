import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment:       'jsdom',
    globals:           true,
    pool:              'vmForks',    // most stable on Windows — no worker thread issues
    isolate:           false,        // skip per-file isolation (speeds up, avoids startup timeout)
    fileParallelism:   false,        // run files sequentially — safe for localStorage tests
    setupFiles:        ['./tests/unit/setup.ts'],
    include:           ['tests/unit/**/*.test.ts'],
    testTimeout:       30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include:  ['src/utils/**', 'src/store/**', 'src/data/**'],
    },
  },
});
