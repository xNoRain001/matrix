<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="我的">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <!-- 移动端卡片 -->
      <div v-if="isMobile" class="flex w-full flex-col p-4 sm:p-6">
        <div class="mb-4 flex items-center">
          <UAvatar :alt="userInfo?.nickname?.[0]" size="3xl" />
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
          :ui="{ container: 'gap-y-0 py-0 sm:py-0' }"
        >
          <div
            v-for="{ label, icon, onSelect } in items"
            @click="onSelect"
            class="flex h-12 items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <UIcon :name="icon" class="size-5" />
              <div>{{ label }}</div>
            </div>
            <UIcon name="lucide:chevron-right" class="size-5"></UIcon>
          </div>
        </UPageCard>
      </div>
      <UDashboardToolbar v-else>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div v-if="isMobile">
        <MProfileUserInfo v-model="isOpenUserInfoSliderover"></MProfileUserInfo>
        <MProfileUpdatePassword
          v-model="isOpenUpdatePasswordSliderover"
        ></MProfileUpdatePassword>
        <MProfileNotifications
          v-model="isOpenNotificationsSliderover"
        ></MProfileNotifications>
      </div>
      <div
        v-else
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
import DrawerLogout from '@/components/drawer/DrawerLogout.vue'
import { ref } from 'vue'

const overlay = useOverlay()
const logoutModal = overlay.create(ModalLogout)
const logoutDrawer = overlay.create(DrawerLogout)
const isOpenUserInfoSliderover = ref(false)
const isOpenUpdatePasswordSliderover = ref(false)
const isOpenNotificationsSliderover = ref(false)
const cards = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      onSelect: () => (isOpenUserInfoSliderover.value = true)
    },
    {
      icon: 'lucide:bell',
      label: '通知',
      onSelect: () => (isOpenNotificationsSliderover.value = true)
    }
  ],
  [
    {
      icon: 'lucide:palette',
      label: '主题',
      onSelect: () => {}
    },
    {
      icon: 'lucide:sun-moon',
      label: '外观',
      onSelect: () => {}
    }
  ],
  [
    {
      icon: 'lucide:shield',
      label: '修改密码',
      onSelect: () => (isOpenUpdatePasswordSliderover.value = true)
    },
    {
      icon: 'lucide:log-out',
      label: '退出登录',
      onSelect: () => logoutDrawer.open()
    }
  ]
]
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
