<template>
  <RoomFull v-if="isFull"></RoomFull>

  <UModal
    v-else
    v-model:open="openModal"
    fullscreen
    title=" "
    description=" "
    :dismissible="false"
    class="overflow-y-auto"
    :ui="{
      // 背景色保持一致，防止修改 top 时看到主页的 header
      overlay: 'bg-default'
    }"
  >
    <template #content></template>
    <template #header>
      <RoomHeader :leaved="leaved" :on-click="onLeave"></RoomHeader>
    </template>
    <template #body>
      <div ref="bodyChildRef" class="-mt-4 flex justify-center pb-4">
        <div class="relative w-full max-w-(--room-width)">
          <MessageBody
            :message-list="messageList"
            :msg-stamp="msgStamp"
          ></MessageBody>
        </div>
      </div>
    </template>
    <template #footer>
      <div ref="footerRef" class="flex w-full justify-center">
        <RoomLeave
          v-if="leaved"
          :is-match="isMatch"
          :simple-leave="simpleLeave"
        ></RoomLeave>
        <div v-else class="w-full max-w-(--room-width)">
          <MessageFooter
            ref="childRef"
            :body-ref="bodyRef"
            v-model:message-list="messageList"
            v-model:leaved="leaved"
            v-model:msg-stamp="msgStamp"
          ></MessageFooter>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useLeave } from '@/hooks'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/store'
import { storeToRefs } from 'pinia'
import { sharedVars } from '@/hooks/use-init-pc'
import type { message } from '@/types'

const childRef = ref(null)
const openModal = ref(true)
const router = useRouter()
const leaved = ref(false)
const { isMatch, remoteRoomInfo } = storeToRefs(useRoomStore())
const { online, socket } = sharedVars()
const isFull = ref(false)
const toast = useToast()
const messageList = ref<message[]>([])
const msgStamp = ref({ sent: false, value: '' })
const bodyChildRef = ref(null)
const bodyRef = computed(() => bodyChildRef.value?.parentNode)

// 被动离开的一方会显示底部按钮，点击后
const simpleLeave = async () => {
  // 被动离开的一方会显示底部按钮，如果是刚进入房间时发现对方离开了，要清空远程房间信息
  // 和本地聊天记录，如果是双方建立连接后，对方离开后，只需要修改路由即可，
  // 清空远程房间信息和本地聊天记录和本地房间信息的操作在 onBye 中完成了
  const _remoteRoomInfo = remoteRoomInfo.value

  if (_remoteRoomInfo.latestId) {
    await childRef.value.leaveAfterConnected()
  } else {
    _remoteRoomInfo.roomId =
      _remoteRoomInfo.path =
      _remoteRoomInfo.latestId =
        ''
    _remoteRoomInfo.showExitRoomTip = _remoteRoomInfo.inRoom = false
  }

  router.replace('/')
}

// 主动离开，一定是双方都没有离开时才可能被触发的函数
const onLeave = async () => {
  await useLeave(
    remoteRoomInfo.value,
    socket.value,
    online.value,
    childRef.value.leaveAfterConnected,
    simpleLeave,
    toast
  )
}
</script>
