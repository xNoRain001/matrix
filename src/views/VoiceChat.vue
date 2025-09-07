<template>
  <UModal
    @after:leave="router.replace('/')"
    :overlay="false"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex justify-center flex-row' }"
  >
    <template #content>
      <div
        v-if="matchType === 'voice-chat' && matchRes.id"
        class="w-full max-w-(--room-width)"
      >
        <MessageHeader
          @close="isOpen = false"
          :target-id="matchRes.id"
          :is-match="true"
        ></MessageHeader>
        <MessageVoice></MessageVoice>
      </div>
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
const { globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes, matchType } = storeToRefs(useMatchStore())
const { roomId, isVoiceChatMatch } = storeToRefs(useWebRTCStore())
const isOpen = ref(Boolean(matchType.value === 'voice-chat' && matchRes.value))

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
})
</script>
