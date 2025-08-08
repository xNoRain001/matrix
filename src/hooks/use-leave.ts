import type { Socket } from 'socket.io-client'

const useLeaveRoom = (
  close: Function,
  remoteRoomInfo,
  socket: Socket,
  simpleLeave: Function
) => {
  close()

  if (remoteRoomInfo.latestId) {
    // latestId 如果存在，说明成功建立过连接，但是用户要离开
    // 通知对方，我要离开（对方可能在线）
    socket.emit('leave', remoteRoomInfo.roomId)
  } else {
    // latestId 不存在，说明虽然在房间内，但是没有对方记录，用户要离开只需要切换路由
    simpleLeave()
  }
}

export default useLeaveRoom
