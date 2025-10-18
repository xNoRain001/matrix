<template>
  <UDashboardNavbar title="广场" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UButton
        icon="lucide:refresh-ccw"
        variant="ghost"
        @click="getLatestData"
      ></UButton>
      <UButton
        icon="lucide:bell"
        variant="ghost"
        @click="isNotificationSlideoverOpen = true"
      ></UButton>
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
    v-model:open="isNotificationSlideoverOpen"
    title="通知"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body>
      <UTabs :items="tabItems">
        <template #content>
          <div
            v-for="{ id, profile, createdAt } in contactNotifications"
            :key="id"
            class="bg-elevated/50 rounded-lg p-4 not-last:mb-2 sm:p-6"
          >
            <UUser
              :name="profile.nickname"
              :avatar="{ alt: profile.nickname[0] }"
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
        </template>
      </UTabs>
    </template>
  </USlideover>
  <USlideover
    v-model:open="isLikeSlideoverOpen"
    title="赞"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body></template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useFormatTimeAgo } from '@/hooks'
import { ref } from 'vue'
import OverlayPublisher from '../overlay/OverlayPublisher.vue'
import { storeToRefs } from 'pinia'
import { usePostStore, useUserStore } from '@/store'
import { getPlaygroundPostsAPI } from '@/apis/playground'

const allPostLoaded = defineModel<boolean>()
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const { userInfo } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const isNotificationSlideoverOpen = ref(false)
const isLikeSlideoverOpen = ref(false)
const contactNotifications = ref([
  {
    id: '1',
    profile: {
      // nickname: 'a'
      nickname:
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    },
    createdAt: Date.now(),
    content: 'aaa'
  },
  {
    id: '2',
    profile: {
      nickname: 'b'
    },
    createdAt: Date.now(),
    content: 'ccc'
  }
])
const tabItems = [
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
