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
import { usePostStore } from '@/store'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import { getPlaygroundPostsAPI } from '@/apis/playground'

const activeTab = defineModel<
  'myCollege' | 'latest' | 'friend' | 'hot' | 'market' | 'partner'
>()
const allPostLoaded = defineModel<boolean>('allPostLoaded')
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const { postMap } = storeToRefs(usePostStore())
const isNotificationSlideoverOpen = ref(false)
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
