<template>
  <UModal
    fullscreen
    :close="{ onClick: () => emit('close', false) }"
    title="预览"
    description=" "
    :ui="{
      body: 'flex justify-center items-center'
    }"
  >
    <template #body>
      <img v-if="url" :class="isMobile ? 'w-full' : 'h-full'" :src="url" />
      <UIcon v-else name="lucide:image-off" class="size-32"></UIcon>
    </template>
    <!-- <template #footer>
      <UButton label="下载" />
    </template> -->
  </UModal>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

defineProps<{
  url: string
}>()

const emit = defineEmits<{ close: [boolean] }>()
const { isMobile } = storeToRefs(useUserStore())
</script>
