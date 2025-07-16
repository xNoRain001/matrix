import type { Socket } from 'socket.io-client'

type useInitRtcFn = (
  pc: RTCPeerConnection,
  socket: Socket,
  roomId: string,
  data: { description: RTCSessionDescriptionInit; candidate: RTCIceCandidate },
  makingOffer: boolean,
  polite: boolean
) => {}

let ignoreOffer = false

const useInitRtc: useInitRtcFn = async (
  pc,
  socket,
  roomId,
  { description, candidate },
  makingOffer,
  polite
) => {
  try {
    if (description) {
      const { type } = description
      const offerCollision =
        type === 'offer' && (makingOffer || pc.signalingState !== 'stable')
      ignoreOffer = !polite && offerCollision

      if (ignoreOffer) {
        return
      }

      await pc.setRemoteDescription(description)

      if (type === 'offer') {
        await pc.setLocalDescription()
        socket.emit('rtc', roomId, { description: pc.localDescription })
      }
    } else if (candidate) {
      try {
        await pc.addIceCandidate(candidate)
      } catch (err) {
        if (!ignoreOffer) {
          console.error(err)
        }
      }
    }
  } catch (err) {
    console.error(err)
  }
}

export default useInitRtc
