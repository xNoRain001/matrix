import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo, message } from '@/types'
import useUserStore from './use-user-store'
import { useInitLocalStorate } from '@/hooks'

const useRecentContactsStore = defineStore('recentContactsStore', () => {
  const id = useUserStore().userInfo?.id || ''
  const _contactList = useInitLocalStorate(`contactList-${id}`, [])
  const _contactProfileMap = useInitLocalStorate(`contactProfileMap-${id}`, {})

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
    activeTargetIds: reactive(new Set()),
    activeTargetId: ref(''),
    activeTargetProfile: ref<userInfo['profile']>(null),
    indexMap: ref({}),
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
    unreadMsgCounter: ref(0)
  }
})

export default useRecentContactsStore
