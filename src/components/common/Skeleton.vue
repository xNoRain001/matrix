<template>
  <div class="divide-default divide-y">
    <div
      v-for="i in count"
      :key="i"
      class="flex items-center gap-2.5 p-4 sm:p-6"
    >
      <USkeleton class="size-10 rounded-full" />

      <div class="grid flex-1 gap-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-4/5" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ count: number }>()
</script>
