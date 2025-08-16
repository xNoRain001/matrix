<template>
  <UApp :toaster="{ position: 'top-center' }">
    <!-- header -->
    <div
      v-if="userInfo"
      class="bg-default sticky top-0 h-16 w-full border-b border-b-(--ui-border)"
    >
      <div class="flex h-full items-center justify-between px-4">
        <img
          class="size-8"
          style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
          src="/images/logo.svg"
        />
        <div class="flex gap-2">
          <ThemePicker></ThemePicker>
          <UButton
            @click="startViewTransition"
            :icon="store === 'dark' ? 'lucide:moon' : 'lucide:sun'"
            variant="ghost"
            color="neutral"
            :ui="{ leadingIcon: 'text-primary' }"
          ></UButton>
        </div>
      </div>
    </div>

    <!-- drawer -->
    <UNavigationMenu
      v-if="userInfo && isDesktop"
      collapsed
      orientation="vertical"
      tooltip
      class="fixed top-16 h-full border-r border-r-(--ui-border) p-4"
      :ui="{
        item: 'mb-4'
      }"
      :items="navs"
    >
    </UNavigationMenu>

    <!-- page -->
    <div
      class="p-4"
      :class="
        isDesktop
          ? 'ml-18 min-h-[calc(100vh-4rem)] max-w-[calc(100vw-4.5rem)]'
          : 'mb-16 min-h-[calc(100vh-8rem)]'
      "
    >
      <Suspense>
        <RouterView />
      </Suspense>
    </div>

    <!-- footer -->
    <div
      v-show="userInfo && !isDesktop"
      class="bg-default fixed bottom-0 h-16 w-full border-t border-t-(--ui-border)"
    >
      <UTabs
        v-model="tab"
        variant="link"
        :ui="{
          list: 'flex justify-evenly  border-none',
          indicator: 'hidden',
          trigger: 'flex flex-col text-xs'
        }"
        :content="false"
        :items="menus"
      />
    </div>

    <div
      v-if="userInfo && isDesktop"
      class="bg-accented fixed bottom-4 left-4 flex items-center gap-2 rounded-xl p-4"
    >
      <div
        @click="router.replace('/profile/user-info')"
        class="hover:bg-elevated flex gap-2 rounded-full"
      >
        <UChip inset color="primary">
          <UAvatar
            class="bg-default"
            :text="userInfo.nickname[0] || ''"
            size="md"
          />
        </UChip>
        <div class="w-40">
          <div
            class="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap"
          >
            {{ userInfo.nickname }}
          </div>
          <div class="text-muted text-xs">在线</div>
        </div>
      </div>
      <UTooltip text="静音">
        <UButton
          icon="lucide:mic"
          color="neutral"
          variant="ghost"
          :ui="{ leadingIcon: 'text-primary' }"
        ></UButton>
      </UTooltip>
      <UTooltip text="耳机静音">
        <UButton
          icon="lucide:volume-2"
          color="neutral"
          variant="ghost"
          :ui="{ leadingIcon: 'text-primary' }"
        ></UButton>
      </UTooltip>
      <UTooltip text="用户设置">
        <UButton
          @click="router.push('/profile')"
          icon="lucide:settings"
          color="neutral"
          variant="ghost"
          :ui="{ leadingIcon: 'text-primary' }"
        ></UButton>
      </UTooltip>
    </div>
  </UApp>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserInfoStore } from './store'
import { useColorMode, useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { store } = useColorMode()
const nextTheme = computed(() => (store.value === 'dark' ? 'light' : 'dark'))
const isDesktop = useMediaQuery('(min-width: 768px)')
const menus = [
  {
    label: '大厅',
    icon: 'ic:baseline-auto-awesome',
    to: '/hall',
    value: 'hall'
  },
  {
    label: '我的',
    icon: 'ic:baseline-face',
    to: '/profile',
    value: 'profile'
  }
]
const navs = [menus]
const { userInfo } = storeToRefs(useUserInfoStore())
const route = useRoute()
const router = useRouter()
const tab = computed({
  get() {
    return route.meta.tab as string
  },
  set(tab) {
    router.push(`/${tab}`)
  }
})

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

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  z-index: 9999;
}
::view-transition-old(root) {
  z-index: 1;
}
</style>
