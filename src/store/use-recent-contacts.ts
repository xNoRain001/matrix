import { ref } from 'vue'
import { defineStore } from 'pinia'

const useRecentContactsStore = defineStore('recentContactsStore', () => ({
  lastMsgInfo: ref({ sent: false, value: '', timestamp: 0 }),
  messageList: ref([]),
  lastMsgMap: ref({}),
  lastMsgList: ref([])
}))

export default useRecentContactsStore
