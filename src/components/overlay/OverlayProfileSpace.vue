<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    title=" "
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #content>
      <ProfileSpace @close="emit('close', false)" :target-id="targetId" />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

defineProps<{
  targetId: string
}>()
const emit = defineEmits<{ close: [boolean] }>()
const { isMobile } = storeToRefs(useUserStore())
</script>
