import ui from '@nuxt/ui/vue-plugin'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { appConfig } from './const'
import { useUpdateTheme } from './hooks'

const app = createApp(App)
const pinia = createPinia()

!localStorage.getItem('vueuse-color-scheme') &&
  localStorage.setItem('vueuse-color-scheme', 'dark')

app
  .use(ui, {
    notifications: {
      position: 'top-center'
    }
  })
  .use(router)
  .use(pinia)
  .mount('#app')

const {
  ui: {
    colors: { neutral, primary }
  },
  theme: { radius, blackAsPrimary }
} = appConfig
useUpdateTheme('blackAsPrimary', blackAsPrimary)
useUpdateTheme('radius', radius)
useUpdateTheme('primary', primary)
useUpdateTheme('neutral', neutral)
