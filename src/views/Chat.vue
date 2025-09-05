<template>
  <UModal
    @after:leave="router.replace('/')"
    :dismissible="false"
    fullscreen
    title=" "
    description=" "
    v-model:open="isOpen"
    :ui="{ content: 'flex justify-center flex-row' }"
  >
    <template #content>
      <MessageView
        class="w-full max-w-(--room-width)"
        v-if="isOpen"
        @close="isOpen = false"
        :is-match="true"
        :target-id="matchRes.id"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatchStore } from '@/store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { matchRes, matchType } = storeToRefs(useMatchStore())
const isOpen = ref(Boolean(matchType.value === 'chat' && matchRes.value))

onMounted(async () => {
  if (!isOpen.value) {
    router.replace('/')
  }
})
</script>
