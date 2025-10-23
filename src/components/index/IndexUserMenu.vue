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
        avatar: {
          src: avatarURL,
          alt: userInfo.profile.nickname[0]
        },
        label: collapsed ? undefined : userInfo.profile.nickname,
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
import { useColorMode } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, reactive } from 'vue'
import { appConfig as _appConfig } from '@/const'
import { useUpdateTheme } from '@/hooks'
import OverlayLogout from '../overlay/OverlayLogout.vue'
import colors from 'tailwindcss/colors'

defineProps<{
  collapsed?: boolean
}>()
const overlay = useOverlay()
const logoutOverlay = overlay.create(OverlayLogout)
const { store } = useColorMode()
const appConfig = reactive(_appConfig)
const { userInfo, avatarURL } = storeToRefs(useUserStore())
const items = computed<DropdownMenuItem[]>(() => [
  [
    {
      type: 'label',
      label: userInfo.value.profile.nickname,
      avatar: {
        src: avatarURL.value,
        alt: userInfo.value.profile.nickname
      }
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
          label: '亮色',
          icon: 'lucide:sun',
          type: 'checkbox',
          checked: store.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()
            store.value = 'light'
          }
        },
        {
          label: '暗色',
          icon: 'lucide:moon',
          type: 'checkbox',
          checked: store.value === 'dark',
          onSelect(e: Event) {
            e.preventDefault()
            store.value = 'dark'
          }
        },
        {
          label: '系统',
          icon: 'lucide:monitor',
          type: 'checkbox',
          checked: store.value === 'auto',
          onSelect(e: Event) {
            e.preventDefault()
            store.value = 'auto'
          }
        }
      ]
    }
  ],
  [
    {
      label: '登出',
      icon: 'i-lucide-log-out',
      onSelect: () => logoutOverlay.open()
    }
  ]
])
</script>
