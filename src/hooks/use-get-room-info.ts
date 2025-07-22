const useGetRoomInfo = (): { path: string; roomId: string } => {
  const v = localStorage.getItem('roomId')
  return v ? JSON.parse(v) : { path: '', roomId: '' }
}

export default useGetRoomInfo
