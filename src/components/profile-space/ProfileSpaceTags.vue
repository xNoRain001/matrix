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
    :label="`年龄：${computeAge(targetProfile.birthday)}`"
    color="warning"
  ></UBadge>
  <UBadge
    v-if="targetProfile.region"
    icon="lucide:ghost"
    :label="`地区：${targetProfile.region}`"
    color="warning"
  ></UBadge>
  <UBadge
    v-if="targetProfile.birthday"
    icon="lucide:crown"
    :label="getZodiacSign(targetProfile.birthday)"
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

const getZodiacSign = birthday => {
  const date = new Date(birthday)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return '水瓶座'
  }

  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return '双鱼座'
  }

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return '白羊座'
  }

  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return '金牛座'
  }

  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) {
    return '双子座'
  }

  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) {
    return '巨蟹座'
  }

  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return '狮子座'
  }

  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return '处女座'
  }

  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) {
    return '天秤座'
  }

  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) {
    return '天蝎座'
  }

  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) {
    return '射手座'
  }

  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return '摩羯座'
  }
}
</script>
