<template>
  <UModal :dismissible="false" title="网络错误" description=" " :close="false">
    <template #footer>
      <div class="flex gap-2">
        <UButton
          color="error"
          label="重新连接"
          :loading="reconnecting"
          loading-icon="i-lucide-loader"
          @click="onReconnect(emit)"
        ></UButton>
        <UButton label="刷新" class="justify-center" @click="onReload" />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
defineProps<{
  reconnecting: boolean
  onReconnect: (emit) => void
}>()

const emit = defineEmits<{ close: [boolean] }>()
const onReload = () => location.reload()
</script>
