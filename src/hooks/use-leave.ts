import type { Socket } from 'socket.io-client'

const useLeave = async (
  remoteRoomInfo,
  socket: Socket,
  online: boolean,
  leaveAfterConnected: Function,
  simpleLeave: Function,
  toast
) => {
  try {
    // 对方可能不在线，如果对方切换到后台一段时间，虽然这里显示的是在线，但是你离开
    // 时对方是收不到通知的
    if (online) {
      socket.emit('leave', remoteRoomInfo.roomId)
    }

    // 如果服务器中存在房间信息，清空它
    if (remoteRoomInfo.latestId) {
      await leaveAfterConnected()
    }

    // 主动离开的一方直接回到大厅，不显示底部按钮
    await simpleLeave()
  } catch (error) {
    toast.add({
      title: '操作失败，请检查网络状态',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

export default useLeave
