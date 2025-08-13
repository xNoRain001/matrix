<template>
  <div class="flex items-center justify-center">
    <UButton
      class="w-full"
      @click="simpleLeave"
      :label="isMatch ? '重新匹配' : '重新进入房间'"
    ></UButton>
  </div>
</template>

<script lang="ts" setup>
const { simpleLeave, isMatch } = defineProps<{
  simpleLeave: () => void
  isMatch: boolean
}>()
</script>
