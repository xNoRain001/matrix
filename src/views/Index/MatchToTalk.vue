<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex-row', description: 'hidden' }"
  >
    <template #content>
      <UDashboardPanel id="match-to-talk">
        <MatchToTalkCall
          @close="isOpen = false"
          :target-id="matchRes.targetId"
          :target-nickname="matchRes.targetNickname"
        />
      </UDashboardPanel>
      <ProfileSpace
        v-if="!isMobile"
        class="max-w-2/5"
        :is-match="true"
        :target-id="matchRes.targetId"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore, useUserStore, useWebRTCStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useGenRoomId } from '@/hooks'

const router = useRouter()
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const { roomId, isVoiceChatMatch, webRTCTargetId, webRTCTargetNickname } =
  storeToRefs(useWebRTCStore())
const isOpen = ref(matchRes.value?.type === 'talk')

if (isOpen.value) {
  const { targetId, targetNickname } = matchRes.value
  webRTCTargetId.value = targetId
  webRTCTargetNickname.value = targetNickname
} else {
  await router.replace('/')
}

onMounted(async () => {
  isVoiceChatMatch.value = true
  const _roomId = (roomId.value = useGenRoomId(
    userInfo.value.id,
    matchRes.value.targetId
  ))
  globalSocket.value.emit('bidirectional-web-rtc', _roomId)
})
</script>
