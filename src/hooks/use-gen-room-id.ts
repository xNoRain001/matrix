const useGenRoomId = (id, targetId) => [id, targetId].sort().join('_')

export default useGenRoomId
