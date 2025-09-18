<template>
  <UModal :dismissible="false" title="网络错误" description=" " :close="false">
    <template #body>
      <UButton
        color="error"
        label="重新连接"
        :loading="reconnecting"
        loading-icon="i-lucide-loader"
        @click="onReconnect(emit)"
      ></UButton>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
defineProps<{
  reconnecting: boolean
  onReconnect: (emit) => void
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>
