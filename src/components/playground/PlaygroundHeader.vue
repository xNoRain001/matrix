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
  <div class="flex items-center justify-between px-4 sm:px-6">
    <UTabs
      :ui="{
        list: 'gap-4 px-0 sm:gap-6',
        trigger: 'px-0'
      }"
      :content="false"
      variant="link"
      :items="tabItems"
      v-model="activeTab"
    />
    <UButton
      v-if="!isMobile"
      @click="onRefreshPlayground"
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
import { useRefreshPlayground } from '@/hooks'

const activeTab = defineModel<
  'myCollege' | 'latest' | 'friend' | 'market' | 'partner'
>()
const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const { isMobile, userInfo } = storeToRefs(useUserStore())
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
  }
  // {
  //   label: '搭子',
  //   value: 'partner'
  // },
  // {
  //   label: '兼职',
  //   value: ''
  // },
  // {
  //   label: '建议',
  //   value: ''
  // }
]
const toast = useToast()

const onRefreshPlayground = async () =>
  useRefreshPlayground(activeTab, postMap, userInfo, toast)
</script>
