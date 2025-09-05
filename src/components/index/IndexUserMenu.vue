<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)'
    }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item: { chip } }">
      <span
        :style="{
          '--chip-light': colors[chip]?.[500],
          '--chip-dark': colors[chip]?.[400]
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
      ></span>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { neutralColors, primaryColors, radiuses } from '@/const'
import { useUserStore } from '@/store'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useColorMode, useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { appConfig as _appConfig } from '@/const'
import { useUpdateTheme } from '@/hooks'
import ModalLogout from '../modal/ModalLogout.vue'
import DrawerLogout from '../drawer/DrawerLogout.vue'
import colors from 'tailwindcss/colors'

defineProps<{
  collapsed?: boolean
}>()

const isDesktop = useMediaQuery('(min-width: 768px)')
const overlay = useOverlay()
const logoutModal = overlay.create(ModalLogout)
const logoutDrawer = overlay.create(DrawerLogout)
const { store } = useColorMode()
const appConfig = reactive(_appConfig)
const { userInfo } = storeToRefs(useUserStore())
const user = ref({
  name: userInfo.value.nickname,
  avatar: {
    // src: 'https://github.com/benjamincanac.png',
    alt: userInfo.value.nickname
  }
})
const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value.name,
      avatar: user.value.avatar
    }
  ],
  [
    {
      label: '我的',
      icon: 'i-lucide-user',
      to: '/profile/user-info'
    }
  ],
  [
    {
      label: '主题',
      icon: 'i-lucide-palette',
      children: [
        {
          label: '主题色',
          slot: 'chip',
          chip: appConfig.ui.colors.primary,
          content: {
            align: 'center',
            collisionPadding: 16
          },
          children: primaryColors.map(color => ({
            label: color,
            chip: color,
            slot: 'chip',
            checked: appConfig.ui.colors.primary === color,
            type: 'checkbox',
            onSelect: e => {
              e.preventDefault()
              useUpdateTheme('primary', appConfig, color)
            }
          }))
        },
        {
          label: '中性色',
          slot: 'chip',
          chip: appConfig.ui.colors.neutral,
          content: {
            align: 'end',
            collisionPadding: 16
          },
          children: neutralColors.map(color => ({
            label: color,
            chip: color,
            slot: 'chip',
            type: 'checkbox',
            checked: appConfig.ui.colors.neutral === color,
            onSelect: e => {
              e.preventDefault()
              useUpdateTheme('neutral', appConfig, color)
            }
          }))
        },
        {
          label: '圆角',
          slot: 'chip',
          chip: appConfig.theme.radius,
          content: {
            align: 'end',
            collisionPadding: 16
          },
          children: radiuses.map(radius => ({
            label: radius + '',
            chip: radius,
            slot: 'chip',
            type: 'checkbox',
            checked: appConfig.theme.radius === radius,
            onSelect: e => {
              e.preventDefault()
              useUpdateTheme('radius', appConfig, radius)
            }
          }))
        }
      ]
    },
    {
      label: '外观',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: '亮',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: store.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()
            store.value = 'light'
          }
        },
        {
          label: '暗',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: store.value === 'dark',
          onSelect(e: Event) {
            e.preventDefault()
            store.value = 'dark'
          }
        }
      ]
    }
  ],
  [
    {
      label: '登出',
      icon: 'i-lucide-log-out',
      onSelect: () => {
        isDesktop.value ? logoutModal.open() : logoutDrawer.open()
      }
    }
  ]
])
</script>
