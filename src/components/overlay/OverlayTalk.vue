<template>
  <UModal fullscreen title=" " description=" ">
    <template #content>
      <MatchToTalkCall
        @close="emit('close', false)"
        :target-id="webRTCTargetId"
        :target-nickname="webRTCTargetNickname"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useWebRTCStore } from '@/store'
import { storeToRefs } from 'pinia'

const emit = defineEmits<{ close: [boolean] }>()
const { webRTCTargetId, webRTCTargetNickname } = storeToRefs(useWebRTCStore())
</script>
