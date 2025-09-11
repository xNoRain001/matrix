<template>
  <UDashboardNavbar :toggle="false" :ui="{ root: 'bg-default border-none' }">
    <template #title>
      <UUser
        class="absolute left-1/2 -translate-x-1/2"
        :name="targetNickname"
        :avatar="{
          alt: targetNickname[0]
        }"
        :chip="{
          color: 'primary'
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
    </template>
    <template #right>
      <UButton
        :icon="open ? 'lucide:chevrons-up' : 'lucide:chevrons-down'"
        color="neutral"
        variant="ghost"
        @click="open = !open"
      />
      <MessageDropdownMenu :target-id="targetId"></MessageDropdownMenu>
    </template>
  </UDashboardNavbar>

  <UCollapsible v-model:open="open" class="border-default border-b sm:px-2">
    <template #content>
      <div class="grid gap-y-2 px-4 py-4 text-sm">
        <div class="flex items-center gap-1.5">
          <UIcon name="lucide:user-round" class="text-primary size-5"></UIcon>
          <p class="text-muted">
            性别：<span class="text-highlighted">{{
              useTransformGender(targetGender)
            }}</span>
          </p>
        </div>
        <div class="flex items-center gap-1.5">
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
        <div class="flex items-center gap-1.5">
          <UIcon name="lucide:activity" class="text-primary size-5"></UIcon>
          <p class="text-muted">
            地区：<span class="text-highlighted">{{ targetRegion }}</span>
          </p>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useTransformGender } from '@/hooks'
import { useMatchStore, useRecentContactsStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{ targetId: string; isMatch?: boolean }>(),
  {
    isMatch: false
  }
)
const emits = defineEmits(['close'])
const open = ref(props.isMatch ? true : false)
const { lastMsgMap, contactProfileMap } = storeToRefs(useRecentContactsStore())
const { matchRes } = storeToRefs(useMatchStore())
const targetNickname = computed(() =>
  props.isMatch
    ? matchRes.value.nickname
    : lastMsgMap.value[props.targetId]?.profile?.nickname ||
      contactProfileMap.value[props.targetId].profile.nickname
)
const targetRegion = computed(() =>
  props.isMatch
    ? matchRes.value.region
    : lastMsgMap.value[props.targetId]?.profile?.region ||
      contactProfileMap.value[props.targetId].profile.region
)
const targetBirthday = computed(
  () =>
    props.isMatch
      ? matchRes.value.birthday
      : // TODO: birthday 为空字符串时会去 contactProfileMap 中取值，而空字符串就是它的值
        lastMsgMap.value[props.targetId]?.profile?.birthday ||
        contactProfileMap.value[props.targetId]?.profile?.birthday
  // contactProfileMap.value[props.targetId].profile.birthday
)
const targetGender = computed(() =>
  props.isMatch
    ? matchRes.value.gender
    : lastMsgMap.value[props.targetId]?.profile?.gender ||
      contactProfileMap.value[props.targetId].profile.gender
)

const computeAge = v => {
  if (!v) {
    return '未知'
  }

  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const day = new Date().getDate()
  const _year = new Date(v).getFullYear()
  const _month = new Date(v).getMonth()
  const _day = new Date(v).getDate()
  const full = _month < month || (_month === month && _day <= day)

  return year - _year - (full ? 0 : 1)
}
</script>
