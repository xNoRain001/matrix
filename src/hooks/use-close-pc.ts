const useClosePC = (pc: RTCPeerConnection) => {
  if (pc) {
    pc.close()
  }
}

export default useClosePC
