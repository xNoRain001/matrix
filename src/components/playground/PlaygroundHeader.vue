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
        @click="publisherOverlay.open()"
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
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePostStore, useUserStore } from '@/store'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import {
  getPlaygroundPostsAPI,
  getPlaygroundProductsAPI
} from '@/apis/playground'

const activeTab = defineModel<
  'myCollege' | 'latest' | 'friend' | 'market' | 'partner'
>()
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const { userInfo } = storeToRefs(useUserStore())
const { postMap } = storeToRefs(usePostStore())
const isNotificationSlideoverOpen = ref(false)
const tabItems = [
  {
    label: '广场',
    value: 'latest'
  },
  {
    label: '我的校园',
    value: 'myCollege'
  },
  // {
  //   label: '好友',
  //   value: 'friend'
  // },
  {
    label: '集市',
    value: 'market'
  },
  {
    label: '搭子',
    value: 'partner'
  }
]
const toast = useToast()

const getLatestData = async () => {
  const _activeTab = activeTab.value

  if (_activeTab === 'latest') {
    const posts = (
      await getPlaygroundPostsAPI(
        '',
        //  可能在没有帖子的情况下刷新
        postMap.value.latest.posts?.[0]?._id || ''
      )
    ).data
    const { length } = posts

    if (length) {
      postMap.value.latest.posts.unshift(...posts)
    } else {
      toast.add({
        title: '暂时没有新内容',
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  } else if (_activeTab === 'myCollege') {
    const posts = (
      await getPlaygroundPostsAPI(
        '',
        //  可能在没有帖子的情况下刷新
        postMap.value.myCollege.posts?.[0]?._id || '',
        userInfo.value.profile.college
      )
    ).data
    const { length } = posts

    if (length) {
      postMap.value.myCollege.posts.unshift(...posts)
    } else {
      toast.add({
        title: '暂时没有新内容',
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  } else if (_activeTab === 'market') {
    const products = (
      await getPlaygroundProductsAPI(
        userInfo.value.profile.college,
        '',
        postMap.value.market.products?.[0]?._id || ''
      )
    ).data
    const { length } = products

    if (length) {
      postMap.value.market.products.unshift(...products)
    } else {
      toast.add({
        title: '暂时没有新内容',
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  }
}
</script>
