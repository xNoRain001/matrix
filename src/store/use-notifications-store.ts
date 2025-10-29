import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo } from '@/types'
import useUserStore from './use-user-store'
import { useInitLocalStorate } from '@/hooks'

type notifications = {
  _id: string
  content: string
  createdAt: number
  id: string
  type: 'contact' | 'feedback'
  actionType: 'addContact' | 'agreeContact' | 'refuseContact' | 'deleteContact'
  profile: userInfo['profile']
}[]

const useNotificationsStore = defineStore('notificationsStore', () => {
  const id = useUserStore().userInfo?.id || ''

  return {
    contactNotifications: ref<notifications>(
      useInitLocalStorate(`contactNotifications-${id}`, [])
    ),
    homeNotifications: ref<notifications>(
      useInitLocalStorate(`homeNotifications-${id}`, [])
    )
  }
})

export default useNotificationsStore
