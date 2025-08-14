import type { Router } from 'vue-router'
import type { remoteRoomInfo } from '@/types'
import { getLatestRoom, isExitRoom } from '@/apis/latest-room'
import type { Ref } from 'vue'

const useMounted = async (
  initSocket: Function,
  router: Router,
  currentPath: string,
  remoteRoomInfo: Ref<remoteRoomInfo>,
  queryRoomId: string,
  leaved: Ref<boolean>,
  toast: any
) => {
  if (!remoteRoomInfo.value.skipRequest) {
    try {
      const latestRoomInfo = (await getLatestRoom()).data
      // 如果 latestId 有值，说明自身还没离开房间
      const { latestId } = latestRoomInfo

      if (latestId) {
        remoteRoomInfo.value = latestRoomInfo
        const isExit = (await isExitRoom(latestId)).data
        remoteRoomInfo.value.inRoom = !isExit
        leaved.value = isExit
      }
    } catch (error) {
      toast.add({
        title: error.message,
        color: 'error'
      })

      return router.replace('/hall')
    }
  }

  const _remoteRoomInfo = remoteRoomInfo.value
  const { latestId, path, roomId } = _remoteRoomInfo

  if (latestId) {
    // 如果获取到了远程房间，更新路由
    if (path === currentPath) {
      if (queryRoomId !== roomId) {
        // 由于路径没有发生变化，组件不会被销毁
        router.replace({ query: { roomId } })
      }

      // 如果对方已经离开了，不进行初始化
      if (leaved.value) {
        return
      }
    } else {
      // 路径发生变化，组件会被销毁，然后加载新的组件
      router.replace({
        path,
        query: { roomId }
      })
      // 跳过请求，比如存储的是 /hall/chat?roomId=chat-1111，
      // 访问 /hall/audio-chat?roomId=chat-1111，在 audio chat 组件中一定会
      // 发请求更新房间信息，当加载新的组件时已经有房间信息了，就可以不用发请求
      _remoteRoomInfo.skipRequest = true
      return
    }
  } else {
    // 直接访问带 roomId 的链接
    // 统一在这里更新 path，因为需要处理用户手动输入 url 的情况，匹配到用户
    // 或 pin 加入房间时不更新 path，因为会进入到这里
    _remoteRoomInfo.roomId = queryRoomId
    _remoteRoomInfo.path = currentPath
  }

  initSocket()
}

export default useMounted
