import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { lastMsgMap } from '@/types'
import useUserStore from './use-user-store'

const useRecentContactsStore = defineStore('recentContactsStore', () => {
  let _contactList = []
  let _contactNotifications = []
  let _contactProfileMap = {}
  const id = useUserStore().userInfo?.id || ''

  try {
    _contactList = JSON.parse(localStorage.getItem(`contactList-${id}`) || '[]')
  } catch {}

  try {
    _contactNotifications = JSON.parse(
      localStorage.getItem(`contactNotifications-${id}`) || '[]'
    )
  } catch {}

  try {
    _contactProfileMap = JSON.parse(
      localStorage.getItem(`contactProfileMap-${id}`) || '{}'
    )
  } catch {}

  return {
    contactNotifications: ref<
      {
        content: string
        createdAt: number
        id: string
        type: string
        profile: {
          nickname: string
        }
      }[]
    >(_contactNotifications), // 好友申请通知
    contactList: ref(_contactList),
    contactProfileMap: ref(_contactProfileMap),
    msgContainerRef: ref<HTMLElement | null>(null), // 聊天记录容器
    targetId: ref(''), // 当前聊天对象或者联系人的 id
    pinId: ref(''), // 置顶对象的 id
    skipUnshiftMessageRecord: ref(false),
    indexMap: ref({}),
    messageList: ref([]),
    lastFetchedId: ref(Infinity),
    hashToBlobURLMap: ref<Map<string, string>>(new Map()),
    lastMsgMap: ref<lastMsgMap>({}),
    lastMsgList: ref<string[]>([]),
    unreadMsgCounter: ref(0)
  }
})

export default useRecentContactsStore
