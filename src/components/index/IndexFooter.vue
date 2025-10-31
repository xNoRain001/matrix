<template>
  <div
    class="bg-default fixed bottom-0 h-16 w-full border-t border-t-(--ui-border)"
  >
    <UTabs
      v-model="activeTab"
      variant="link"
      :ui="{
        list: 'flex justify-evenly border-none',
        indicator: 'hidden',
        trigger: 'flex flex-col text-xs'
      }"
      :content="false"
      :items="mobileNavs"
    >
      <template #trailing="{ item: { to } }">
        <UBadge
          v-if="to === '/message' && unreadMsgCounter"
          class="absolute top-0 right-0"
          :label="unreadMsgCounter"
          size="sm"
        />
        <UBadge
          v-if="to === '/contacts' && contactNotifications.length"
          class="absolute top-0 right-0"
          :label="contactNotifications.length"
          size="sm"
        />
        <UBadge
          v-if="to === '/' && homeNotifications.length"
          class="absolute top-0 right-0"
          :label="homeNotifications.length"
          size="sm"
        />
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'
import { useNotificationsStore, useRecentContactsStore } from '@/store'

const { unreadMsgCounter } = storeToRefs(useRecentContactsStore())
const { contactNotifications, homeNotifications } = storeToRefs(
  useNotificationsStore()
)
const mobileNavs = [
  {
    label: '大厅',
    icon: 'lucide:house',
    to: '/',
    value: '/' // tab 的值，默认值为索引
  },
  {
    label: '广场',
    icon: 'lucide:rose',
    to: '/playground',
    value: '/playground'
  },
  {
    label: '好友',
    icon: 'lucide:users-round',
    to: '/contacts',
    value: '/contacts'
  },
  {
    label: '消息',
    icon: 'lucide:message-circle',
    to: '/message',
    value: '/message'
  },
  {
    label: '我的',
    icon: 'lucide:user-round-cog',
    to: '/profile',
    value: '/profile'
  }
]
const route = useRoute()
const router = useRouter()
const activeTab = computed({
  get() {
    return route.path
  },
  set(tab) {
    router.push(tab)
  }
})
</script>
