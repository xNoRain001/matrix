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
      <div
        v-if="homeNotifications.length"
        v-for="({ _id, createdAt, content, type }, index) in homeNotifications"
        :key="_id"
        class="bg-elevated/50 border-b-accented/50 cursor-pointer rounded-none border-b p-4 sm:p-6"
      >
        <UUser
          size="xl"
          :ui="{
            wrapper: 'flex-1 min-w-0',
            description: 'flex justify-between items-center gap-2'
          }"
        >
          <template #description>
            <span class="flex-1 truncate">{{ content }}</span>
            <time
              >{{ useFormatTimeAgo(createdAt)
              }}{{
                type === 'feedback'
                  ? '已阅读反馈'
                  : type === 'reporter'
                    ? '已处理举报对象'
                    : ''
              }}</time
            >
            <UBadge label="删除" color="error" @click="onDelete(index)" />
          </template>
        </UUser>
      </div>
      <div v-else class="flex h-full items-center justify-center">
        <UIcon name="lucide:bell" class="text-dimmed size-32" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useFormatTimeAgo } from '@/hooks'
import { useNotificationsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const isNotificationsSlideoverOpen = defineModel<boolean>()
const { userInfo, isMobile } = storeToRefs(useUserStore())
const { homeNotifications } = storeToRefs(useNotificationsStore())

const onDelete = index => {
  homeNotifications.value.splice(index, 1)
  localStorage.setItem(
    `homeNotifications-${userInfo.value.id}`,
    JSON.stringify(homeNotifications.value)
  )
}
</script>
