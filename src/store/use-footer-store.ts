import { defineStore } from 'pinia'
import { ref } from 'vue'

const useFooterStore = defineStore('footerStore', () => ({
  footerNavs: ref([
    {
      label: '大厅',
      icon: 'lucide:house',
      value: '/'
    },
    {
      label: '广场',
      icon: 'lucide:rose',
      value: '/playground'
    },
    {
      label: '好友',
      icon: 'lucide:users-round',
      value: '/contacts'
    },
    {
      label: '消息',
      icon: 'lucide:message-circle',
      value: '/messages'
    },
    {
      label: '我的',
      icon: 'lucide:user-round-cog',
      value: '/profile'
    }
  ])
}))

export default useFooterStore
