<template>
  <div
    class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
  >
    <div v-if="offline" class="flex flex-col items-center">
      <q-icon color="red" size="lg" name="wifi_off"></q-icon>
      <div class="mt-4 text-red-600">网络错误</div>
      <q-btn
        @click="rematch"
        class="!mt-4"
        color="primary"
        label="重新匹配"
      ></q-btn>
    </div>
    <div v-else class="flex flex-col items-center">
      <q-spinner-puff color="primary" size="lg" />
      <div class="mt-4">正在匹配中...</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  offline: boolean
  rematch: () => void
}>()
</script>
