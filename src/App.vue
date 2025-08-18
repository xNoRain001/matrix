<template>
  <Suspense>
    <UApp v-if="userInfo" :toaster="{ position: 'top-center' }">
      <UDashboardGroup unit="rem" storage="local">
        <UDashboardSidebar
          id="default"
          collapsible
          resizable
          class="bg-elevated/25"
          :ui="{ footer: 'lg:border-t lg:border-default' }"
        >
          <template #header>
            <img
              class="size-8"
              style="filter: drop-shadow(rgba(0, 122, 204, 0.3) 0px 8px 24px)"
              src="/images/logo.svg"
            />
          </template>

          <template #default="{ collapsed }">
            <UDashboardSearchButton
              :collapsed="collapsed"
              class="ring-default bg-transparent"
            />

            <UNavigationMenu
              :collapsed="collapsed"
              :items="navs[0]"
              orientation="vertical"
              tooltip
              popover
            />

            <UNavigationMenu
              :collapsed="collapsed"
              :items="navs[1]"
              orientation="vertical"
              tooltip
              class="mt-auto"
            />
          </template>

          <template #footer="{ collapsed }">
            <IndexUserMenu :collapsed="collapsed" />
          </template>
        </UDashboardSidebar>

        <UDashboardSearch :groups="groups" />

        <RouterView />

        <IndexNotificationsSlideover />

        <!-- 移动端底部导航栏 -->
        <IndexFooter v-if="!isDesktop"></IndexFooter>
      </UDashboardGroup>
    </UApp>

    <!-- 注册登录和重置密码等内容 -->
    <UApp v-else :toaster="{ position: 'top-center' }">
      <RouterView />
    </UApp>
  </Suspense>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserInfoStore } from './store'
import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import ModalLogout from './components/modal/ModalLogout.vue'
import DrawerLogout from './components/drawer/DrawerLogout.vue'

const overlay = useOverlay()
const logoutModal = overlay.create(ModalLogout)
const logoutDrawer = overlay.create(DrawerLogout)
const isDesktop = useMediaQuery('(min-width: 768px)')
const navs = [
  [
    {
      label: '大厅',
      icon: 'lucide:cat',
      to: '/'
      // badge: 4,
    },
    {
      label: '消息',
      icon: 'lucide:message-circle',
      to: '/inbox'
    },
    {
      label: '我的',
      icon: 'ic:baseline-face',
      to: '/profile/user-info',
      defaultOpen: true,
      type: 'trigger',
      children: [
        {
          label: '修改资料',
          to: '/profile/user-info',
          exact: true
        },
        {
          label: '修改密码',
          to: '/profile/update-password'
        },
        {
          label: '通知',
          to: '/profile/notifications'
        },
        {
          label: '登出',
          onSelect: () => {
            isDesktop.value ? logoutModal.open() : logoutDrawer.open()
          }
        }
      ]
    }
  ],
  [
    {
      label: '反馈',
      icon: 'i-lucide-message-circle',
      to: '',
      target: '_blank'
    },
    {
      label: '帮助和支持',
      icon: 'i-lucide-info',
      to: '',
      target: '_blank'
    }
  ]
] satisfies NavigationMenuItem[][]
const groups = computed(() => [
  {
    id: 'links',
    label: '访问',
    items: navs.flat()
  }
])
const { userInfo } = storeToRefs(useUserInfoStore())
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
