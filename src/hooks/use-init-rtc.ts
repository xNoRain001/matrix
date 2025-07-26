import type { userInfo } from '@/types'
import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'
import { useRoomStore } from '@/store'

type useInitRtcFn = (
  pc: RTCPeerConnection,
  socket: Socket,
  roomId: string,
  data: {
    description?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidate
    otherInfo?: userInfo
  },
  makingOffer: Ref<boolean>,
  polite: Ref<boolean>,
  userInfo?: userInfo
) => {}

let ignoreOffer = false

const useInitRtc: useInitRtcFn = async (
  pc,
  socket,
  roomId,
  { description, candidate, otherInfo },
  makingOffer,
  polite,
  userInfo
) => {
  try {
    if (description) {
      const { type } = description
      const offerCollision =
        type === 'offer' &&
        (makingOffer.value || pc.signalingState !== 'stable')
      ignoreOffer = !polite.value && offerCollision

      if (ignoreOffer) {
        return
      }

      // 更新对方的信息
      useRoomStore().otherInfo = otherInfo
      await pc.setRemoteDescription(description)

      if (type === 'offer') {
        await pc.setLocalDescription()
        socket.emit('rtc', roomId, {
          description: pc.localDescription,
          otherInfo: userInfo
        })
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
