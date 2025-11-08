<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    title=" "
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #content>
      <MatchToChatChat
        @close="emit('close', false)"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import type { userInfo } from '@/types'
import { storeToRefs } from 'pinia'

defineProps<{ targetId: string; targetProfile: userInfo['profile'] }>()
const emit = defineEmits<{ close: [boolean] }>()
const { isMobile } = storeToRefs(useUserStore())
</script>
