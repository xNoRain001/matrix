<template>
  <USlideover title=" " description=" ">
    <template #content>
      <MessageView @close="emit('close', false)" />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ close: [boolean] }>()
</script>
