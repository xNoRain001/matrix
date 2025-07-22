import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'
import useNotify from './use-notify'
import useSaveRoomInfo from './use-save-room-info'
import type { Router } from 'vue-router'

let timer = null

const useMatched = (
  data,
  socket: Socket,
  path: string,
  remoteRoomInfo: {
    path: string
    roomId: string
  },
  isMatch: Ref<boolean>,
  router: Router
) => {
  const { type, message } = data

  if (type === 'fail') {
    useNotify(message, 'negative')
    timer = setTimeout(() => {
      socket.emit('match')
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
