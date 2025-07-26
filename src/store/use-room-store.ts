import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { otherInfo } from '@/types'

const useRoomStore = defineStore('roomStore', () => ({
  online: ref(false),
  otherInfo: ref<otherInfo>(null)
}))

export default useRoomStore
