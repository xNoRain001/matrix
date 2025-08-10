<template>
  <div class="absolute top-1/2 left-1/2 -translate-1/2">
    <div>房间已满员...</div>
    <!-- 移动端会发生点击穿透从而关闭 modal -->
    <UButton class="mt-4" @click="useLeaveFullRoom" label="退出房间"></UButton>
  </div>
</template>

<script lang="ts" setup>
import { updateLatestRoom } from '@/apis/latest-room'
import { useRoomStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const { remoteRoomInfo } = storeToRefs(useRoomStore())
const _remoteRoomInfo = remoteRoomInfo.value

const useLeaveFullRoom = async () => {
  // 满员时是加入不了房间的，但是需要显示底部的重新加入房间或匹配的按钮
  _remoteRoomInfo.roomId = _remoteRoomInfo.path = _remoteRoomInfo.latestId = ''
  _remoteRoomInfo.inRoom = false
  await updateLatestRoom()
  router.replace('/hall')
}
</script>
