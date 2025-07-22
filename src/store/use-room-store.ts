import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useGetRoomInfo } from '@/hooks'

const useRoomStore = defineStore('roomStore', () => ({
  online: ref(false),
  remoteRoomInfo: reactive(useGetRoomInfo())
}))

export default useRoomStore
