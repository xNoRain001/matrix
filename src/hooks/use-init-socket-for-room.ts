const useInitSocketForRoom = (initSocket: Function, roomId: string) => {
  const socket = initSocket()
  socket.emit('join', roomId)
}

export default useInitSocketForRoom
