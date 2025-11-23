import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo } from '@/types'

const useRecentContactsStore = defineStore('recentContactsStore', () => {
  return {
    contactList: ref(null),
    contactProfileMap: ref<
      Record<
        string,
        {
          profile: userInfo['profile']
        }
      >
    >({}),
    pinId: ref(''), // 置顶对象的 id
    isSpaceOpen: ref(false),
    isChatOpen: ref(false),
    activeTargetId: ref(''),
    activeTargetNickname: ref(''),
    activeTargetIds: reactive(new Set()),
    activeSpaceTargetIds: reactive(new Set()),
    indexMap: ref({}),
    messageRecordMap: ref<Record<string, []>>({}),
    isReceivingOfflineMsgs: ref(true),
    hashToBlobURLMap: ref<Map<string, string>>(new Map()),
    lastMsgMap: ref<
      Record<
        string,
        {
          id: string
          profile: userInfo['profile']
          timestamp: number
          content: string
          sent: boolean
          unreadMsgs: number
          timeAgo: string
        }
      >
    >({}),
    lastMsgList: ref<string[]>([]),
    unreadMsgCounter: ref(0),
    isFirstGetContactsOnlineStatus: ref(true),
    isFirstGetChatsOnlineStatus: ref(true)
  }
})

export default useRecentContactsStore
