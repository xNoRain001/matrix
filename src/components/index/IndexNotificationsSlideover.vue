<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="通知"
    description=" "
    :ui="{ body: '!p-0' }"
  >
    <!-- <template #close>
      <UButton icon="lucide:equal-approximately" variant="ghost"></UButton>
    </template> -->
    <template #body>
      <div
        v-for="(
          { id, profile: { nickname }, createdAt, content }, index
        ) in notifications"
        :key="id"
        class="text-toned hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center gap-4 border-l-2 border-(--ui-bg) p-4 text-base transition-colors sm:px-6"
      >
        <UAvatar :text="nickname[0]" size="3xl" />
        <div class="flex flex-1 flex-col gap-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-highlighted line-clamp-1 max-w-1/2 font-medium">
              {{ nickname }}</span
            >
            <time class="text-muted text-xs">{{
              useFormatTimeAgo(createdAt)
            }}</time>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-dimmed line-clamp-1 max-w-1/2">
              {{ content }}
            </div>
            <div>
              <UButton
                @click="onDelete(index)"
                color="error"
                label="删除"
                icon="lucide:x"
                size="xs"
              ></UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'
import { useFormatTimeAgo } from '@/hooks'

const isNotificationsSlideoverOpen = defineModel<boolean>()
const { notifications } = storeToRefs(useUserStore())

const onDelete = index => {
  const _notifications = notifications.value
  _notifications.splice(index, 1)
  localStorage.setItem('notifications', JSON.stringify(_notifications))
}
</script>
