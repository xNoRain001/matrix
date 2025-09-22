<template>
  <UModal
    fullscreen
    :close="{ onClick: () => emit('close', false) }"
    title="语音通话"
    description=" "
    :ui="{ body: 'flex' }"
  >
    <template #body>
      <MessageVoice :close="() => emit('close', false)"></MessageVoice>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ close: [boolean] }>()
</script>
