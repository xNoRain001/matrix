<template>
  <UDashboardPanel id="home">
    <template #header>
      <IndexHeader v-model="isFilterOverlayOpen"></IndexHeader>
    </template>

    <template #body>
      <IndexPlanets></IndexPlanets>
      <!-- class="from-primary/10 to-default bg-gradient-to-tl from-5%" -->
      <UPageCard
        v-for="({ icon, title, desc, matchType, to }, index) in list"
        :key="index"
        @click="onMatch(matchType, to)"
        :title="title"
        :description="desc"
        :icon="icon"
        orientation="horizontal"
        variant="subtle"
        class="cursor-pointer"
      >
        <!-- <img src="/images/tailwindcss-v4.svg" alt="Tailwind CSS" class="w-full" /> -->
      </UPageCard>
      <router-view v-if="!showCards"></router-view>
    </template>

    <template v-if="isMobile" #footer>
      <div class="h-16"></div>
    </template>
  </UDashboardPanel>
  <!-- 匹配 -->
  <UModal
    v-model:open="matching"
    fullscreen
    title="匹配"
    description=" "
    @after:leave="afterLeave"
    :ui="{ body: 'flex flex-col', description: 'hidden' }"
  >
    <template #body>
      <!-- <UBanner
        class="rounded-lg"
        id="example"
        title="This is a closable banner."
      /> -->
      <div class="flex flex-1 items-center justify-center">
        <UButton
          v-if="offline"
          @click="rematch"
          color="error"
          icon="lucide:wifi-off"
          label="重新匹配"
        ></UButton>
        <div v-else class="flex flex-col items-center text-sm">
          <svg
            class="text-primary size-16"
            fill="currentColor"
            viewBox="0 0 140 64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.262 57.02L7.195 40.723c-5.84-3.976-7.56-12.06-3.842-18.063 3.715-6 11.467-7.65 17.306-3.68l4.52 3.76 2.6-5.274c3.716-6.002 11.47-7.65 17.304-3.68 5.84 3.97 7.56 12.054 3.842 18.062L34.49 56.118c-.897 1.512-2.793 1.915-4.228.9z"
              fill-opacity=".5"
            >
              <animate
                attributeName="fill-opacity"
                begin="0s"
                dur="1.4s"
                values="0.5;1;0.5"
                calcMode="linear"
                repeatCount="indefinite"
              ></animate>
            </path>
            <path
              d="M105.512 56.12l-14.44-24.272c-3.716-6.008-1.996-14.093 3.843-18.062 5.835-3.97 13.588-2.322 17.306 3.68l2.6 5.274 4.52-3.76c5.84-3.97 13.593-2.32 17.308 3.68 3.718 6.003 1.998 14.088-3.842 18.064L109.74 57.02c-1.434 1.014-3.33.61-4.228-.9z"
              fill-opacity=".5"
            >
              <animate
                attributeName="fill-opacity"
                begin="0.7s"
                dur="1.4s"
                values="0.5;1;0.5"
                calcMode="linear"
                repeatCount="indefinite"
              ></animate>
            </path>
            <path
              d="M67.408 57.834l-23.01-24.98c-5.864-6.15-5.864-16.108 0-22.248 5.86-6.14 15.37-6.14 21.234 0L70 16.168l4.368-5.562c5.863-6.14 15.375-6.14 21.235 0 5.863 6.14 5.863 16.098 0 22.247l-23.007 24.98c-1.43 1.556-3.757 1.556-5.188 0z"
            ></path>
          </svg>
          <div v-if="noMatch">当前人数较少，请耐心等待...</div>
          <div v-else>正在匹配中...</div>
        </div>
      </div>
    </template>
  </UModal>
  <!-- 需要提前获取到 icon，否则断网时，icon 加载不出来 -->
  <UIcon hidden name="lucide:wifi-off"></UIcon>
  <!-- 过滤器 -->
  <IndexFilter v-model="isFilterOverlayOpen"></IndexFilter>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchStore, useUserStore, useWebRTCStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useComputeZodiacSign, useIsDeviceOpen } from '@/hooks'

let matchType = ''
const list = [
  {
    icon: 'lucide:message-circle',
    title: '匹配聊天',
    desc: '遇见同频的伙伴',
    matchType: 'chat',
    to: '/chat'
  },
  {
    icon: 'lucide:phone',
    title: '语音聊天',
    desc: '高清音质，实时畅聊无延迟',
    matchType: 'voice-chat',
    to: '/voice-chat'
  }
  // {
  //   icon: 'lucide:video',
  //   title: '视频聊天',
  //   desc: '开发中...',
  //   to: '/'
  // }
]
const isFilterOverlayOpen = ref(false)
const { hasMatchRes, offline, matching, noMatch, filter } =
  storeToRefs(useMatchStore())
const { isMobile, userInfo, globalSocket } = storeToRefs(useUserStore())
const { roomId } = storeToRefs(useWebRTCStore())
const toast = useToast()
const route = useRoute()
const showCards = computed(() => route.path === '/')

const afterLeave = () => {
  // 匹配成功时服务器中会将双方从匹配池中清除，这里不需要再次处理
  if (!hasMatchRes.value) {
    globalSocket.value.emit('exit-match')
  }

  hasMatchRes.value = false
  offline.value = false
  noMatch.value = false
}

const startMatch = () => {
  const _filter = filter.value
  const { activeTab } = _filter
  const isZodiacSign = activeTab === 'zodiacSign'
  const { profile } = userInfo.value
  const { college, birthday } = profile

  if (activeTab === 'college' && !college) {
    toast.add({
      title: '你的个人资料中没有填写学校',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  if (isZodiacSign && !birthday) {
    toast.add({
      title: '你的个人资料中没有填写生日',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  matching.value = true
  // const age = useComputeAge(birthday)
  globalSocket.value.emit(
    'start-match',
    { type: matchType },
    {
      // age: age === '未知' ? '' : age,
      ...(isZodiacSign && { zodiacSign: useComputeZodiacSign(birthday) })
    },
    activeTab,
    _filter[`${activeTab}Form`]
  )
}

// 当匹配时断网会出现重新匹配按钮，点击执行这个函数
const rematch = () => {
  noMatch.value = false
  offline.value = false
  hasMatchRes.value = false
  startMatch()
}

const onMatch = async (_matchType, to) => {
  if (to === '/') {
    return
  }

  if (_matchType === 'voice-chat') {
    if (roomId.value) {
      return toast.add({
        title: '匹配失败，当前正在语音中',
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }

    if (!(await useIsDeviceOpen(toast, 'microphone', '麦克风'))) {
      return
    }
  }

  matchType = _matchType
  startMatch()
}
</script>
