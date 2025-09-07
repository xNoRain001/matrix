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
        <UBadge v-if="unreadMsgCounter" :label="unreadMsgCounter" size="sm" />
      </template>

      <!-- <template #right>
        <UButton
          v-if="activeTab === 'contact'"
          icon="lucide:plus"
          variant="ghost"
        ></UButton>
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          :content="false"
          size="xs"
        />
      </template> -->
    </UDashboardNavbar>

    <MessageList v-if="lastMsgList.length" v-model="targetId" />
    <div
      v-if="isMobile && !lastMsgList.length"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
    </div>
  </UDashboardPanel>

  <MessageView
    v-if="!isMobile && targetId"
    @close="targetId = ''"
    :target-id="targetId"
  ></MessageView>
  <div
    v-if="!isMobile && !targetId"
    class="flex flex-1 items-center justify-center"
  >
    <UIcon name="lucide:message-circle-more" class="text-dimmed size-32" />
  </div>

  <USlideover
    v-if="isMobile"
    v-model:open="isMessagePanelOpen"
    title=" "
    description=" "
  >
    <template #content>
      <MessageView
        v-if="targetId"
        @close="targetId = ''"
        :target-id="targetId"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { getProfiles } from '@/apis/profile'
import { useRecentContactsStore, useUserStore } from '@/store'
import type { users } from '@/types'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

// const tabItems = [
//   {
//     label: '消息',
//     value: 'message'
//   },
//   {
//     label: '好友',
//     value: 'contact'
//   }
// ]
// const activeTab = ref('message')
const users = ref<users>([])
const { isMobile } = storeToRefs(useUserStore())
const { unreadMsgCounter, targetId, lastMsgMap, lastMsgList } = storeToRefs(
  useRecentContactsStore()
)
const isMessagePanelOpen = computed({
  get() {
    return Boolean(targetId.value)
  },
  set(value: boolean) {
    if (!value) {
      targetId.value = ''
    }
  }
})

const updateProfiles = async (ids, now) => {
  if (!ids.length) {
    return
  }

  const { data: profileMap } = await getProfiles(ids.join('_'))
  const _lastMsgMap = lastMsgMap.value

  for (let i = 0, l = ids.length; i < l; i++) {
    const id = ids[i]
    _lastMsgMap[id] = { ..._lastMsgMap[id], ...profileMap[id] }
  }

  localStorage.setItem('profileMap', JSON.stringify(_lastMsgMap))
  localStorage.setItem('profileMapExpireAt', String(now + 1000 * 60 * 60 * 6))
}

const _getProfiles = async () => {
  const now = Date.now()
  const expired = now > Number(localStorage.getItem('profileMapExpireAt'))

  // 过期，获取所有用户的最新资料
  if (expired) {
    await updateProfiles(lastMsgList.value, now)
  }
}

onMounted(async () => {
  await _getProfiles()
})
</script>
