<template>
  <UDashboardNavbar :toggle="false" :ui="{ root: 'bg-default border-none' }">
    <template #title>
      <UUser
        @click="toSpace"
        class="absolute left-1/2 -translate-x-1/2"
        :name="targetNickname"
        :avatar="{
          alt: targetNickname[0]
        }"
        :chip="{
          color: isOnline ? 'primary' : 'error'
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
      <MessageDropdownMenu :is-match="isMatch"></MessageDropdownMenu>
    </template>
  </UDashboardNavbar>

  <UCollapsible v-model:open="open" class="border-default border-b sm:px-2">
    <template #content>
      <div class="p-4">
        <UAvatarGroup size="3xl" @click="toSpace">
          <UAvatar :alt="userInfo.nickname[0]" />
          <UAvatar :alt="targetNickname[0]" />
        </UAvatarGroup>

        <div class="mt-4 flex flex-col gap-2 text-sm">
          <div class="flex items-center gap-2">
            <UIcon name="lucide:user-round" class="text-primary size-5"></UIcon>
            <p class="text-muted">
              性别：<span class="text-highlighted">{{
                useTransformGender(targetGender)
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
                computeAge(targetBirthday)
              }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="lucide:activity" class="text-primary size-5"></UIcon>
            <p class="text-muted">
              地区：<span class="text-highlighted">{{ targetRegion }}</span>
            </p>
          </div>
        </div>
      </div>
    </template>
  </UCollapsible>

  <!-- 移动端匹配或聊天列表点击对方头像进入的空间 -->
  <USlideover v-model:open="isSpaceSlideoverOpen" title=" " description=" ">
    <template #content>
      <ProfileSpace
        v-if="isSpaceSlideoverOpen"
        @close="isSpaceSlideoverOpen = false"
      ></ProfileSpace>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useTransformGender } from '@/hooks'
import { useMatchStore, useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = withDefaults(defineProps<{ isMatch?: boolean }>(), {
  isMatch: false
})
const emits = defineEmits(['close'])
const open = ref(props.isMatch ? true : false)
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { targetId, lastMsgMap, contactProfileMap, unreadMsgCounter } =
  storeToRefs(useRecentContactsStore())
const { matchRes } = storeToRefs(useMatchStore())
const isSpaceSlideoverOpen = ref(false)
const route = useRoute()
const isMessage = computed(() => route.path === '/message')
const targetNickname = computed(() =>
  props.isMatch
    ? matchRes.value.nickname
    : isMessage.value
      ? lastMsgMap.value[targetId.value].profile.nickname
      : contactProfileMap.value[targetId.value].profile.nickname
)
const targetRegion = computed(() =>
  props.isMatch
    ? matchRes.value.region
    : isMessage.value
      ? lastMsgMap.value[targetId.value].profile.region
      : contactProfileMap.value[targetId.value].profile.region
)
const targetBirthday = computed(() =>
  props.isMatch
    ? matchRes.value.birthday
    : isMessage.value
      ? lastMsgMap.value[targetId.value].profile.birthday
      : contactProfileMap.value[targetId.value].profile.birthday
)
const targetGender = computed(() =>
  props.isMatch
    ? matchRes.value.gender
    : isMessage.value
      ? lastMsgMap.value[targetId.value].profile.gender
      : contactProfileMap.value[targetId.value].profile.gender
)
const isOnline = computed(() =>
  props.isMatch
    ? matchRes.value.online
    : isMessage.value
      ? lastMsgMap.value[targetId.value].online
      : contactProfileMap.value[targetId.value].online
)

const toSpace = () => {
  if (route.path !== '/contacts' && !(props.isMatch && !isMobile.value)) {
    isSpaceSlideoverOpen.value = true
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
