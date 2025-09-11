<template>
  <UDrawer
    :close="{ onClick: () => emit('close', false) }"
    title="修复聊天记录"
    description="这将清空所有聊天记录和聊天列表"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="emit('close', false)"
      />
      <UButton label="确认" class="justify-center" @click="useFixIndexedDB" />
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { useFixIndexedDB } from '@/hooks'

const emit = defineEmits<{ close: [boolean] }>()
</script>
