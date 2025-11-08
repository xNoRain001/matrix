<template>
  <UDashboardNavbar title="消息">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #trailing>
      <UBadge v-if="unreadMsgCounter" :label="unreadMsgCounter" size="sm" />
    </template>
    <template #right>
      <UButton
        @click="isLLMSlideoverOpen = true"
        icon="lucide:bot"
        variant="ghost"
      />
      <UButton
        @click="onResetMsgCounter"
        icon="lucide:mail-check"
        variant="ghost"
      />
    </template>
  </UDashboardNavbar>
  <!-- LLM -->
  <MessageLLMSlideover v-model="isLLMSlideoverOpen" />
</template>

<script lang="ts" setup>
import { useGetDB } from '@/hooks'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const isLLMSlideoverOpen = ref(false)
const { unreadMsgCounter, lastMsgMap } = storeToRefs(useRecentContactsStore())
const { userInfo } = storeToRefs(useUserStore())

const onResetMsgCounter = async () => {
  const _lastMsgMap = lastMsgMap.value
  const keys = Object.keys(_lastMsgMap)
  const db = await useGetDB(userInfo.value.id)
  const tx = db.transaction('lastMessages', 'readwrite')

  for (let i = 0, l = keys.length; i < l; i++) {
    const item = _lastMsgMap[keys[i]]
    item.unreadMsgs = 0
    await tx.objectStore('lastMessages').put(JSON.parse(JSON.stringify(item)))
  }

  await tx.done
  unreadMsgCounter.value = 0
}
</script>
