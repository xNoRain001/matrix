<template>
  <UModal
    @after:leave="router.replace('/')"
    fullscreen
    :overlay="false"
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex justify-center flex-row' }"
  >
    <template #content>
      <div class="w-full max-w-(--room-width)">
        <MessageView
          v-if="targetId"
          @close="isOpen = false"
          :is-match="true"
          :target-id="matchRes.id"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore, useRecentContactsStore } from '@/store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { matchRes, matchType } = storeToRefs(useMatchStore())
const { targetId } = storeToRefs(useRecentContactsStore())
const isOpen = ref(Boolean(matchType.value === 'chat' && matchRes.value))
targetId.value = matchRes.value?.id || ''

onMounted(async () => {
  if (!isOpen.value) {
    return router.replace('/')
  }
})
</script>
