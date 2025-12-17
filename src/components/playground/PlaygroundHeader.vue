<template>
  <UDashboardNavbar :toggle="false" class="border-b-0">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #trailing>
      <UTabs
        :ui="{
          root: 'absolute left-1/2 -translate-x-1/2',
          list: 'px-0 border-none gap-4 sm:gap-6',
          trigger: 'px-0 font-semibold text-base',
          indicator: 'h-1'
        }"
        :content="false"
        variant="link"
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

      <UButton variant="ghost" @click="isNotificationSlideoverOpen = true">
        <UChip
          :show="
            Boolean(
              unreadPlaygroundNotificationCount.like ||
                unreadPlaygroundNotificationCount.comment
            )
          "
          color="error"
          inset
        >
          <UIcon name="i-lucide-bell" class="text-primary size-5" />
        </UChip>
      </UButton>
      <UButton
        icon="lucide:pencil-line"
        variant="ghost"
        @click="publisherOverlay.open()"
      />
    </template>
  </UDashboardNavbar>
  <div class="flex justify-center px-4 sm:px-6">
    <UTabs
      v-if="activeTab === 'college'"
      :ui="{
        list: 'px-0 border-none gap-4 sm:gap-6',
        trigger: 'px-0 font-semibold text-base',
        indicator: 'h-1'
      }"
      :content="false"
      variant="link"
      :items="collegeItems"
      v-model="activeCollegeTab"
    />
  </div>

  <PlaygroundNotificationsSlideover v-model="isNotificationSlideoverOpen" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore, usePostStore, useUserStore } from '@/store'
import OverlayPublisher from '@/components/overlay/OverlayPublisher.vue'
import { useRefreshPlayground } from '@/hooks'

const overlay = useOverlay()
const publisherOverlay = overlay.create(OverlayPublisher)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { activeTab, activeCollegeTab, postMap } = storeToRefs(usePostStore())
const { unreadPlaygroundNotificationCount } = storeToRefs(
  useNotificationsStore()
)
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
  //   label: '失物招领',
  //   value: 'lostAndFound'
  // },
  // {
  //   label: '搭子',
  //   value: 'partner'
  // },
  // {
  //   label: '兼职的英文表述',
  //   value: 'part-timeJob'
  // },
  // {
  //   label: '建议',
  //   value: 'suggestion'
  // }
]
const toast = useToast()

const onRefreshPlayground = async () =>
  useRefreshPlayground(activeTab, activeCollegeTab, postMap, userInfo, toast)
</script>
