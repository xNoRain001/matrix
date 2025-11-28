<template>
  <UBadge
    v-if="targetProfile.ocGender || targetProfile.ocAge"
    :label="`${targetProfile.ocGender}${targetProfile.ocAge ? `${targetProfile.ocGender ? ' · ' : ''}${targetProfile.ocAge} 岁` : ''}`"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.ocHeight"
    :label="targetProfile.ocHeight"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.ocMBTI"
    :label="targetProfile.ocMBTI"
    color="secondary"
  />
  <UBadge
    v-if="targetProfile.ocTags.length"
    v-for="tag in targetProfile.ocTags"
    :key="tag"
    :label="tag"
  />
  <UBadge
    v-if="targetProfile.gender !== 'other' || targetProfile.birthday"
    :label="`${targetProfile.gender !== 'other' ? useTransformGender(targetProfile.gender) : ''}${targetProfile.birthday ? `${targetProfile.gender !== 'other' ? ' · ' : ''}${useComputeAge(targetProfile.birthday)} 岁` : ''}`"
    color="warning"
  />
  <UBadge
    v-if="targetProfile.height || targetProfile.weight"
    :label="`${targetProfile.height}${targetProfile.weight ? `${targetProfile.height ? ' · ' : ''}${targetProfile.weight}` : ''}`"
    color="warning"
  />
  <UBadge
    v-if="targetProfile.birthday"
    :label="useComputeZodiacSign(targetProfile.birthday)"
    color="warning"
  />
  <UBadge
    v-if="targetProfile.college"
    :label="targetProfile.college"
    color="warning"
  />
  <UBadge
    v-if="targetProfile.province"
    :label="`${targetProfile.province}${targetProfile.city ? ` · ${targetProfile.city}` : ''}`"
    color="warning"
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
