<template>
  <UDashboardPanel
    id="message-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <UDashboardNavbar title="消息">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #trailing>
        <UBadge :label="filteredUsers.length" variant="outline" />
      </template>

      <template #right>
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          :content="false"
          size="xs"
        />
      </template>
    </UDashboardNavbar>

    <MessageList v-model="selectUser" :users="filteredUsers" />
  </UDashboardPanel>

  <MessageView
    v-if="isDesktop && selectUser"
    v-model="selectUser"
    :tmpRoomId="tmpRoomId"
  ></MessageView>
  <div
    v-if="isDesktop && !selectUser"
    class="hidden flex-1 items-center justify-center lg:flex"
  >
    <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
  </div>

  <MMessageView v-if="!isDesktop" v-model="selectUser"></MMessageView>
</template>

<script setup lang="ts">
// @ts-nocheck
import { getCandidates, getContacts } from '@/apis/contact'
import MessageView from '@/components/message/MessageView.vue'
import MMessageView from '@/components/message/MMessageView.vue'
import { useSelectedUserStore } from '@/store'
import type { users } from '@/types'
import { useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const isDesktop = useMediaQuery('(min-width: 768px)')
const tabItems = [
  {
    label: '所有',
    value: 'all'
  },
  {
    label: '未读',
    value: 'unread'
  }
]
const activeTab = ref('all')
// const users = ref([
//   {
//     id: 1,
//     nickname: 'Alex Smith',
//     latestMsg: 'Lorem ipsum dolor sit amet consectetur adipisicing'
//   },
//   {
//     id: 2,
//     nickname: 'Jordan Brown',
//     unread: true,
//     latestMsg:
//       'Unde, libero sit sed voluptas aperiam tempora quos delectus corrupti'
//   },
//   {
//     id: 3,
//     nickname: 'Taylor Green',
//     unread: true,
//     latestMsg:
//       'deserunt, nesciunt illum ipsam quibusdam itaque quo praesentium eaque cumque'
//   },
//   {
//     id: 4,
//     nickname: 'Morgan White',
//     latestMsg: 'dolor sit amet consectetur adipisicing'
//   }
// ])
const users = ref<users>([])
const filteredUsers = computed(() => {
  if (activeTab.value === 'unread') {
    return users.value.filter(user => user.unread)
  }

  return users.value
})
const selectUser = ref(null)
const isMessagePanelOpen = computed({
  get() {
    return Boolean(selectUser.value)
  },
  set(value: boolean) {
    if (!value) {
      selectUser.value = null
    }
  }
})
const { globalSocket } = storeToRefs(useSelectedUserStore())
const tmpRoomId = ref(0)

// 切换消息类型时，如果当前访问的消息类型不符合该类型，取消选中该消息
watch(filteredUsers, v => {
  if (!filteredUsers.value.find(user => user.id === selectUser.value?.id)) {
    selectUser.value = null
  }
})

watch(selectUser, v => {
  if (v) {
    tmpRoomId.value = Math.random() + ''
  }
})

onMounted(async () => {
  const { data } = await getContacts()
  users.value = data || []
})
</script>
