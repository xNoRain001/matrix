import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { message } from '@/types'

const useMessagesStore = defineStore('messagesStore', () => ({
  messageRecordMap: ref<
    Record<
      string,
      {
        messages?: message[]
        scroller?: any
        newMessageCount?: number
      }
    >
  >({})
}))

export default useMessagesStore
