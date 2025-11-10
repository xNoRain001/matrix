import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo, message } from '@/types'
import useUserStore from './use-user-store'
import { useInitLocalStorage } from '@/hooks'

const useRecentContactsStore = defineStore('recentContactsStore', () => {
  const id = useUserStore().userInfo?.id || ''
  const _contactList = useInitLocalStorage(`contactList-${id}`, [])
  const _contactProfileMap = useInitLocalStorage(`contactProfileMap-${id}`, {})

  return {
    contactList: ref(_contactList),
    contactProfileMap: ref<
      Record<
        string,
        {
          createdAt: number
          id: string
          remark: string
          status: 'normal'
          online?: boolean
          profile: userInfo['profile']
        }
      >
    >(_contactProfileMap),
    msgContainerRef: ref<HTMLElement | null>(null), // 聊天记录容器
    pinId: ref(''), // 置顶对象的 id
    skipUnshiftMessageRecord: ref(false),
    isSpaceOpen: ref(false),
    isChatOpen: ref(false),
    activeTargetId: ref(''),
    activeTargetProfile: ref<userInfo['profile']>(null),
    activeTargetIds: reactive(new Set()),
    activeSpaceTargetIds: reactive(new Set()),
    indexMap: ref({}),
    messageRecordMap: ref<Record<string, []>>({}),
    messageList: ref([]),
    isReceivingOfflineMsgs: ref(true),
    lastFetchedId: ref(Infinity),
    hashToBlobURLMap: ref<Map<string, string>>(new Map()),
    messageListMap: ref<{ [x: string]: message[] }>({}),
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
          online?: boolean
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
