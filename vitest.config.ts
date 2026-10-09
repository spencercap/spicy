import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Solid ships separate server and browser builds; the adapter tests need the browser one.
  resolve: { conditions: ['browser', 'development'] },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'happy-dom',
    server: { deps: { inline: [/solid-js/] } },
  },
});
