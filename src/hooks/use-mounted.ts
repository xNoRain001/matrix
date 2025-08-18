import type { Router } from 'vue-router'
import type { remoteRoomInfo } from '@/types'
import { getLatestRoom, isExitRoom } from '@/apis/latest-room'
import type { Ref } from 'vue'

const useMounted = async (
  router: Router,
  currentPath: string,
  remoteRoomInfo: Ref<remoteRoomInfo>,
  queryRoomId: string,
  leaved: Ref<boolean>,
  firstRequestRemoteRoomInfo: Ref<boolean>,
  initSocket: Function,
  toast
) => {
  if (firstRequestRemoteRoomInfo.value) {
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
        color: 'error',
        icon: 'lucide:annoyed'
      })
      return router.replace('/')
    }
  }

  const _remoteRoomInfo = remoteRoomInfo.value
  const { latestId, path, roomId } = _remoteRoomInfo

  if (latestId) {
    // 如果获取到了远程房间，更新路由
    if (path === currentPath) {
      if (queryRoomId !== roomId) {
        // 由于路径没有发生变化，组件不会被销毁
        router.replace({ path, query: { roomId } })
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
      // 跳过请求，比如存储的是 /chat?roomId=chat-1111，
      // 访问 /audio-chat?roomId=chat-1111，在 audio chat 组件中一定会
      // 发请求更新房间信息，当加载新的组件时已经有房间信息了，就可以不用发请求
      firstRequestRemoteRoomInfo.value = true
      return
    }
  } else {
    // 直接访问带 roomId 的链接
    // 统一在这里更新 path，因为需要处理用户手动输入 url 的情况，匹配到用户
    // 或 pin 加入房间时不更新 path，因为会进入到这里
    _remoteRoomInfo.roomId = queryRoomId
    _remoteRoomInfo.path = currentPath
  }

  // 如果 socket 初始化连接失败（能获取到接口数据，却无法连接 socket，
  // 这是很小概率的事），由重试机制处理
  initSocket()
}

export default useMounted
