<template>
  <UDashboardNavbar title="广场" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UButton
        icon="lucide:refresh-cw"
        variant="ghost"
        @click="getLatestData"
      />
      <UButton
        icon="lucide:bell"
        variant="ghost"
        @click="isNotificationSlideoverOpen = true"
      />
      <UButton
        icon="lucide:pencil-line"
        variant="ghost"
        @click="
          publisherOverlay.open({ action: 'post', targetId: userInfo.id })
        "
      />
    </template>
  </UDashboardNavbar>

  <!-- 通知模态框 -->
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
    :ui="{
      body: 'p-0 sm:p-0 flex flex-col',
      description: 'hidden'
    }"
  >
    <template #body>
      <UTabs
        :items="tabItems"
        v-model="activeTab"
        class="p-4 sm:p-6"
        :content="false"
      />
      <template v-if="activeTab === 'like'">
        <div
          v-if="likeNotifications.length"
          v-for="{ id, profile, createdAt } in likeNotifications"
          :key="id"
          class="bg-elevated/50 border-b-accented/50 cursor-pointer rounded-none border-b p-4 sm:p-6"
        >
          <UUser
            :name="profile.nickname"
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${id}`,
              alt: profile.nickname[0]
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
          v-for="{ id, profile, createdAt } in likeNotifications"
          :key="id"
          class="bg-elevated/50 border-b-accented/50 cursor-pointer rounded-none border-b p-4 sm:p-6"
        >
          <UUser
            :name="profile.nickname"
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${id}`,
              alt: profile.nickname[0]
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
          v-for="{ id, profile, createdAt } in likeNotifications"
          :key="id"
          class="bg-elevated/50 border-b-accented/50 cursor-pointer rounded-none border-b p-4 sm:p-6"
        >
          <UUser
            :name="profile.nickname"
            :avatar="{
              src: `${VITE_OSS_BASE_URL}avatar/${id}`,
              alt: profile.nickname[0]
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
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore, usePostStore, useUserStore } from '@/store'
import { getPlaygroundPostsAPI } from '@/apis/playground'

const { VITE_OSS_BASE_URL } = import.meta.env
const allPostLoaded = defineModel<boolean>()
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const { userInfo, isMobile } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const { likeNotifications } = storeToRefs(useNotificationsStore())
const isNotificationSlideoverOpen = ref(false)
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
const toast = useToast()

const getLatestData = async () => {
  const posts = (
    await getPlaygroundPostsAPI('latest', '', postMap.value.latest.posts[0]._id)
  ).data
  const { length } = posts

  if (length) {
    if (length < 10) {
      postMap.value.latest.posts.unshift(...posts)
    } else {
      postMap.value.latest.posts = posts
      allPostLoaded.value = false
    }
  } else {
    toast.add({
      title: '暂时没有新内容',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}
</script>
