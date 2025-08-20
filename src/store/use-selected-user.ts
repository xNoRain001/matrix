import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Socket } from 'socket.io-client'

const useSelectedUserStore = defineStore('selectedUserStore', () => ({
  globalSocket: ref<Socket | null>(null),
  online: ref(false) // 对方是否在线
}))

export default useSelectedUserStore
