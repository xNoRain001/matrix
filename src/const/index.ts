export const pending = '等待中...'
export const sending = '传送中...'
export const sent = '传送完成...'
export const receiving = '接收中...'
export const received = '接收完成...'
export const voiceChatInviteToastPendingTime = 15000 // 发起方持续 15 s
export const voiceChatInviteToastExpireTime = 13000 // 接收方持续 13 s

export const minute = 60 * 1000
export const fiveMinutes = 5 * minute
export const tenMinutes = 10 * minute
export const haldAnHour = 1000 * 60 * 30
export const hour = 60 * minute
export const day = 24 * hour
export const week = 7 * day

export const mbtiItems = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ'
]

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
export const primaryColors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
]
export const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone']
export const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
