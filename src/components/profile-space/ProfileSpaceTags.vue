<template>
  <UBadge
    v-if="targetProfile.gender !== 'other'"
    icon="lucide:user-round"
    :label="`性别：${useTransformGender(targetProfile.gender)}`"
    color="warning"
  ></UBadge>
  <UBadge
    v-if="targetProfile.birthday"
    icon="lucide:cake-slice"
    :label="`年龄：${useComputeAge(targetProfile.birthday)}`"
    color="warning"
  ></UBadge>
  <UBadge
    v-if="targetProfile.province"
    icon="lucide:ghost"
    :label="`地区：${targetProfile.province}${targetProfile.city ? ` - ${targetProfile.city}` : ''}`"
    color="warning"
  ></UBadge>
  <UBadge
    v-if="targetProfile.birthday"
    icon="lucide:crown"
    :label="useComputeZodiacSign(targetProfile.birthday)"
    color="secondary"
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
import {
  useComputeAge,
  useComputeZodiacSign,
  useTransformGender
} from '@/hooks'
import type { userInfo } from '@/types'

defineProps<{
  targetProfile: userInfo['profile']
}>()
</script>
