<template>
  <UModal
    fullscreen
    :close="{ onClick: () => emit('close', false) }"
    title="语音通话"
    description=" "
    :ui="{ body: 'flex', description: 'hidden' }"
  >
    <template #body>
      <MessageVoice
        :close="() => emit('close', false)"
        :target-id="webRTCTargetId"
        :target-profile="webRTCTargetProfile"
      ></MessageVoice>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useWebRTCStore } from '@/store'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{ close: [boolean] }>()
const { webRTCTargetId, webRTCTargetProfile } = storeToRefs(useWebRTCStore())
</script>
