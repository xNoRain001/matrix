import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo } from '@/types'
import useUserStore from './use-user-store'
import { useInitLocalStorage } from '@/hooks'

type notifications = {
  _id: string
  content: string
  createdAt: number
  id: string
  type: 'contact' | 'feedback' | 'reporter' | 'reported'
  actionType: 'addContact' | 'agreeContact' | 'refuseContact' | 'deleteContact'
  profile: userInfo['profile']
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
