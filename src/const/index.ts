export const pending = '等待中...'
export const sending = '传送中...'
export const sent = '传送完成...'
export const receiving = '接收中...'
export const received = '接收完成...'
const radius = localStorage.getItem('nuxt-ui-radius')
export const appConfig = {
  theme: {
    radius: radius ? Number(radius) : 0.25,
    blackAsPrimary:
      localStorage.getItem('nuxt-ui-black-as-primary') === 'true' ? true : false
  },
  ui: {
    colors: {
      primary: localStorage.getItem('nuxt-ui-primary') || 'green',
      neutral: localStorage.getItem('nuxt-ui-neutral') || 'slate'
    }
  }
}
