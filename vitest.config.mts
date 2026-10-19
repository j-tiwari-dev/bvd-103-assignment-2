import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    includeSource: ['src/**/*.{js,ts}'],
    setupFiles: ['./database_test_setup.ts'],
  },
});
