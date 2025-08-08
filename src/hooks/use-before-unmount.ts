import type { Socket } from 'socket.io-client'

const useBeforeUnmount = (socket: Socket | null) =>
  // chrome 导航后退时 socket 连接并不会断开（edge 会断开），只有刷新页面时
  // socket 才会断开，所以页面销毁时手动断开连接从而避免自己和自己在同一个房间
  socket && socket.disconnect()

export default useBeforeUnmount
