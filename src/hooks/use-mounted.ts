import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import useSaveRoomInfo from './use-save-room-info'
import useInitSocketForRoom from './use-init-socket-for-room'
import useInitSocketForMatch from './use-init-socket-for-match'

const useMounted = (
  initSocket: Function,
  onMatched: Function,
  router: Router,
  hasRemoteRoomId: boolean,
  path: string,
  remoteRoomInfo: { roomId: string; path: string },
  isMatch: Ref<boolean>,
  type: 'chat' | 'audio-chat' | 'file-transfer'
) => {
  if (remoteRoomInfo.roomId) {
    const { roomId } = remoteRoomInfo

    // 直接访问带 roomId 的链接
    if (!hasRemoteRoomId) {
      remoteRoomInfo.path = path
      useSaveRoomInfo(path, roomId)
    } else {
      // 如果获取到了远程房间，更新路由
      if (remoteRoomInfo.path === path) {
        // 只需要替换 roomId，由于路径没有发生变化，组件不会被销毁
        router.push({ query: { roomId } })
      } else {
        // 路径发生变化，组件会被销毁
        router.push({ path: remoteRoomInfo.path, query: { roomId } })
        // 阻止生成 socket，onBeforeUnmount 中来不及销毁
        return
      }
    }

    useInitSocketForRoom(initSocket, roomId)
  } else if (isMatch.value) {
    useInitSocketForMatch(initSocket, onMatched, type)
  }
}

export default useMounted
