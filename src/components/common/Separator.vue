<template>
  <USeparator
    :ui="{ border: 'border-accented w-6', label: 'text-xs text-muted' }"
    class="h-48 w-full justify-center"
    :label="label"
  />
</template>

<script lang="ts" setup>
defineProps<{ label: string }>()
</script>
