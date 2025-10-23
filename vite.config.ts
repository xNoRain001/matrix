import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import ui from '@nuxt/ui/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui(),
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
  },
  build: {
    rollupOptions: {
      external: id =>
        // 跳过 nsfwjs 模型的打包，已经自托管了模型，不需要再次打包
        id.startsWith('../models/mobilenet_v2') ||
        id.startsWith('../models/inception_v3')
    }
  }
})
