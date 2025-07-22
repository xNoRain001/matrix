import { io } from 'socket.io-client'
import useNotify from './use-notify'
import type { Ref } from 'vue'

const useInitSocket = (
  onJoined: Function,
  onOtherJoin: Function,
  onDisconnect: Function,
  onRtc: Function,
  isReconnect: Ref<boolean>,
  roomId: string,
  isFull: Ref<boolean>
) => {
  // @ts-ignore
  const socket = io.connect(import.meta.env.VITE_API_BASE_URL, {
    reconnectionAttempts: 5
  })

  const onFull = (/** roomId, data */) => {
    useNotify('房间已经满员了')
    isFull.value = true
    socket.disconnect()
  }

  const onLeaved = () => {
    socket.disconnect()
  }

  // 不断开 socket 连接，30 s 内没人进入再返回主页
  // 可以不对别人进行离开通知，因为在 oniceconnectionstatechange 中会通知
  // const onBye = () => {}

  const onConnectError = () => {
    useNotify('连接服务器失败...', 'negative')
  }

  socket.on('connect', () => {
    if (isReconnect.value) {
      socket.emit('join', roomId)
    }
  })

  // 自己成功加入房间
  socket.on('joined', onJoined)
  // 其他人加入房间
  socket.on('otherjoin', onOtherJoin)
  // 自己想加入房间，但是房间满人了
  socket.on('full', onFull)
  // 自己离开房间
  socket.on('leaved', onLeaved)
  // 连接失败
  socket.on('connect_error', onConnectError)
  // 连接断开
  socket.on('disconnect', onDisconnect)
  socket.on('rtc', onRtc)

  return socket
}

export default useInitSocket
