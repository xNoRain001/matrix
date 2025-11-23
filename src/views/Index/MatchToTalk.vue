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
          :target-id="matchRes.targetId"
          :target-nickname="matchRes.targetNickname"
        />
        <MatchToTalkCall
          :is-match="true"
          :target-id="matchRes.targetId"
          :target-nickname="matchRes.targetNickname"
          class="m-4 sm:m-6"
        />
      </div>
      <ProfileSpace
        v-if="!isMobile"
        class="max-w-md"
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
const isOpen = ref(Boolean(matchRes.value))

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
