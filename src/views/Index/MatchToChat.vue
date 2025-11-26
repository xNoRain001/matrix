<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex-row', description: 'hidden' }"
  >
    <template #content v-if="!isReceivingOfflineMsgs">
      <MatchToChatChat
        @close="isOpen = false"
        :is-match="true"
        :target-id="matchRes.targetId"
        :target-nickname="matchRes.targetNickname"
      />
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
import { useRouter } from 'vue-router'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const router = useRouter()
const { isMobile } = storeToRefs(useUserStore())
const { matchRes } = storeToRefs(useMatchStore())
const { isReceivingOfflineMsgs } = storeToRefs(useRecentContactsStore())
const isOpen = ref(Boolean(matchRes.value))

if (!isOpen.value) {
  router.replace('/')
}
</script>
