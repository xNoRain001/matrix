import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useGetRoomId } from '@/hooks'

const useRoomStore = defineStore('counter', () => ({
  online: ref(false),
  remoteroomId: ref(useGetRoomId())
}))

export default useRoomStore
