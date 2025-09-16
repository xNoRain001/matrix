<template>
  <ProfileSpace class="pb-16" v-if="isMobile"></ProfileSpace>
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
import ModalLogout from '@/components/modal/ModalLogout.vue'

const overlay = useOverlay()
const logoutModal = overlay.create(ModalLogout)
const { isMobile } = storeToRefs(useUserStore())
const links = [
  [
    {
      icon: 'lucide:user-round',
      label: '空间',
      to: '/profile/space',
      exact: true
    },
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      to: '/profile/user-info'
    },
    {
      icon: 'lucide:shield',
      label: '修改密码',
      to: '/profile/update-password'
    },
    {
      icon: 'lucide:bell',
      label: '通知',
      to: '/profile/notifications'
    },
    {
      icon: 'lucide:database',
      label: '数据管理',
      to: '/profile/fixer'
    }
  ],
  [
    {
      label: '登出',
      icon: 'lucide:log-out',
      onSelect: () => logoutModal.open()
    }
  ]
] satisfies NavigationMenuItem[][]
</script>
