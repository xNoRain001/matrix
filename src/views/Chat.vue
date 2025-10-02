<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex-row' }"
  >
    <template #content>
      <MessageView
        @close="isOpen = false"
        :is-match="true"
        :target-id="activeTargetId"
        :target-profile="activeTargetProfile"
      />
      <ProfileSpace
        v-if="!isMobile"
        class="max-w-md"
        :is-match="true"
        :target-id="activeTargetId"
        :target-profile="activeTargetProfile"
      ></ProfileSpace>
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
  useUserStore
} from '@/store'
import { storeToRefs } from 'pinia'
import { useRefreshOnline } from '@/hooks'

let timer = null
const router = useRouter()
const { isMobile, globalSocket } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const { activeTargetIds, activeTargetId, activeTargetProfile } = storeToRefs(
  useRecentContactsStore()
)
const { postMap } = storeToRefs(usePostStore())
const isOpen = ref(
  Boolean(matchRes.value.type === 'chat' && matchRes.value.profile)
)

if (isOpen.value) {
  const { id, profile } = matchRes.value
  activeTargetId.value = id
  activeTargetProfile.value = profile
} else {
  await router.replace('/')
}

onMounted(async () => {
  timer = useRefreshOnline(globalSocket, 'matchTarget', [activeTargetId.value])
})

onBeforeUnmount(() => {
  clearInterval(timer)

  activeTargetIds.value.delete(activeTargetId.value)
  delete postMap.value[activeTargetId.value]
  activeTargetId.value = ''
  activeTargetProfile.value = null
})
</script>
