import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { quasar } from '@quasar/vite-plugin'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), ui(), quasar(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
