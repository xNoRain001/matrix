<template>
  <USlideover title=" " description=" ">
    <template #content>
      <MessageView
        @close="emit('close', false)"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import type { userInfo } from '@/types'

defineProps<{ targetId: string; targetProfile: userInfo['profile'] }>()
const emit = defineEmits<{ close: [boolean] }>()
</script>
