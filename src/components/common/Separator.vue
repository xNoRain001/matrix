<template>
  <div class="flex h-48 items-center justify-center">
    <USeparator
      :ui="{ border: 'border-accented', label: 'text-xs text-muted' }"
      class="w-48"
      :label="label"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ label: string }>()
</script>
