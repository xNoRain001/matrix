<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="我的">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar v-if="isDesktop">
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
      <!-- 移动端卡片 -->
      <div v-else class="flex w-full flex-col p-4">
        <div class="mb-4 flex items-center">
          <UAvatar :text="userInfo?.nickname?.[0]" class="size-14" />
          <div class="ml-4 w-[calc(100%-4rem)]">
            <span class="text-xl font-semibold">您好</span>
            <div class="overflow-hidden text-ellipsis whitespace-nowrap">
              {{ userInfo?.nickname }}
            </div>
          </div>
        </div>

        <UPageCard
          v-for="items in cards"
          variant="subtle"
          class="mb-4"
          :ui="{ container: 'gap-y-0' }"
        >
          <div
            v-for="{ to, label, icon, onSelect } in items"
            @click="onSelect ? onSelect() : router.replace(to)"
            class="flex h-12 items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <UIcon :name="icon" class="size-5" />
              <div>{{ label }}</div>
            </div>
            <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
          </div>
        </UPageCard>
        <RouterView></RouterView>
      </div>
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
import { useUserInfoStore } from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import type { NavigationMenuItem } from '@nuxt/ui'
import ModalLogout from '@/components/modal/ModalLogout.vue'
import DrawerLogout from '@/components/drawer/DrawerLogout.vue'

const isDesktop = useMediaQuery('(min-width: 768px)')
const overlay = useOverlay()
const logoutModal = overlay.create(ModalLogout)
const logoutDrawer = overlay.create(DrawerLogout)
const cards = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      to: '/profile/user-info'
    },
    {
      icon: 'lucide:bell',
      label: '通知',
      to: '/profile/notifications'
    }
  ],
  [
    {
      icon: 'lucide:palette',
      label: '主题',
      to: '/profile'
    },
    {
      icon: 'lucide:sun-moon',
      label: '外观',
      to: '/profile'
    }
  ],
  [
    {
      icon: 'lucide:shield',
      label: '修改密码',
      to: '/profile/update-password'
    },
    {
      icon: 'lucide:log-out',
      label: '退出登录',
      onSelect: () => logoutDrawer.open()
    }
  ]
]
const { userInfo } = storeToRefs(useUserInfoStore())
const router = useRouter()
const links = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      to: '/profile/user-info',
      exact: true
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
