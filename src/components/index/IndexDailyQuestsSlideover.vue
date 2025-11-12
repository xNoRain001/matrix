<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    title="每日任务"
    description=" "
    :ui="{
      body: 'space-y-4 sm:space-y-6',
      description: 'hidden'
    }"
    v-model:open="isDailyQuestsSlideoverOpen"
  >
    <template #body>
      <UPageCard
        title="完成 20 次匹配（1 / 20）"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <UProgress :max="20" v-model="value" />
      <UPageCard
        title="点赞 5 篇情绪切片（2 / 5）"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <UProgress :max="6" v-model="value" />
    </template>
    <template #footer>
      <UButton class="w-full justify-center" label="领取奖励" />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const { isMobile } = storeToRefs(useUserStore())
const isDailyQuestsSlideoverOpen = defineModel<boolean>()
const value = ref(5)
</script>
