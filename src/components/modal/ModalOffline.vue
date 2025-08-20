<template>
  <UModal
    :dismissible="false"
    v-model:open="showOfflineModal"
    title="网络错误"
    description=" "
    :ui="{ close: 'hidden' }"
  >
    <template #body>
      <UButton
        color="error"
        label="重新连接"
        :loading="loading"
        loading-icon="i-lucide-loader"
        @click="onClick"
      ></UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'

defineProps<{
  loading: boolean
  onClick: () => void
}>()

const showOfflineModal = defineModel() as Ref<boolean>
</script>
