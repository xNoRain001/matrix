import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { lastMsgMap } from '@/types'

const useRecentContactsStore = defineStore('recentContactsStore', () => {
  let _contactList = []
  let _contactProfileMap = {}

  try {
    _contactList = JSON.parse(localStorage.getItem('contactList') || '[]')
    _contactProfileMap = JSON.parse(
      localStorage.getItem('contactProfileMap') || '{}'
    )
  } catch {}

  return {
    contactList: ref(_contactList),
    contactProfileMap: ref(_contactProfileMap),
    msgContainerRef: ref<HTMLElement | null>(null), // 聊天记录容器
    targetId: ref(''), // 当前聊天界面中的对象
    messageList: ref([]),
    lastMsgMap: ref<lastMsgMap>({}),
    lastMsgList: ref<string[]>([]),
    unreadMsgCounter: ref(0)
  }
})

export default useRecentContactsStore
