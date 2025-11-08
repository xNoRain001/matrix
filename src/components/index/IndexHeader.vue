<template>
  <UDashboardNavbar title="大厅" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #trailing>
      <UBadge v-if="onlineCount" :label="onlineCount" />
    </template>
    <template #right>
      <UButton
        v-if="!isMobile"
        :icon="isFullScreen ? 'lucide:minimize' : 'lucide:maximize'"
        variant="ghost"
        @click="onScreenSize"
      />
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
      <UButton
        @click="startViewTransition"
        :icon="nextTheme === 'dark' ? 'lucide:moon' : 'lucide:sun'"
        variant="ghost"
      />
    </template>
  </UDashboardNavbar>

  <!-- 通知 -->
  <IndexNotificationsSlideover v-model="isNotificationsSlideoverOpen" />
  <USlideover
    v-if="isMobile"
    title="开启全屏"
    description=" "
    :ui="{
      description: 'hidden'
    }"
    v-model:open="isFullscreenSlideoverOpen"
  >
    <template #body>
      <img src="/images/fullscreen.webp" />
    </template>
  </USlideover>
  <!-- <IndexDailyQuestsSlideover v-model="isDailyQuestsSlideoverOpen" /> -->
</template>

<script lang="ts" setup>
import { useExitFullscreen, useRequestFullscreen } from '@/hooks'
import { useNotificationsStore, useUserStore } from '@/store'
import { useColorMode } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

const isFullScreen = ref(false)
const isFullscreenSlideoverOpen = ref(false)
// const isDailyQuestsSlideoverOpen = ref(false)
const isFilterOverlayOpen = defineModel<boolean>()
const { userInfo, onlineCount, isMobile } = storeToRefs(useUserStore())
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
const toast = useToast()

const switchTheme = () => (store.value = nextTheme.value)

const startViewTransition = (event: MouseEvent) => {
  if (!document.startViewTransition) {
    switchTheme()
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )
  const transition = document.startViewTransition(() => {
    switchTheme()
  })
  transition.ready.then(() => {
    const duration = 600
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: duration,
        easing: 'cubic-bezier(.76,.32,.29,.99)',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  })
}

const onScreenSize = () => {
  if (isMobile.value) {
    isFullscreenSlideoverOpen.value = true
    return
  }

  const v = !isFullScreen.value
  isFullScreen.value = v

  if (v) {
    useRequestFullscreen(toast)
  } else {
    useExitFullscreen(toast)
  }
}

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
