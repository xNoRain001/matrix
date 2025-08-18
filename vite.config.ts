import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import uiPro from '@nuxt/ui-pro/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    uiPro(),
    tailwindcss(),
    visualizer({
      open: false, // 自动打开分析页面
      filename: './rollup-visualizer/index.html', // 输出文件名
      gzipSize: true, // 显示 gzip 压缩大小
      brotliSize: true // 显示 brotli 压缩大小
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
