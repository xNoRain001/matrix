import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Web RTC',
  head: [['link', { rel: 'icon', href: '/images/logo.svg' }]],
  sitemap: {
    hostname: 'https://chat-7n0.pages.dev/',
    transformItems: items => {
      items.forEach(item => {
        item.changefreq = 'weekly'
        item.priority = 1.0
      })
      return items
    }
  }
  // locales: {
  //   root: {
  //     label: 'English',
  //     lang: 'en',
  //     link: '/en'
  //   },
  //   zh: {
  //     label: '简体中文',
  //     lang: 'zh-Hans',
  //     link: '/zh'
  //   }
  // }
})
