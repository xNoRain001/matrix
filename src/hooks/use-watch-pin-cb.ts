import { setLatestRoom } from '@/apis'

import type { Ref } from 'vue'
import type { Router } from 'vue-router'

const useWatchPinCb = (
  type: 'chat' | 'audio-chat' | 'file-transfer',
  roomId: string,
  pin: string,
  path: string,
  remoteRoomInfo: Ref<{ roomId: string; path: string }>,
  router: Router
) => {
  const _remoteRoomInfo = remoteRoomInfo.value
  _remoteRoomInfo.roomId = roomId = `${type}-${pin}`
  _remoteRoomInfo.path = path
  setLatestRoom(path, roomId)
  router.replace({ query: { roomId } })
}

export default useWatchPinCb
