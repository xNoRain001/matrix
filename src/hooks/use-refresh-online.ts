const useRefreshOnline = (globalSocket, type, ids) => {
  const socket = globalSocket.value

  socket.emit('online', type, ids)

  const timer = setTimeout(() => {
    socket.emit('online', type, ids)
  }, 2000)

  return timer
}

export default useRefreshOnline
