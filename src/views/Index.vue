<template>
  <UDashboardPanel id="home">
    <template #header>
      <IndexHeader v-model="isFilterOverlayOpen"></IndexHeader>
    </template>

    <template #body>
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
  >
    <template #body>
      <div class="flex h-full items-center justify-center">
        <UButton
          v-if="offline"
          @click="rematch"
          color="error"
          icon="lucide:wifi-off"
          label="重新匹配"
        ></UButton>
        <div v-else class="flex flex-col items-center text-sm">
          <UIcon
            name="lucide:loader-pinwheel"
            class="size-5 animate-spin"
          ></UIcon>
          <div class="mt-4" v-if="noMatch">暂未匹配到对方，请耐心等待...</div>
          <div class="mt-4" v-else>正在匹配中...</div>
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
import { useIsDeviceOpen } from '@/hooks'

let matchType = ''
const list = [
  {
    icon: 'lucide:message-circle',
    title: '即时聊天',
    desc: '端到端加密，不留痕迹的安全对话',
    matchType: 'chat',
    to: '/chat'
  },
  {
    icon: 'lucide:phone',
    title: '语音聊天',
    desc: '高清音质，实时畅聊无延迟',
    matchType: 'voice-chat',
    to: '/voice-chat'
  },
  {
    icon: 'lucide:video',
    title: '视频聊天',
    desc: '开发中...',
    to: '/'
  }
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
    globalSocket.value.emit('exit-match', matchType)
  }

  hasMatchRes.value = false
  offline.value = false
  noMatch.value = false
}

const startMatch = () => {
  matching.value = true
  const socket = globalSocket.value
  const _filter = filter.value
  socket.emit(
    'join-match',
    matchType,
    userInfo.value.profile,
    _filter[`${_filter.activeTab}Form`]
  )
  socket.emit('start-match', matchType)
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
