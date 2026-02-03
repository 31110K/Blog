import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Generates dist/stats.html for bundle analysis
    visualizer({ filename: 'dist/stats.html' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jodit') || id.includes('jodit-react')) return 'vendor.editor'
            if (id.includes('react')) return 'vendor.react'
            if (id.includes('lodash')) return 'vendor.lodash'
            return 'vendor'
          }
        }
      }
    }
  }
})
