import useClosePC from './use-close-pc'

// 当断开连接时，房间会自动清除该 socket
const useDisconnect = (pc: RTCPeerConnection) => {
  console.log('socket 断开连接')
  // 满员的情况下，不会触发 joined，此时 pc 为 null
  useClosePC(pc)
}

export default useDisconnect
