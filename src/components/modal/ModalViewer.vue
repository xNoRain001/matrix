<template>
  <UModal
    dismissible
    v-model:open="isViewerModalOpen"
    title="预览"
    description=" "
    :ui="{
      body: 'flex justify-center items-center'
    }"
  >
    <template #body>
      <img :class="isMobile ? 'w-full' : 'h-full'" :src="url" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'

defineProps<{
  url: string
}>()

const { isMobile } = storeToRefs(useUserStore())
const isViewerModalOpen = defineModel() as Ref<boolean>
</script>
