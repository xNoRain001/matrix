<template>
  <!-- class="max-w-none" 实现平板全屏 -->
  <USlideover
    title=" "
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #content>
      <ProfileSpace
        @close="emit('close', false)"
        :target-id="targetId"
        :target-profile="targetProfile"
      ></ProfileSpace>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import type { userInfo } from '@/types'

defineProps<{
  targetId: string
  targetProfile: userInfo['profile']
}>()
const emit = defineEmits<{ close: [boolean] }>()
</script>
