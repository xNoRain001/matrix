const useSaveRoomId = (roomId: string) => {
  localStorage.setItem('roomId', roomId)
}

export default useSaveRoomId
