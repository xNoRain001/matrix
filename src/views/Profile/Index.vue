<template>
  <div class="flex flex-col items-center">
    <div class="w-full">
      <div class="ml-6 flex items-center" v-if="!isDesktop">
        <UAvatar :text="userInfo?.nickname?.[0]" size="3xl" />
        <div class="ml-4 w-[calc(100%-5.5rem)]">
          <span class="text-xl font-semibold">您好</span>
          <div class="overflow-hidden text-ellipsis whitespace-nowrap">
            {{ userInfo?.nickname }}
          </div>
        </div>
      </div>

      <div v-for="items in cards" class="bg-elevated mt-4 rounded-xl p-4">
        <div
          v-for="{ to, label, icon } in items"
          @click="router.replace(to)"
          class="hover:bg-accented flex h-12 cursor-pointer items-center justify-between rounded-xl px-2"
        >
          <div class="flex items-center">
            <UIcon :name="icon" class="size-5" />
            <div class="ml-2 text-sm font-semibold">{{ label }}</div>
          </div>
          <UIcon name="lucide:chevron-right" class="size-5" />
        </div>
      </div>
    </div>
  </div>

  <RouterView></RouterView>
</template>

<script lang="ts" setup>
import { useUserInfoStore } from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const isDesktop = useMediaQuery('(min-width: 768px)')
const cards = [
  [
    {
      icon: 'lucide:user-round',
      label: '个人资料',
      to: '/profile/user-info'
    },
    {
      icon: 'lucide:user-round',
      label: '内容与社交',
      to: '/profile/user-info'
    },
    {
      icon: 'lucide:user-round',
      label: '数据与隐私',
      to: '/profile/user-info'
    }
  ],
  [
    {
      icon: 'lucide:key',
      label: '外观',
      to: '/profile/update-password'
    },
    {
      icon: 'lucide:log-out',
      label: '快捷键',
      to: '/profile/logout'
    }
  ],
  [
    {
      icon: 'lucide:key',
      label: '修改密码',
      to: '/profile/update-password'
    },
    {
      icon: 'lucide:log-out',
      label: '退出登录',
      to: '/profile/logout'
    }
  ]
]
const { userInfo } = storeToRefs(useUserInfoStore())
const router = useRouter()
</script>
