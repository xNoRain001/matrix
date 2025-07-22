const useSaveRoomInfo = (path: string, roomId: string) => {
  localStorage.setItem(
    'roomId',
    JSON.stringify({
      path,
      roomId
    })
  )
}

export default useSaveRoomInfo
