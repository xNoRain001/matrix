<template>
  <!-- translate-z-0 用于定位聊天记录滚动到底部和新消息提示的位置 -->
  <UDashboardPanel id="match-to-chat" :ui="{ root: 'translate-z-0' }">
    <MatchToChatChatHeader
      @close="emit('close')"
      :is-match="isMatch"
      :target-id="targetId"
      :target-nickname="targetNickname"
    />
    <!-- 聊天内容 -->
    <MatchToChatChatBody
      :is-match="isMatch"
      :target-id="targetId"
      :target-nickname="targetNickname"
    />
    <MatchToChatChatFooter
      :is-match="isMatch"
      :target-id="targetId"
      :target-nickname="targetNickname"
    />
  </UDashboardPanel>
</template>

<script lang="ts" setup>
import { useRecentContactsStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onBeforeMount } from 'vue'

const props = withDefaults(
  defineProps<{
    isMatch?: boolean
    targetId: string
    targetNickname: string
  }>(),
  {
    isMatch: false
  }
)
const emit = defineEmits(['close'])
const { activeTargetIds } = storeToRefs(useRecentContactsStore())

onBeforeMount(() => {
  activeTargetIds.value.add(props.targetId)
})

onBeforeUnmount(() => {
  activeTargetIds.value.delete(props.targetId)
})
</script>
