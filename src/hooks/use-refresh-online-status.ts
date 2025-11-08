const useRefreshOnlineStatus = (globalSocket, type, ids) => {
  const socket = globalSocket.value

  socket.emit('get-online-status', type, ids)

  const timer = setInterval(
    () => {
      socket.emit('get-online-status', type, ids)
    },
    2 * 60 * 1000
  )

  return timer
}

export default useRefreshOnlineStatus
