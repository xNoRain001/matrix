<template>
  <UDashboardNavbar title="广场" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UButton
        icon="lucide:bell"
        variant="ghost"
        @click="isNotificationSlideoverOpen = true"
      ></UButton>
    </template>
  </UDashboardNavbar>

  <!-- 通知模态框 -->
  <USlideover
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
  >
    <template #body>
      <UTabs :items="tabItems">
        <template #content>
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
      </UTabs>
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

<script lang="ts" setup>
import { useFormatTimeAgo } from '@/hooks'
import { ref } from 'vue'

const isNotificationSlideoverOpen = ref(false)
const isLikeSlideoverOpen = ref(false)
const contactNotifications = ref([])
const tabItems = ref([
  {
    label: '赞',
    icon: 'lucide:heart'
  },
  {
    label: '收藏',
    icon: 'lucide:star'
  },
  {
    label: '评论',
    icon: 'lucide:message-circle'
  }
])
</script>
