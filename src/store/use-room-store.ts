import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { otherInfo, remoteRoomInfo } from '@/types'

const useRoomStore = defineStore('roomStore', () => ({
  online: ref(false), // 对方是否在线
  otherInfo: ref<otherInfo>(null), // 对方的信息，建立 rtc 连接时互相交换
  remoteRoomInfo: ref<remoteRoomInfo>({
    path: '',
    roomId: '',
    latestId: '',
    inRoom: false
  }) // rtc 连接成功时保存的房间信息
}))

export default useRoomStore
