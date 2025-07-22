const useInitSocketForMatch = (
  initSocket: Function,
  onMatched: any,
  type: 'chat' | 'audio-chat' | 'file-transfer'
) => {
  const socket = initSocket()
  socket.on('matched', onMatched)
  socket.emit('joinmatch', type)
  socket.emit('match', type)
}

export default useInitSocketForMatch
