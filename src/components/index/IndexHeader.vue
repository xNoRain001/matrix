<template>
  <UDashboardNavbar title="大厅" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #trailing
      ><UBadge v-if="onlineCount" :label="onlineCount"></UBadge>
    </template>
    <template #right>
      <UButton
        :icon="isFullScreen ? 'lucide:minimize' : 'lucide:maximize'"
        variant="ghost"
        @click="onScreenSize"
      ></UButton>
      <UButton
        color="neutral"
        variant="ghost"
        square
        @click="isNotificationsSlideoverOpen = true"
      >
        <UChip :show="false" color="error" inset>
          <UIcon name="i-lucide-bell" class="text-primary size-5" />
        </UChip>
      </UButton>
      <UButton
        @click="isFilterOverlayOpen = true"
        icon="lucide:filter"
        color="neutral"
        variant="ghost"
        :ui="{ leadingIcon: 'text-primary', label: 'font-semibold' }"
      ></UButton>
      <IndexThemePicker></IndexThemePicker>
      <UButton
        @click="startViewTransition"
        :icon="nextTheme === 'dark' ? 'lucide:moon' : 'lucide:sun'"
        variant="ghost"
        color="neutral"
        :ui="{ leadingIcon: 'text-primary' }"
      ></UButton>
    </template>
  </UDashboardNavbar>

  <!-- 通知 -->
  <IndexNotificationsSlideover v-model="isNotificationsSlideoverOpen" />
</template>

<script lang="ts" setup>
import { useExitFullscreen, useRequestFullscreen } from '@/hooks'
import { useUserStore } from '@/store'
import { useColorMode } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

const isFullScreen = ref(false)
const isFilterOverlayOpen = defineModel<boolean>()
const { onlineCount } = storeToRefs(useUserStore())
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
  const v = !isFullScreen.value
  isFullScreen.value = v

  if (v) {
    useRequestFullscreen()
  } else {
    useExitFullscreen()
  }
}

watch(store, () =>
  // 在定时器中获取的才是最新的
  setTimeout(() => (nextTheme.value = getNextTheme()))
)
</script>
