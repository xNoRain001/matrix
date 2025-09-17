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
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'
import { useRecentContactsStore } from '@/store'

const { unreadMsgCounter, contactNotifications } = storeToRefs(
  useRecentContactsStore()
)
const mobileNavs = [
  {
    label: '大厅',
    icon: 'lucide:bubbles',
    to: '/',
    value: '/' // tab 的值，默认值为索引
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
