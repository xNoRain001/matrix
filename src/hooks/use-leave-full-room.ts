const useLeaveFullRoom = async (
  remoteRoomInfo: any,
  updateLatestRoom: Function,
  router,
  parentPath
) => {
  // 满员时是加入不了房间的，但是需要显示底部的重新加入房间或匹配的按钮
  remoteRoomInfo.roomId = remoteRoomInfo.path = remoteRoomInfo.latestId = ''
  remoteRoomInfo.inRoom = false
  await updateLatestRoom()
  router.replace(parentPath)
}

export default useLeaveFullRoom
