import useClosePC from './use-close-pc'

const useDisconnect = (pc: RTCPeerConnection) => {
  // 满员的情况下，不会触发 joined，此时 pc 为 null
  useClosePC(pc)
}

export default useDisconnect
