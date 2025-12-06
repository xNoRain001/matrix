<template>
  <UBadge
    v-if="targetProfile.gender !== 'other' || targetProfile.birthday"
    :label="`${targetProfile.gender !== 'other' ? useTransformGender(targetProfile.gender) : ''}${targetProfile.birthday ? `${targetProfile.gender !== 'other' ? ' · ' : ''}${useComputeAge(targetProfile.birthday)} 岁` : ''}`"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.mbti"
    :label="targetProfile.mbti"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.birthday"
    :label="useComputeZodiacSign(targetProfile.birthday)"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.college"
    :label="targetProfile.college"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.province"
    :label="`${targetProfile.province}${targetProfile.city ? ` · ${targetProfile.city}` : ''}`"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.tags.length"
    v-for="tag in targetProfile.tags"
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
