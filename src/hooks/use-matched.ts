import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'
import useSaveRoomInfo from './use-save-room-info'
import type { Router } from 'vue-router'

let timer = null
let timer2 = null

const useMatched = (
  data,
  socket: Socket,
  path: string,
  remoteRoomInfo: {
    path: string
    roomId: string
  },
  isMatch: Ref<boolean>,
  router: Router,
  pause: Ref<boolean>,
  matchType: 'chat' | 'audio-chat' | 'file-transfer'
) => {
  const { type, message } = data

  if (type === 'fail') {
    // 设置一个延时，否则用户刚点击匹配就立马出现匹配失败
    timer2 = setTimeout(() => {
      pause.value = true
      clearTimeout(timer2)
    }, 2000)
    timer = setTimeout(() => {
      pause.value = false
      socket.emit('match', matchType)
      clearTimeout(timer)
    }, 10000)
  } else if (type === 'suc') {
    // 可能出现匹配失败，等待再次匹配的过程中被别人给匹配到了
    clearTimeout(timer)
    remoteRoomInfo.roomId = message
    remoteRoomInfo.path = path
    // 记录房间号
    useSaveRoomInfo(path, message)
    router.replace({ query: { roomId: message } })
    isMatch.value = false
    // 不需要从匹配列表中移除，因为服务器在匹配成功时会自动将你从匹配列表中移除
    socket.emit('join', message)
  }
}

export default useMatched
