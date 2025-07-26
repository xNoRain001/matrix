import { createApp } from 'vue'
import { Quasar, Notify, Loading, Dialog } from 'quasar'
import ui from '@nuxt/ui/vue-plugin'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

pinia.use(({ store }) => {
  const initialState = JSON.parse(JSON.stringify(store.$state))
  store.$reset = () => {
    store.$state = JSON.parse(JSON.stringify(initialState))
  }
})

app
  .use(Quasar, { plugins: { Notify, Loading, Dialog } })
  .use(ui)
  .use(router)
  .use(pinia)
  .mount('#app')
