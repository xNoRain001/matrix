<template>
  <USlideover
    v-model:open="open"
    title="通知"
    description=" "
    :ui="{ body: 'flex flex-col gap-4' }"
  >
    <template #body>
      <ProfileFix></ProfileFix>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ required: true })
</script>
