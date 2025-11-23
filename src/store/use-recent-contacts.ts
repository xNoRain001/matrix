import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo } from '@/types'
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
