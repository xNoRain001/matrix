<template>
  <UDashboardNavbar
    :toggle="false"
    :ui="{
      left: 'flex-1',
      title: 'flex-1 flex justify-center'
    }"
  >
    <template #title>
      <span
        @click="
          !activeSpaceTargetIds.has(targetId) &&
          profileSpaceOverlay.open({
            targetId
          })
        "
        class="cursor-pointer truncate"
      >
        {{ targetNickname }}
      </span>
    </template>
    <template #leading>
      <UButton
        icon="lucide:chevron-left"
        color="neutral"
        variant="ghost"
        @click="emit('close')"
      />
      <UBadge
        v-if="unreadMsgCounter && (isMobile || (!isMobile && isMatch))"
        :label="unreadMsgCounter"
        size="sm"
      />
    </template>
    <template #right>
      <MatchToChatChatDropdownMenu
        @close="emit('close')"
        :is-match="isMatch"
        :target-id="targetId"
      />
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'

withDefaults(
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
const { isMobile } = storeToRefs(useUserStore())
const { unreadMsgCounter, activeSpaceTargetIds } = storeToRefs(
  useRecentContactsStore()
)
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)
</script>
