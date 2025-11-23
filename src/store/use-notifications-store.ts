import { ref } from 'vue'
import { defineStore } from 'pinia'
import useUserStore from './use-user-store'
import { useInitLocalStorage } from '@/hooks'

type notifications = {
  _id: string
  targetId: string
  targetProfile: { nickname: string }
  type: 'follow' | 'feedback' | 'reporter' | 'reported'
  content: string
  createdAt: number
}[]

const useNotificationsStore = defineStore('notificationsStore', () => {
  const id = useUserStore().userInfo?.id || ''

  return {
    contactNotifications: ref<notifications>(
      useInitLocalStorage(`contactNotifications-${id}`, [])
    ),
    homeNotifications: ref<notifications>(
      useInitLocalStorage(`homeNotifications-${id}`, [])
    ),
    likeNotifications: ref<notifications>(
      useInitLocalStorage(`likeNotifications-${id}`, [])
    ),
    unreadContactNotificationCount: ref(
      Number(useInitLocalStorage(`unreadContactNotificationCount-${id}`, 0))
    ),
    unreadHomeNotificationCount: ref(
      Number(useInitLocalStorage(`unreadHomeNotificationCount-${id}`, 0))
    )
  }
})

export default useNotificationsStore
