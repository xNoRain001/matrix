import type { remoteRoomInfo } from '@/types'
import type { Router } from 'vue-router'

const useWatchPinCb = (
  type: 'chat' | 'audio-chat' | 'file-transfer',
  remoteRoomInfo: remoteRoomInfo,
  pin: string,
  path: string,
  router: Router
) => {
  const roomId = `${type}-${pin}`
  remoteRoomInfo.roomId = roomId
  remoteRoomInfo.path = path
  router.replace({ query: { roomId } })
}

export default useWatchPinCb
