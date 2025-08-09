<template>
  <UApp :toaster="{ position: 'top-center' }">
    <!-- header -->
    <div
      v-if="userInfo && !remoteRoomInfo.roomId"
      class="flex h-16 justify-center border-b border-b-zinc-700"
    >
      <div class="flex items-center justify-between px-4">
        <UButton
          icon="ic:baseline-menu"
          variant="ghost"
          :ui="{ leadingIcon: '' }"
        ></UButton>
        <ThemePicker></ThemePicker>
      </div>
    </div>

    <div class="">
      <div class="flex justify-center">
        <UNavigationMenu
          v-if="userInfo && isDesktop && !remoteRoomInfo.roomId"
          collapsed
          orientation="vertical"
          tooltip
          class="h-full min-h-[calc(100vh-4rem)] border-r border-r-zinc-700 p-4"
          :ui="{
            list: '',
            linkLeadingIcon: 'pr-0',
            item: 'mt-4'
          }"
          :items="navs"
        >
          <template #list-leading>
            <img
              class="size-10"
              style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
              src="/images/logo.svg"
            />
          </template>
        </UNavigationMenu>
        <div
          :class="isDesktop ? '' : 'h-[calc(100vh-4rem)]'"
          class="shrink grow p-4"
        >
          <Suspense>
            <RouterView />
          </Suspense>
        </div>
      </div>
    </div>

    <div
      v-show="userInfo && !remoteRoomInfo.roomId && !isDesktop"
      class="bg-x-drawer fixed bottom-0 w-full"
    >
      <UTabs
        v-model="tab"
        variant="link"
        class="w-full"
        :ui="{
          list: 'bg-x-card flex justify-evenly',
          trigger: 'flex flex-col'
          // leadingIcon: 'size-6'
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
    label: '匹配',
    icon: 'ic:baseline-auto-awesome',
    to: '/match',
    value: 'match'
  },
  {
    label: '房间',
    icon: 'ic:baseline-chair',
    to: '/room',
    value: 'room'
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
