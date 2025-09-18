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
      <ProfileSpace
        v-if="!isMobile"
        class="w-2/5"
        :is-match="true"
      ></ProfileSpace>
      <MessageView v-if="targetId" @close="isOpen = false" :is-match="true" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useRefreshOnline } from '@/hooks'

let timer = null
const router = useRouter()
const { isMobile, globalSocket } = storeToRefs(useUserStore())
const { matchRes, matchType } = storeToRefs(useMatchStore())
const { targetId } = storeToRefs(useRecentContactsStore())
const isOpen = ref(Boolean(matchType.value === 'chat' && matchRes.value))

targetId.value = matchType.value === 'chat' ? matchRes.value.id : ''

onMounted(async () => {
  if (!isOpen.value) {
    return router.replace('/')
  }

  timer = useRefreshOnline(globalSocket, 'matchTarget', [targetId.value])
})

onBeforeUnmount(() => clearInterval(timer))
</script>
