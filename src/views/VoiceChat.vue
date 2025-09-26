<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex-row' }"
  >
    <!-- 规定时间内对方没接通时会清除 matchRes，因此需要使用到 v-if -->
    <template v-if="matchType === 'voice-chat' && matchRes.id" #content>
      <ProfileSpace
        v-if="!isMobile"
        class="!w-2/5"
        :is-match="true"
      ></ProfileSpace>
      <div
        :class="isMobile ? 'w-full' : 'w-3/5'"
        class="relative flex flex-col"
      >
        <MessageHeader @close="isOpen = false" :is-match="true"></MessageHeader>
        <MessageVoice :is-match="true" class="m-4 sm:m-6"></MessageVoice>
      </div>
    </template>
    <template #header></template>
    <template #body></template>
  </UModal>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useMatchStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { storeToRefs } from 'pinia'
import { useGenRoomId, useRefreshOnline } from '@/hooks'

let timer = null
const router = useRouter()
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes, matchType } = storeToRefs(useMatchStore())
const { roomId, isVoiceChatMatch } = storeToRefs(useWebRTCStore())
const { targetId, targetProfile } = storeToRefs(useRecentContactsStore())
const isOpen = ref(Boolean(matchType.value === 'voice-chat' && matchRes.value))

if (isOpen.value) {
  const { id, profile } = matchRes.value
  targetId.value = id
  targetProfile.value = profile
}

onMounted(async () => {
  if (!isOpen.value) {
    return router.replace('/')
  }

  isVoiceChatMatch.value = true
  const _roomId = (roomId.value = useGenRoomId(
    userInfo.value.id,
    matchRes.value.id
  ))
  globalSocket.value.emit('bidirectional-web-rtc', _roomId)
  timer = useRefreshOnline(globalSocket, 'matchTarget', [targetId.value])
})

onBeforeUnmount(() => {
  targetId.value = ''
  clearInterval(timer)
})
</script>
