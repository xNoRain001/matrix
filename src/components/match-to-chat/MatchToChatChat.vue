<template>
  <UDashboardPanel id="message-2" :ui="{ root: 'translate-z-0' }">
    <MatchToChatChatHeader
      @close="emits('close')"
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
const emits = defineEmits(['close'])
const { activeTargetIds } = storeToRefs(useRecentContactsStore())

onBeforeMount(() => {
  activeTargetIds.value.add(props.targetId)
})

onBeforeUnmount(() => {
  activeTargetIds.value.delete(props.targetId)
})
</script>
