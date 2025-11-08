<template>
  <ProfileSpace
    class="pb-16"
    v-if="isMobile"
    :target-id="userInfo.id"
    :target-profile="userInfo.profile"
  />
  <UDashboardPanel v-else id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="我的">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div
        class="mx-auto flex w-full flex-col gap-4 sm:gap-6 lg:max-w-2xl lg:gap-12"
      >
        <RouterView />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import type { NavigationMenuItem } from '@nuxt/ui'
import OverlayLogout from '@/components/overlay/OverlayLogout.vue'

const overlay = useOverlay()
const logoutOverlay = overlay.create(OverlayLogout)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const links = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      to: '/profile/user-info',
      exact: true
    },
    {
      icon: 'lucide:user-round',
      label: '情绪切片',
      to: '/profile/space'
    },
    {
      icon: 'lucide:bell',
      label: '通知管理',
      to: '/profile/notifications'
    },
    {
      icon: 'lucide:palette',
      label: '主题管理',
      to: '/profile/theme'
    },
    {
      icon: 'lucide:database',
      label: '数据管理',
      to: '/profile/data-manager'
    }
    // {
    //   icon: 'lucide:shield',
    //   label: '修改密码',
    //   to: '/profile/update-password'
    // }
  ],
  [
    // {
    //   label: '注销账号',
    //   icon: 'lucide:ban',
    //   to: '/profile/logoff'
    // },
    {
      label: '退出登录',
      icon: 'lucide:log-out',
      onSelect: () => logoutOverlay.open()
    }
  ]
] satisfies NavigationMenuItem[][]
</script>
