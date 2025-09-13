<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
  >
    <template #content>
      <!-- 规定时间内对方没接通时会清除 matchRes，因此需要使用到 v-if -->
      <div
        v-if="matchType === 'voice-chat' && matchRes.id"
        class="flex flex-row justify-center"
      >
        <ProfileSpace
          v-if="!isMobile"
          class="w-2/5"
          :is-match="true"
          :select-contact-id="matchRes.id"
        ></ProfileSpace>
        <div class="flex w-3/5 flex-col">
          <MessageHeader
            @close="isOpen = false"
            :is-match="true"
          ></MessageHeader>
          <MessageVoice class="m-4 sm:m-6"></MessageVoice>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useMatchStore,
  useRecentContactsStore,
  useUserStore,
  useWebRTCStore
} from '@/store'
import { storeToRefs } from 'pinia'
import { useGenRoomId } from '@/hooks'

const router = useRouter()
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const { matchRes, matchType } = storeToRefs(useMatchStore())
const { roomId, isVoiceChatMatch } = storeToRefs(useWebRTCStore())
const { targetId } = storeToRefs(useRecentContactsStore())
const isOpen = ref(Boolean(matchType.value === 'voice-chat' && matchRes.value))

targetId.value = matchType.value === 'voice-chat' ? matchRes.value.id : ''

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
