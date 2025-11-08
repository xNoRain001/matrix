<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex-row', description: 'hidden' }"
  >
    <!-- 规定时间内对方没接通时会清除 matchRes，因此需要使用到 v-if -->
    <template v-if="isOpen" #content>
      <div class="relative flex w-full flex-col">
        <MatchToChatChatHeader
          @close="isOpen = false"
          :is-match="true"
          :target-id="activeTargetId"
          :target-profile="activeTargetProfile"
        />
        <MatchToTalkCall
          :is-match="true"
          :target-id="activeTargetId"
          :target-profile="activeTargetProfile"
          class="m-4 sm:m-6"
        />
      </div>
      <ProfileSpace
        v-if="!isMobile"
        class="max-w-md"
        :is-match="true"
        :target-id="activeTargetId"
        :target-profile="activeTargetProfile"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useMatchStore,
  usePostStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { storeToRefs } from 'pinia'
import { useGenRoomId, useRefreshOnlineStatus } from '@/hooks'

let timer = null
const router = useRouter()
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const { activeTargetIds, activeTargetId, activeTargetProfile } = storeToRefs(
  useRecentContactsStore()
)
const { postMap } = storeToRefs(usePostStore())
const { roomId, isVoiceChatMatch, webRTCTargetId, webRTCTargetProfile } =
  storeToRefs(useWebRTCStore())
const isOpen = ref(
  Boolean(matchRes.value?.type === 'talk' && matchRes.value?.profile)
)

if (isOpen.value) {
  const { id, profile } = matchRes.value
  activeTargetId.value = id
  activeTargetProfile.value = profile
  webRTCTargetId.value = id
  webRTCTargetProfile.value = profile
} else {
  await router.replace('/')
}

onMounted(async () => {
  isVoiceChatMatch.value = true
  const _roomId = (roomId.value = useGenRoomId(
    userInfo.value.id,
    matchRes.value.id
  ))
  globalSocket.value.emit('bidirectional-web-rtc', _roomId)
  timer = useRefreshOnlineStatus(globalSocket, 'matchTarget', [
    activeTargetId.value
  ])
})

onBeforeUnmount(() => {
  activeTargetIds.value.delete(activeTargetId.value)
  delete postMap.value[activeTargetId.value]
  activeTargetId.value = ''
  activeTargetProfile.value = null
  clearInterval(timer)
})
</script>
