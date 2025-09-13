<template>
  <USlideover
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
    :ui="{ body: 'flex flex-col gap-4' }"
  >
    <template #body>
      <ProfileNotifications></ProfileNotifications>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const isNotificationSlideoverOpen = defineModel<boolean>({ required: true })
</script>
