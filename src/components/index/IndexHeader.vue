<template>
  <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UTooltip text="通知" :shortcuts="['N']">
        <UButton
          color="neutral"
          variant="ghost"
          square
          @click="isNotificationsSlideoverOpen = true"
        >
          <UChip color="error" inset>
            <UIcon name="i-lucide-bell" class="text-primary size-5 shrink-0" />
          </UChip>
        </UButton>
      </UTooltip>

      <IndexThemePicker></IndexThemePicker>
      <UButton
        @click="startViewTransition"
        :icon="store === 'dark' ? 'lucide:moon' : 'lucide:sun'"
        variant="ghost"
        color="neutral"
        :ui="{ leadingIcon: 'text-primary' }"
      ></UButton>
    </template>
  </UDashboardNavbar>
</template>

<script lang="ts" setup>
import { useDashboard } from '@/hooks'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

const { isNotificationsSlideoverOpen } = useDashboard()
const { store } = useColorMode()
const nextTheme = computed(() => (store.value === 'dark' ? 'light' : 'dark'))

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
</script>
