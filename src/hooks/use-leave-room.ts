import useDialog from './use-dialog'
import type { Socket } from 'socket.io-client'

const useLeaveRoom = (socket: Socket, roomId: string) => {
  useDialog({
    class: 'bg-x-card',
    title: '离开',
    message: '你确定要离开房间吗？',
    persistent: true,
    dark: true,
    ok: '确定',
    cancel: '取消',
    color: 'primary'
  }).onOk(async () => {
    // 服务器 leave 回调中发送 bye，然后触发本地 leaved
    // 发送通知能够第一时间通知到对方我离开了，否则会有几秒钟延迟
    socket.emit('leave', roomId)
  })

  // 在对方离线的时候，我离开了，对方在线后应该先去服务器看我还在不在
}

export default useLeaveRoom
