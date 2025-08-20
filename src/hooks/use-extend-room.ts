const onIsOnline = (online, v) => (online.value = v)

const onFull = (socket, isFull) => {
  isFull.value = true
  socket.disconnect()
}

const useExtendRoom = (socket, online, isFull) => {
  const _socket = socket.value
  // 在房间里时需要额外处理满员和对方的在线状态
  _socket.on('full', () => onFull(_socket, isFull))
  _socket.on('is-online', v => onIsOnline(online, v))
}

export default useExtendRoom
