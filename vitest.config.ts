import { defineConfig } from 'vitest/config'

export default defineConfig({
  optimizeDeps: {
    exclude: ['vue-demi'],
  },
  test: {
    environment: 'happy-dom',
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/**/*.spec.ts',
        'src/index.ts',
        'src/__mocks__',
        'src/isIE.ts',
      ],
    },
  },
})
