<template>
  <UDashboardNavbar
    :toggle="false"
    :ui="{
      left: 'flex-1',
      title: 'flex-1 flex justify-center'
    }"
  >
    <template #title>
      <span @click="toSpace" class="cursor-pointer truncate">
        {{ targetProfile.nickname }}
      </span>
    </template>
    <template #leading>
      <UButton
        icon="lucide:chevron-left"
        color="neutral"
        variant="ghost"
        class="-ms-1.5"
        @click="emits('close')"
      />
      <UBadge
        v-if="unreadMsgCounter && (isMobile || (!isMobile && isMatch))"
        :label="unreadMsgCounter"
        size="sm"
      />
    </template>
    <template #right>
      <UButton
        v-if="
          isMatch &&
          isMobile &&
          (targetProfile.birthday ||
            targetProfile.province ||
            targetProfile.gender !== 'other' ||
            targetProfile.mbti ||
            targetProfile.tags.length)
        "
        :icon="open ? 'lucide:chevrons-up' : 'lucide:chevrons-down'"
        color="neutral"
        variant="ghost"
        @click="open = !open"
      />
      <ChatDropdownMenu
        @close="emits('close')"
        :is-match="isMatch"
        :target-id="targetId"
        :target-profile="targetProfile"
      />
    </template>
  </UDashboardNavbar>

  <!-- 移动端匹配时，对方的信息 -->
  <UCollapsible
    v-if="
      isMatch &&
      isMobile &&
      (targetProfile.birthday ||
        targetProfile.province ||
        targetProfile.gender !== 'other' ||
        targetProfile.mbti ||
        targetProfile.tags.length)
    "
    v-model:open="open"
    class="border-default cursor-pointer border-b"
    @click="toSpace"
    :ui="{
      content: 'space-y-4 sm:space-y-6 p-4 sm:p-6 bg-elevated/50'
    }"
  >
    <template #content>
      <div class="space-y-2 space-x-2">
        <ProfileSpaceTags :target-profile="targetProfile" />
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import OverlayProfileSpace from '@/components/overlay/OverlayProfileSpace.vue'
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
const open = ref(props.isMatch ? true : false)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { unreadMsgCounter } = storeToRefs(useRecentContactsStore())
const route = useRoute()
const overlay = useOverlay()
const profileSpaceOverlay = overlay.create(OverlayProfileSpace)

const toSpace = () => {
  if (route.path !== '/contacts' && !(props.isMatch && !isMobile.value)) {
    profileSpaceOverlay.open({
      targetId: props.targetId,
      targetProfile: props.targetProfile
    })
  }
}
</script>
