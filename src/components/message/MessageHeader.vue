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
        :chip="{
          // color: targetProfile.online ? 'primary' : 'error'
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

  <UCollapsible v-model:open="open" class="border-default border-b sm:px-2">
    <template #content>
      <div class="p-4">
        <UAvatarGroup size="3xl" @click="toSpace">
          <UAvatar :alt="userInfo.profile.nickname[0]" />
          <UAvatar :alt="targetProfile.nickname[0]" />
        </UAvatarGroup>

        <div class="mt-4 flex flex-col gap-2 text-sm">
          <div class="flex items-center gap-2">
            <UIcon name="lucide:user-round" class="text-primary size-5"></UIcon>
            <p class="text-muted">
              性别：<span class="text-highlighted">{{
                useTransformGender(targetProfile.gender)
              }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UIcon
              name="lucide:audio-waveform"
              class="text-primary size-5"
            ></UIcon>
            <p class="text-muted">
              年龄：<span class="text-highlighted">{{
                computeAge(targetProfile.birthday)
              }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="lucide:activity" class="text-primary size-5"></UIcon>
            <p class="text-muted">
              地区：<span class="text-highlighted">{{
                targetProfile.region
              }}</span>
            </p>
          </div>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useTransformGender } from '@/hooks'
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

const computeAge = v => {
  if (!v) {
    return '未知'
  }

  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const _year = new Date(v).getFullYear()
  const _month = new Date(v).getMonth()
  const _day = new Date(v).getDate()
  const full = _month < month || (_month === month && _day <= day)

  return year - _year - (full ? 0 : 1)
}
</script>
