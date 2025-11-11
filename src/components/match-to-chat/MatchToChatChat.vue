<template>
  <UDashboardPanel id="message-2" :ui="{ root: 'translate-z-0' }">
    <MatchToChatChatHeader
      @close="emits('close')"
      :is-match="isMatch"
      :target-id="targetId"
      :target-profile="targetProfile"
    />
    <!-- 聊天内容 -->
    <MatchToChatChatBody
      :is-match="isMatch"
      :target-id="targetId"
      :target-profile="targetProfile"
    />
    <MatchToChatChatFooter
      :is-match="isMatch"
      :target-id="targetId"
      :target-profile="targetProfile"
    />
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onBeforeMount } from 'vue'
import type { userInfo } from '@/types'

const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    targetId: string
    targetProfile: userInfo['profile']
  }>(),
  {
    isMatch: false
  }
)
const emits = defineEmits(['close'])
const { activeTargetIds } = storeToRefs(useRecentContactsStore())
const { userInfo } = storeToRefs(useUserStore())

onBeforeMount(() => {
  activeTargetIds.value.add(props.targetId)
})

onBeforeUnmount(() => {
  activeTargetIds.value.delete(props.targetId)
})
</script>
