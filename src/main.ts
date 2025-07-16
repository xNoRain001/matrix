import { createApp } from 'vue'
import { Quasar, Notify, Loading } from 'quasar'
import ui from '@nuxt/ui/vue-plugin'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app
  .use(Quasar, { plugins: { Notify, Loading } })
  .use(ui)
  .use(router)
  .mount('#app')
