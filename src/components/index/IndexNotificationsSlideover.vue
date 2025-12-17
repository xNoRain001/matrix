<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isNotificationsSlideoverOpen"
    title="通知"
    description=" "
    :ui="{
      body: 'p-0 sm:p-0',
      description: 'hidden'
    }"
  >
    <template #body>
      <Skeleton v-if="loading" :count="10" />
      <template v-if="homeNotifications">
        <div class="divide-default divide-y">
          <div
            v-for="{ _id, createdAt, content, type } in homeNotifications"
            :key="_id"
            class="cursor-pointer p-4 sm:p-6"
          >
            <UUser
              size="xl"
              :ui="{
                wrapper: 'flex-1 min-w-0',
                description: 'flex justify-between gap-2'
              }"
            >
              <template #description>
                <span class="flex-1 truncate">{{ content }}</span>
                <time>
                  {{ useFormatTimeAgo(createdAt) }}
                  {{
                    type === 'feedback'
                      ? '已阅读反馈'
                      : type === 'reporter'
                        ? '已处理举报对象'
                        : ''
                  }}
                </time>
              </template>
            </UUser>
          </div>
        </div>
        <Separator v-if="homeNotifications.length === 0" :label="'空空如也'" />
        <Separator v-else-if="allNotificationLoaded" label="已经到底了" />
      </template>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useFormatTimeAgo } from '@/hooks'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { ref } from 'vue'

const isNotificationsSlideoverOpen = defineModel<boolean>()
const { isMobile } = storeToRefs(useUserStore())
const homeNotifications = ref(null)
const allNotificationLoaded = ref(false)
const loading = ref(true)

watch(isNotificationsSlideoverOpen, v => {
  if (v) {
    homeNotifications.value = []
    allNotificationLoaded.value = true
    loading.value = false
  }
})
</script>
