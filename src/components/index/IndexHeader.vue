<template>
  <UDashboardNavbar title="大厅" :toggle="false">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #trailing>
      <UBadge v-if="onlineCount" :label="onlineCount" size="sm" />
    </template>
    <template #right>
      <!-- <UButton
        icon="lucide:calendar-check"
        variant="ghost"
        @click="isDailyQuestsSlideoverOpen = true"
      ></UButton> -->
      <UButton
        color="neutral"
        variant="ghost"
        square
        @click="isNotificationsSlideoverOpen = true"
      >
        <UChip :show="Boolean(unreadHomeNotificationCount)" color="error" inset>
          <UIcon name="i-lucide-bell" class="text-primary size-5" />
        </UChip>
      </UButton>
      <UButton
        @click="isFilterOverlayOpen = true"
        icon="lucide:filter"
        variant="ghost"
      />
      <IndexThemePicker />
      <!-- <UButton
        @click="startViewTransition"
        :icon="nextTheme === 'dark' ? 'lucide:moon' : 'lucide:sun'"
        variant="ghost"
      /> -->
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
const { userInfo, onlineCount } = storeToRefs(useUserStore())
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

// const switchTheme = () => (store.value = nextTheme.value)

// const startViewTransition = (event: MouseEvent) => {
//   if (!document.startViewTransition) {
//     switchTheme()
//     return
//   }

//   const x = event.clientX
//   const y = event.clientY
//   const endRadius = Math.hypot(
//     Math.max(x, window.innerWidth - x),
//     Math.max(y, window.innerHeight - y)
//   )
//   const transition = document.startViewTransition(() => {
//     switchTheme()
//   })
//   transition.ready.then(() => {
//     const duration = 600
//     document.documentElement.animate(
//       {
//         clipPath: [
//           `circle(0px at ${x}px ${y}px)`,
//           `circle(${endRadius}px at ${x}px ${y}px)`
//         ]
//       },
//       {
//         duration: duration,
//         easing: 'cubic-bezier(.76,.32,.29,.99)',
//         pseudoElement: '::view-transition-new(root)'
//       }
//     )
//   })
// }

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
