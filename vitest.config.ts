import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // @ts-expect-error rolldown-vite plugin types incompatible with vitest's bundled vite
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/lib/**/*.test.ts'],
  },
})
