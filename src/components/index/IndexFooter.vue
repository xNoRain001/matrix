<template>
  <div class="bg-default border-t-default fixed bottom-0 h-16 w-full border-t">
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
      <template #trailing="{ item: { value } }">
        <UBadge
          v-if="value === '/message' && unreadMsgCounter"
          class="absolute top-0 right-0"
          :label="unreadMsgCounter"
          size="sm"
        />
        <UBadge
          v-if="value === '/contacts' && unreadContactNotificationCount"
          class="absolute top-0 right-0"
          :label="unreadContactNotificationCount"
          size="sm"
        />
        <UBadge
          v-if="value === '/' && unreadHomeNotificationCount"
          class="absolute top-0 right-0"
          :label="unreadHomeNotificationCount"
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
const { unreadHomeNotificationCount, unreadContactNotificationCount } =
  storeToRefs(useNotificationsStore())
const mobileNavs = [
  {
    label: '大厅',
    icon: 'lucide:house',
    value: '/' // tab 的值，默认值为索引
  },
  {
    label: '广场',
    icon: 'lucide:rose',
    value: '/playground'
  },
  {
    label: '好友',
    icon: 'lucide:users-round',
    value: '/contacts'
  },
  {
    label: '消息',
    icon: 'lucide:message-circle',
    value: '/message'
  },
  {
    label: '我的',
    icon: 'lucide:user-round-cog',
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
