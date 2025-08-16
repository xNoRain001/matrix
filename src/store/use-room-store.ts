import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { otherInfo, remoteRoomInfo } from '@/types'

const useRoomStore = defineStore('roomStore', () => ({
  online: ref(false), // 对方是否在线
  otherInfo: ref<otherInfo>(null), // 对方的信息，建立 rtc 连接时互相交换
  firstRequestRemoteRoomInfo: ref(true), // 跳过查询房间信息请求
  isMatch: ref(false),
  getOnlineWhenReconnection: ref(false),
  remoteRoomInfo: ref<remoteRoomInfo>({
    path: '', // 服务器数据
    roomId: '', // 服务器数据
    latestId: '', // 服务器数据，有值，说明我没有离开
    inRoom: true, // 本地数据，为 true，说明我和对方都没有离开
    // 对方离开时，如果我在线，onBye 中会清空房间信息，导致头部显示的是
    // 对方未加入房间...，而不是对方已退出房间，onBye 中修改这个变量值为 true，
    // 从而显示对方已退出房间，当我点击底部按钮时，再修改为 false，否则进入新的房间
    // 时会显示对方已退出房间,而不是对方未加入房间...
    showExitRoomTip: false
  }) // rtc 连接成功时保存的房间信息
}))

export default useRoomStore
