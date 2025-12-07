<template>
  <UDashboardNavbar title="广场" :toggle="false" class="border-b-0">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UButton
        icon="lucide:bell"
        variant="ghost"
        @click="isNotificationSlideoverOpen = true"
      />
      <UButton
        icon="lucide:pencil-line"
        variant="ghost"
        @click="isPublishSlideoverOpen = true"
      />
    </template>
  </UDashboardNavbar>
  <div class="flex items-center justify-between">
    <UTabs
      :content="false"
      variant="link"
      :items="tabItems"
      v-model="activeTab"
    />
    <UButton
      @click="getLatestData"
      class="mr-4 sm:mr-6"
      variant="ghost"
      icon="lucide:refresh-cw"
    />
  </div>
  <PlaygroundNotificationsSlideover v-model="isNotificationSlideoverOpen" />
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isPublishSlideoverOpen"
    title="通知"
    description=" "
    :ui="{
      description: 'hidden',
      body: 'space-y-4 sm:space-y-6'
    }"
  >
    <template #body>
      <UPageCard
        v-for="({ icon, title, desc, onSelect }, index) in list"
        :key="index"
        :title="title"
        :description="desc"
        :icon="icon"
        @click="onSelect"
        orientation="horizontal"
        variant="subtle"
        class="cursor-pointer"
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePostStore, useUserStore } from '@/store'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import OverlayPublishProduct from '../overlay/OverlayPublishProduct.vue'
import { getPlaygroundPostsAPI } from '@/apis/playground'

const activeTab = defineModel<
  'myCollege' | 'latest' | 'friend' | 'hot' | 'market' | 'partner'
>()
const allPostLoaded = defineModel<boolean>('allPostLoaded')
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const publishProductOverlay = overlay.create(OverlayPublishProduct)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const isNotificationSlideoverOpen = ref(false)
const isPublishSlideoverOpen = ref(false)
const tabItems = [
  {
    label: '我的校园',
    value: 'myCollege'
  },
  // {
  //   label: '好友',
  //   value: 'friend'
  // },
  {
    label: '热门',
    value: 'hot'
  },
  {
    label: '最新',
    value: 'latest'
  },
  {
    label: '集市',
    value: 'market'
  },
  {
    label: '搭子',
    value: 'market'
  }
]
const toast = useToast()
const list = [
  {
    icon: 'lucide:pencil-line',
    title: '发动态',
    desc: '分享此刻的心情',
    onSelect: () =>
      publisherOverlay.open({ action: 'post', targetId: userInfo.value.id })
  },
  {
    icon: 'lucide:shopping-bag',
    title: '发闲置',
    desc: '自己拍图卖 · 啥都能换钱',
    onSelect: () => {
      if (!userInfo.value.profile.college) {
        return toast.add({
          title: '请完善个人资料中的大学信息',
          color: 'error',
          icon: 'lucide:annoyed'
        })
      }

      publishProductOverlay.open({
        action: 'publishProduct',
        targetId: userInfo.value.id
      })
    }
  },
  {
    icon: 'lucide:user-search',
    title: '找搭子',
    desc: '发现志同道合的伙伴',
    onSelect: () => {}
  }
]

const getLatestData = async () => {
  const posts = (
    await getPlaygroundPostsAPI(
      'latest',
      '',
      //  可能在没有任何内容的时候刷新
      postMap.value.latest.posts?.[0]?._id || ''
    )
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
