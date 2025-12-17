<template>
  <UDashboardNavbar title="大厅" :toggle="false">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #right>
      <!-- <UButton
        icon="lucide:calendar-check"
        variant="ghost"
        @click="isDailyQuestsSlideoverOpen = true"
      ></UButton> -->
      <UButton variant="ghost" @click="isNotificationsSlideoverOpen = true">
        <UChip :show="Boolean(unreadHomeNotificationCount)" color="error" inset>
          <UIcon name="i-lucide-bell" class="text-primary size-5" />
        </UChip>
      </UButton>
      <IndexThemePicker />
      <UButton
        @click="isFilterOverlayOpen = true"
        icon="lucide:filter"
        variant="ghost"
      />
    </template>
  </UDashboardNavbar>

  <!-- 通知 -->
  <IndexNotificationsSlideover v-model="isNotificationsSlideoverOpen" />
  <!-- 过滤器 -->
  <IndexFilter v-model="isFilterOverlayOpen" />
  <!-- 每日任务 -->
  <!-- <IndexDailyQuestsSlideover v-model="isDailyQuestsSlideoverOpen" /> -->
</template>

<script lang="ts" setup>
import { useNotificationsStore, useUserStore } from '@/store'
import { useColorMode } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

// const isDailyQuestsSlideoverOpen = ref(false)
const isFilterOverlayOpen = ref(false)
const { userInfo } = storeToRefs(useUserStore())
const { unreadHomeNotificationCount } = storeToRefs(useNotificationsStore())
const { store } = useColorMode()
const getNextTheme = () =>
  store.value === 'auto'
    ? document.documentElement.classList[0] === 'dark'
      ? 'light'
      : 'dark'
    : store.value === 'dark'
      ? 'light'
      : 'dark'
const nextTheme = ref<'light' | 'dark' | 'auto'>(getNextTheme())
const isNotificationsSlideoverOpen = ref(false)

watch(store, () =>
  // 在定时器中获取的才是最新的
  setTimeout(() => (nextTheme.value = getNextTheme()))
)

watch(isNotificationsSlideoverOpen, v => {
  if (v && unreadHomeNotificationCount.value) {
    unreadHomeNotificationCount.value = 0
    localStorage.setItem(
      `unreadHomeNotificationCount-${userInfo.value.id}`,
      '0'
    )
  }
})
</script>
