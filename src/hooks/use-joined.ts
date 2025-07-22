import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'

const useJoined = async (
  socket: Socket,
  polite: Ref<boolean>,
  joined: Ref<boolean>,
  roomId: string,
  initPC: Function,
  _polite: boolean
) => {
  polite.value = _polite
  joined.value = true

  // 如果你是后面加入的，在这里初始化 pc
  if (!polite.value) {
    await initPC()
    // 初始化完成后通知对方发起连接
    socket.emit('otherjoin', roomId)
  }
}

export default useJoined
