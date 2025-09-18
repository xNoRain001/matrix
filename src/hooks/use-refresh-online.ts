const useRefreshOnline = (globalSocket, type, ids) => {
  const socket = globalSocket.value

  socket.emit('online', type, ids)

  const timer = setInterval(
    () => {
      socket.emit('online', type, ids)
    },
    2 * 60 * 1000
  )

  return timer
}

export default useRefreshOnline
