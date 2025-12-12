<template>
  <UDashboardNavbar title="广场" :toggle="false" class="border-b-0">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #trailing>
      <UTabs
        :ui="{
          root: 'absolute left-1/2 -translate-x-1/2'
        }"
        :content="false"
        :items="tabItems"
        v-model="activeTab"
      />
    </template>

    <template #right>
      <UButton
        v-if="!isMobile"
        @click="onRefreshPlayground"
        variant="ghost"
        icon="lucide:refresh-cw"
      />
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
  <UTabs
    v-if="activeTab === 'college'"
    :ui="{
      root: 'px-4 sm:px-6',
      list: 'gap-4 px-0 sm:gap-6',
      trigger: 'px-0'
    }"
    :content="false"
    variant="link"
    :items="collegeItems"
    v-model="activeCollegeTab"
  />

  <PlaygroundNotificationsSlideover v-model="isNotificationSlideoverOpen" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePostStore, useUserStore } from '@/store'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import { useRefreshPlayground } from '@/hooks'

const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { activeTab, activeCollegeTab, postMap } = storeToRefs(usePostStore())
const isNotificationSlideoverOpen = ref(false)
const tabItems = [
  {
    label: '好友',
    value: 'friend'
  },
  {
    label: '广场',
    value: 'latest'
  },
  {
    label: '校园',
    value: 'college'
  }
]
const collegeItems = [
  {
    label: '动态',
    value: 'myCollege'
  },
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
  useRefreshPlayground(activeTab, activeCollegeTab, postMap, userInfo, toast)
</script>
