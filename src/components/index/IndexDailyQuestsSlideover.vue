<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    title="每日任务"
    description=" "
    :ui="{
      description: 'hidden'
    }"
    v-model:open="isDailyQuestsSlideoverOpen"
  >
    <template #body></template>
    <template #footer>
      <UButton label="领取奖励"></UButton>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const { isMobile } = storeToRefs(useUserStore())
const isDailyQuestsSlideoverOpen = defineModel<boolean>()
</script>
