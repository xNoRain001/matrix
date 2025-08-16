import { getLatestRoom, isExitRoom } from '@/apis/latest-room'

const useRefreshRoomInfo = async (
  socket,
  remoteRoomInfo,
  onBye,
  getOnlineWhenReconnection
) => {
  const latestRoomInfo = (await getLatestRoom()).data
  const { latestId } = latestRoomInfo

  if (latestId) {
    const isExit = (await isExitRoom(latestId)).data

    if (isExit) {
      // 对方离开了，内部更新 leaved 和 remoteRoomInfo
      onBye()
    } else {
      // 对方没离开，需要看他是否还在线
      if (socket.connected) {
        // 如果离开时间不长或者模态框中完成重连，那么 socket 会处于连接中，
        // 如果离开时间不长后再回来，有可能执行完后这行代码后 socket 就断开连接了，
        // 然后会进行 socket 重连，因此回调中获取不到在线结果，但是 rtc 也会断开，
        // rtc 断开回调中会更新在线结果
        socket.emit('is-online', remoteRoomInfo.value.roomId)
      } else {
        // 如果离开时间很长，当你回来时，如果对方依然在线，会自动进行 rtc 重连，
        // 连接成功后会更新对方的在线状态，但是 socket 连接一定会断开，然后进行重连，
        // 如果对方不在线，无法通过 rtc 重连获取对方的在线状态，需要在重连成功
        // 后手动需要获取对方的在线状态，
        getOnlineWhenReconnection.value = true
      }
    }
  }
}

export default useRefreshRoomInfo
