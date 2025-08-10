<template>
  <UApp :toaster="{ position: 'top-center' }">
    <!-- header -->
    <div
      v-if="userInfo && !remoteRoomInfo.roomId"
      class="bg-default fixed top-0 h-16 w-full border-b border-b-(--ui-border)"
    >
      <div class="flex h-full items-center justify-between px-4">
        <img
          class="size-10"
          style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
          src="/images/logo.svg"
        />
        <ThemePicker></ThemePicker>
      </div>
    </div>

    <!-- drawer -->
    <UNavigationMenu
      v-if="userInfo && isDesktop && !remoteRoomInfo.roomId"
      collapsed
      orientation="vertical"
      tooltip
      class="fixed top-16 h-full border-r border-r-(--ui-border) p-4"
      :ui="{
        item: 'mb-4'
      }"
      :items="navs"
    ></UNavigationMenu>

    <!-- page -->
    <div
      class="mt-16 p-4"
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
      v-show="userInfo && !remoteRoomInfo.roomId && !isDesktop"
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
  </UApp>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRoomStore, useUserInfoStore } from './store'
import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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
const { remoteRoomInfo } = storeToRefs(useRoomStore())
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
</script>
