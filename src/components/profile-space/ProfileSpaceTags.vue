<template>
  <UBadge
    v-if="targetProfile.gender !== 'other' || targetProfile.birthday"
    icon="lucide:user-round"
    :label="`${targetProfile.gender !== 'other' ? useTransformGender(targetProfile.gender) : ''}${targetProfile.birthday ? `${targetProfile.gender !== 'other' ? ' · ' : ''}${useComputeAge(targetProfile.birthday)} 岁` : ''}`"
    color="warning"
  />
  <UBadge
    v-if="targetProfile.province"
    icon="lucide:map-pin"
    :label="`${targetProfile.province}${targetProfile.city ? ` · ${targetProfile.city}` : ''}`"
    color="warning"
  />
  <UBadge
    v-if="targetProfile.college"
    icon="lucide:graduation-cap"
    :label="targetProfile.college"
    color="warning"
  />
  <UBadge
    v-if="targetProfile.birthday"
    icon="lucide:heart-pulse"
    :label="useComputeZodiacSign(targetProfile.birthday)"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.mbti"
    icon="lucide:leaf"
    :label="targetProfile.mbti"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.tags.length"
    v-for="tag in targetProfile.tags"
    icon="lucide:tag"
    :key="tag"
    :label="tag"
  />
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
