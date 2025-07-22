import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'
import useClosePC from './use-close-pc'
import useStartRTC from './use-start-rtc'

const useOtherJoin = async (
  pc: RTCPeerConnection,
  socket: Socket,
  roomId: string,
  polite: Ref<boolean>,
  makingOffer: Ref<boolean>,
  initPC: Function
) => {
  polite.value = true
  useClosePC(pc)
  pc = await initPC()

  try {
    makingOffer.value = true
    await useStartRTC(pc, socket, roomId)
  } catch (err) {
    console.error(err)
  }

  makingOffer.value = false
}

export default useOtherJoin
