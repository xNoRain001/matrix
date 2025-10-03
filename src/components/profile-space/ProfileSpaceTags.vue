<template>
  <UBadge
    icon="lucide:user-round"
    :label="`性别：${useTransformGender(targetProfile.gender)}`"
    color="warning"
  ></UBadge>
  <UBadge
    icon="lucide:cake-slice"
    :label="`年龄：${computeAge(targetProfile.birthday)}`"
    color="warning"
  ></UBadge>
  <UBadge
    icon="lucide:ghost"
    :label="`地区：${targetProfile.region || '未知'}`"
    color="warning"
  ></UBadge>
  <UBadge
    v-if="targetProfile.mbti"
    icon="lucide:leaf"
    :label="targetProfile.mbti"
    color="secondary"
  ></UBadge>
  <UBadge
    v-if="targetProfile.tags"
    v-for="tag in targetProfile.tags"
    icon="lucide:tag"
    :key="tag"
    :label="tag"
  ></UBadge>
</template>

<script lang="ts" setup>
import { useTransformGender } from '@/hooks'
import type { userInfo } from '@/types'

defineProps<{
  targetProfile: userInfo['profile']
}>()

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
