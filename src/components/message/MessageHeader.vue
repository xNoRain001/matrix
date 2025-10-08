<template>
  <UDashboardNavbar :toggle="false" :ui="{ root: 'bg-default border-none' }">
    <template #title>
      <UUser
        @click="toSpace"
        class="absolute left-1/2 -translate-x-1/2"
        :name="targetProfile.nickname"
        :avatar="{
          alt: targetProfile.nickname[0]
        }"
        size="xl"
        :chip="{
          color: targetProfile.online ? 'primary' : 'error'
        }"
      />
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
      ></UBadge>
    </template>
    <template #right>
      <UButton
        v-if="isMatch && isMobile"
        :icon="open ? 'lucide:chevrons-up' : 'lucide:chevrons-down'"
        color="neutral"
        variant="ghost"
        @click="open = !open"
      />
      <MessageDropdownMenu
        :is-match="isMatch"
        :target-id="targetId"
        :target-profile="targetProfile"
      ></MessageDropdownMenu>
    </template>
  </UDashboardNavbar>

  <UCollapsible
    v-if="isMatch && isMobile"
    v-model:open="open"
    class="border-default cursor-pointer border-b"
    @click="toSpace"
    :ui="{
      content: 'space-y-4 sm:space-y-6 p-4 sm:p-6 '
    }"
  >
    <template #content>
      <UAvatarGroup size="xl">
        <UAvatar :alt="userInfo.profile.nickname[0]" />
        <UAvatar :alt="targetProfile.nickname[0]" />
      </UAvatarGroup>

      <div class="space-y-2 space-x-2">
        <ProfileSpaceTags :target-profile="targetProfile"></ProfileSpaceTags>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import OverlayProfileSpace from '../overlay/OverlayProfileSpace.vue'
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
