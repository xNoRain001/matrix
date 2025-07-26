import type { userInfo } from '@/types'
import type { Socket } from 'socket.io-client'

const useStartRTC = async (
  pc: RTCPeerConnection,
  socket: Socket,
  roomId: string,
  userInfo: userInfo
) => {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  // 移除邮箱
  const filteredUserInfo = { ...userInfo }
  delete filteredUserInfo.email
  socket.emit('rtc', roomId, {
    description: offer,
    otherInfo: filteredUserInfo
  })
}

export default useStartRTC
