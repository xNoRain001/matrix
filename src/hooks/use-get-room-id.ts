const useGetRoomId = (): string => {
  return localStorage.getItem('roomId') || ''
}

export default useGetRoomId
