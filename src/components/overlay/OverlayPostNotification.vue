<template>
  <USlideover title="通知" description=" ">
    <template #body>
      <div class="bg-default top-0 flex justify-between px-4">
        <div
          @click="isLikeSlideoverOpen = true"
          class="flex flex-col items-center justify-start gap-2"
        >
          <UButton color="secondary" size="xl" icon="lucide:heart"></UButton>
          <div class="text-xs">赞</div>
        </div>
        <div class="flex flex-col items-center justify-start gap-2">
          <UButton color="warning" size="xl" icon="lucide:star"></UButton>
          <div class="text-xs">收藏</div>
        </div>
        <div class="flex flex-col items-center justify-start gap-2">
          <UButton size="xl" icon="lucide:message-circle"></UButton>
          <div class="text-xs">评论</div>
        </div>
      </div>

      <USlideover v-model:open="isLikeSlideoverOpen" title="赞" description=" ">
        <template #body>
          <div
            v-for="{ id, profile, createdAt, content } in contactNotifications"
            :key="id"
            class="text-toned hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center gap-4 border-l-2 border-(--ui-bg) p-4 text-base transition-colors sm:px-6"
          >
            <UAvatar :text="profile.nickname[0]" size="3xl" />
            <div class="flex flex-1 flex-col gap-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span
                  class="text-highlighted line-clamp-1 max-w-1/2 font-medium"
                >
                  {{ profile.nickname }}</span
                >
                <time class="text-muted text-xs">{{
                  useFormatTimeAgo(createdAt)
                }}</time>
              </div>
              <div class="flex items-center justify-between">
                <div class="text-dimmed line-clamp-1 max-w-1/2">
                  {{ content }}
                </div>
                <UButton
                  color="error"
                  label="删除"
                  icon="lucide:x"
                  size="xs"
                ></UButton>
              </div>
            </div>
          </div>
        </template>
      </USlideover>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useFormatTimeAgo } from '@/hooks'
import { ref } from 'vue'

const isLikeSlideoverOpen = ref(false)
const contactNotifications = ref([])
</script>
