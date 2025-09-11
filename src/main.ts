import ui from '@nuxt/ui/vue-plugin'
import VirtualScroller from 'vue-virtual-scroller'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { appConfig } from './const'
import { initTheme } from './hooks/use-update-theme'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)
const pinia = createPinia()

// 默认 dark 模式
!localStorage.getItem('vueuse-color-scheme') &&
  localStorage.setItem('vueuse-color-scheme', 'dark')

app.use(ui).use(router).use(pinia).use(VirtualScroller).mount('#app')

initTheme(appConfig)
