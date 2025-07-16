import type { Socket } from 'socket.io-client'

const useStartRTC = async (
  pc: RTCPeerConnection,
  socket: Socket,
  roomId: string
) => {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  socket.emit('rtc', roomId, { description: offer })
}

export default useStartRTC
