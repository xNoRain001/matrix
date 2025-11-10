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
      <MatchToChatChat
        @close="isOpen = false"
        :is-match="true"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
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
import { useMatchStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useRefreshOnlineStatus } from '@/hooks'

let timer = null
const router = useRouter()
const { isMobile, globalSocket } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const targetId = ref('')
const targetProfile = ref(null)
const isOpen = ref(
  Boolean(matchRes.value?.type === 'chat' && matchRes.value?.profile)
)

if (isOpen.value) {
  const { id, profile } = matchRes.value
  targetId.value = id
  targetProfile.value = profile
} else {
  await router.replace('/')
}

onMounted(async () => {
  timer = useRefreshOnlineStatus(globalSocket, 'matchTarget', [targetId.value])
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>
