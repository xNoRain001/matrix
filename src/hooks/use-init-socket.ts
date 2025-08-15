import { io } from 'socket.io-client'
import type { Ref } from 'vue'

let firstConnectionSuccess = false
let reconnectionAttempts = 0
const maxReconnectionAttempts = 1

const useInitSocket = (
  onJoined: Function,
  onOtherJoin: Function,
  onDisconnect: Function,
  onRtc: Function,
  roomId: string,
  isFull: Ref<boolean>,
  showOfflineModal: Ref<boolean>,
  loading: Ref<boolean>,
  toast
) => {
  // @ts-ignore
  const socket = io.connect(import.meta.env.VITE_API_BASE_URL, {
    reconnectionAttempts: maxReconnectionAttempts
  })

  const onFull = (/** roomId, data */) => {
    isFull.value = true
    socket.disconnect()
  }

  // const onLeaved = async () => {}

  const onConnectError = () => {
    reconnectionAttempts++

    if (showOfflineModal.value) {
      // 模态框打开时，首次连接可能失败，失败后会再进行重试，
      // 因此 reconnectionAttempts 的最大值为 maxReconnectionAttempts + 1
      if (
        reconnectionAttempts ===
        (firstConnectionSuccess
          ? maxReconnectionAttempts
          : maxReconnectionAttempts + 1)
      ) {
        toast.add({
          title: '重连失败，请检查网络后重试',
          color: 'error',
          icon: 'lucide:annoyed'
        })
        // 在断网模态框中的重连失败，取消 loading 状态，让用户再次点击
        loading.value = false
        firstConnectionSuccess = false
        // 同时需要重置尝试次数
        reconnectionAttempts = 0
      }
    } else if (
      reconnectionAttempts ===
      (firstConnectionSuccess
        ? maxReconnectionAttempts
        : maxReconnectionAttempts + 1)
    ) {
      // 首次连接可能失败，如果失败，
      // reconnectionAttempts 的最大值为 maxReconnectionAttempts + 1
      // 如果成功连接后断开，重连时 reconnectionAttempts 的最大值为
      // maxReconnectionAttempts

      // 当模态框未打开时，重试次数满了就打开模态框
      showOfflineModal.value = true
      // 同时需要重置尝试次数
      reconnectionAttempts = 0
      firstConnectionSuccess = false
    }
  }

  socket.on('connect', () => {
    if (!firstConnectionSuccess) {
      firstConnectionSuccess = true
    }

    reconnectionAttempts = 0

    // 在模态框内成功连接
    if (showOfflineModal.value) {
      loading.value = false
      showOfflineModal.value = false
      toast.add({ title: '重连成功', color: 'success', icon: 'lucide:smile' })
    }

    socket.emit('join', roomId)
  })

  // 自己成功加入房间
  socket.on('joined', onJoined)
  // 其他人加入房间
  socket.on('otherjoin', onOtherJoin)
  // 自己想加入房间，但是房间满人了
  socket.on('full', onFull)
  // 自己离开房间
  // socket.on('leaved', onLeaved)
  // 连接成功后，断开连接，不会触发，只会在最开始建立连接失败时或者重连失败时触发
  socket.on('connect_error', onConnectError)
  // 连接断开
  socket.on('disconnect', onDisconnect)
  socket.on('rtc', onRtc)

  return socket
}

export default useInitSocket
