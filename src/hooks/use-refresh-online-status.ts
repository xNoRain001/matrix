const useRefreshOnlineStatus = (globalSocket, type, ids) => {
  const socket = globalSocket.value

  socket.emit('get-online-status', type, ids)

  const timer = setInterval(
    () => {
      // 如果列表为空，不获取在线状态
      if (!ids.length) {
        socket.emit('get-online-status', type, ids)
      }
    },
    2 * 60 * 1000
  )

  return timer
}

export default useRefreshOnlineStatus
