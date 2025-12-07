<template>
  <!-- 通知模态框 -->
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
    :ui="{
      body: 'flex flex-col',
      description: 'hidden'
    }"
  >
    <template #body>
      <UTabs :items="tabItems" v-model="activeTab" :content="false" />
      <template v-if="activeTab === 'like'">
        <div
          v-if="likeNotifications.length"
          v-for="{
            _id,
            targetId,
            targetProfile: { nickname },
            createdAt
          } in likeNotifications"
          :key="_id"
          class="cursor-pointer p-4 sm:p-6"
        >
          <UUser
            :name="nickname"
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${targetId}`,
              alt: nickname[0]
            }"
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1 min-w-0',
              name: 'truncate',
              description: 'flex justify-between'
            }"
          >
            <template #description>
              <span>点赞了你的内容</span>
              <time>{{ useFormatTimeAgo(createdAt) }}</time>
            </template>
          </UUser>
        </div>
        <div v-else class="flex flex-1 items-center justify-center">
          <UIcon name="lucide:bell" class="text-dimmed size-32" />
        </div>
      </template>
      <template v-if="activeTab === 'star'">
        <div
          v-if="likeNotifications.length"
          v-for="{
            _id,
            targetId,
            targetProfile: { nickname },
            createdAt
          } in likeNotifications"
          :key="_id"
          class="cursor-pointer p-4 sm:p-6"
        >
          <UUser
            :name="nickname"
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${targetId}`,
              alt: nickname[0]
            }"
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1 min-w-0',
              name: 'truncate',
              description: 'flex justify-between'
            }"
          >
            <template #description>
              <span>点赞了你的内容</span>
              <time>{{ useFormatTimeAgo(createdAt) }}</time>
            </template>
          </UUser>
        </div>
        <div v-else class="flex flex-1 items-center justify-center">
          <UIcon name="lucide:bell" class="text-dimmed size-32" />
        </div>
      </template>
      <template v-if="activeTab === 'comment'">
        <div
          v-if="likeNotifications.length"
          v-for="{
            _id,
            targetId,
            targetProfile: { nickname },
            createdAt
          } in likeNotifications"
          :key="_id"
          class="cursor-pointer p-4 sm:p-6"
        >
          <UUser
            :name="nickname"
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${targetId}`,
              alt: nickname[0]
            }"
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1 min-w-0',
              name: 'truncate',
              description: 'flex justify-between'
            }"
          >
            <template #description>
              <span>点赞了你的内容</span>
              <time>{{ useFormatTimeAgo(createdAt) }}</time>
            </template>
          </UUser>
        </div>
        <div v-else class="flex flex-1 items-center justify-center">
          <UIcon name="lucide:bell" class="text-dimmed size-32" />
        </div>
      </template>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useFormatTimeAgo } from '@/hooks'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore, useUserStore } from '@/store'

const isNotificationSlideoverOpen = defineModel<boolean>()
const { VITE_OSS_BASE_URL } = import.meta.env
const { isMobile } = storeToRefs(useUserStore())
const { likeNotifications } = storeToRefs(useNotificationsStore())
const activeTab = ref('like')
const tabItems = [
  {
    label: '赞',
    value: 'like',
    icon: 'lucide:heart'
  },
  {
    label: '收藏',
    value: 'star',
    icon: 'lucide:star'
  },
  {
    label: '评论',
    value: 'comment',
    icon: 'lucide:message-circle'
  }
]
</script>
