import type { Socket } from 'socket.io-client'

const useLeave = async (
  remoteRoomInfo,
  socket: Socket,
  online: boolean,
  leaveAfterConnected: Function,
  simpleLeave: Function
) => {
  // 对方可能不在线
  if (online) {
    socket.emit('leave', remoteRoomInfo.roomId)
  }

  // 如果服务器中存在房间信息，清空它
  if (remoteRoomInfo.latestId) {
    await leaveAfterConnected()
  }

  // 主动离开的一方直接回到大厅，不显示底部按钮
  await simpleLeave()
}

export default useLeave
