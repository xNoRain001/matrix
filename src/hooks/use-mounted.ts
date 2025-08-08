import type { Router } from 'vue-router'
import type { remoteRoomInfo } from '@/types'

const useMounted = (
  initSocket: Function,
  router: Router,
  hasRemoteRoomId: boolean,
  currentPath: string,
  remoteRoomInfo: remoteRoomInfo
) => {
  const { roomId, path } = remoteRoomInfo

  // 直接访问带 roomId 的链接
  if (!hasRemoteRoomId) {
    remoteRoomInfo.path = currentPath
  } else {
    // 如果获取到了远程房间，更新路由
    if (path === currentPath) {
      // 只需要替换 roomId，由于路径没有发生变化，组件不会被销毁
      router.replace({ query: { roomId } })
    } else {
      // 路径发生变化，组件会被销毁，然后重新加载
      router.replace({ path, query: { roomId } })
      return
    }
  }

  initSocket()
}

export default useMounted
