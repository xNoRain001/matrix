import type { Router } from 'vue-router'
import type { remoteRoomInfo } from '@/types'

const useMounted = (
  initSocket: Function,
  router: Router,
  currentPath: string,
  remoteRoomInfo: remoteRoomInfo,
  otherLeaved: boolean,
  queryRoomId: string
) => {
  const { roomId, path, latestId } = remoteRoomInfo

  console.log(latestId)
  // 直接访问带 roomId 的链接
  if (!latestId) {
    // 统一在这里更新 path，因为需要处理用户手动输入 url 的情况，匹配到用户
    // 或 pin 加入房间时不更新 path，因为会进入到这里
    remoteRoomInfo.path = currentPath
  } else {
    // 如果获取到了远程房间，更新路由
    if (path === currentPath) {
      if (queryRoomId !== roomId) {
        // 由于路径没有发生变化，组件不会被销毁
        router.replace({ query: { roomId } })
      }

      // 如果对方已经离开了，不进行初始化
      if (otherLeaved) {
        return
      }
    } else {
      // 路径发生变化，组件会被销毁，然后加载新的组件
      router.replace({ path, query: { roomId } })
      // 跳过请求，比如存储的是 /hall/chat?roomId=chat-1111，
      // 访问 /hall/audio-chat?roomId=chat-1111，在 audio chat 组件中一定会
      // 发请求更新房间信息，当加载新的组件时已经有房间信息了，就可以不用发请求
      remoteRoomInfo.skipRequest = true
      return
    }
  }

  initSocket()
}

export default useMounted
