const useGetTargetIdByRoomId = (roomId, userInfo) => {
  const [a, b] = roomId.split('_')
  return a === userInfo.value.id ? b : a
}

export default useGetTargetIdByRoomId
