import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'
import useClosePC from './use-close-pc'
import useStartRTC from './use-start-rtc'
import type { userInfo } from '@/types'

const useOtherJoin = async (
  pc: RTCPeerConnection,
  socket: Socket,
  roomId: string,
  polite: Ref<boolean>,
  makingOffer: Ref<boolean>,
  initPC: Function,
  userInfo: userInfo
) => {
  polite.value = true
  useClosePC(pc)
  pc = await initPC()

  try {
    makingOffer.value = true
    await useStartRTC(pc, socket, roomId, userInfo)
  } catch (err) {
    console.error(err)
  }

  makingOffer.value = false
}

export default useOtherJoin
