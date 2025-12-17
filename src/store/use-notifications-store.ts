import { ref } from 'vue'
import { defineStore } from 'pinia'
import useUserStore from './use-user-store'
import { useInitLocalStorage } from '@/hooks'

const useNotificationsStore = defineStore('notificationsStore', () => {
  const id = useUserStore().userInfo?.id || ''

  return {
    unreadPlaygroundNotificationCount: ref<{
      like: number
      comment: number
    }>(
      useInitLocalStorage(`unreadPlaygroundNotificationCount-${id}`, {
        like: 0,
        comment: 0
      })
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
