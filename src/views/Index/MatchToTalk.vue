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
          :target-id="targetId"
          :target-profile="targetProfile"
        />
        <MatchToTalkCall
          :is-match="true"
          :target-id="targetId"
          :target-profile="targetProfile"
          class="m-4 sm:m-6"
        />
      </div>
      <ProfileSpace
        v-if="!isMobile"
        class="max-w-md"
        :is-match="true"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore, useUserStore, useWebRTCStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useGenRoomId, useRefreshOnlineStatus } from '@/hooks'

let timer = null
const router = useRouter()
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const targetId = ref('')
const targetProfile = ref(null)
const { roomId, isVoiceChatMatch, webRTCTargetId, webRTCTargetProfile } =
  storeToRefs(useWebRTCStore())
const isOpen = ref(
  Boolean(matchRes.value?.type === 'talk' && matchRes.value?.profile)
)

if (isOpen.value) {
  const { id, profile } = matchRes.value
  targetId.value = id
  targetProfile.value = profile
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
  timer = useRefreshOnlineStatus(globalSocket, 'matchTarget', [targetId.value])
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
